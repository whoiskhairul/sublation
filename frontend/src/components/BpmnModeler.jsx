// src/BpmnModeler.js
import React, { useEffect, useRef, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import axios from "axios"; // Import Axios
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import SaveVersionDialog from "./SaveVersion.jsx";
import Modal from '@mui/material/Modal';

import { Fullscreen, FullscreenExit, ZoomIn, ZoomOut, FitScreen, Replay, NorthWestSharp } from '@mui/icons-material';
import { Tooltip, IconButton } from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import errorIconImg from '../assets/error_icon.png'; // Import error icon image


import config from '../config';
import BpmnToolbar from "./BpmnToolbar";
import NotificationSnackBar from "./NotificationSnackbar";
import { handlePrint } from "../utils/handlePrint";
import './BpmnModeler.css';
import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css';
import lintModule from 'bpmn-js-bpmnlint';
import bpmnlintConfig from '../bpmnlint-packed-config.js';

import { refreshAccessToken } from "./auth";
import saveVersion from "./SaveVersion.jsx";

const DEFAULT_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn:process id="Process_1" isExecutable="false" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BpmnModelerComponent = ({ diagramXml, diagramName, permissions, animatePlacement = false, onAnimationDone }) => {
  const { encryptedID } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const actionParam = searchParams.get('action');

  const [anchorEl, setAnchorEl] = useState(null);
  const [users, setUsers] = useState([]); // Store the list of users
  const [activeUserList, setActiveUserList] = useState([]);

  const containerRef = useRef(null);
  const modelerRef = useRef(null);
  const animationTimeoutsRef = useRef([]);

  const [errorMessages, setErrorMessages] = useState([]);
  const [showErrors, setShowErrors] = useState(actionParam === 'errors'); // Auto-open if action=errors
  const [openOptimizerAuto, setOpenOptimizerAuto] = useState(actionParam === 'optimize'); // Auto-open if action=optimize

  // Sequence animation helper
  const runSequentialPlacementAnimation = () => {
    if (!modelerRef.current) return;
    const elementRegistry = modelerRef.current.get("elementRegistry");
    const canvas = modelerRef.current.get("canvas");

    // Clear any previous animation timers
    animationTimeoutsRef.current.forEach((t) => clearTimeout(t));
    animationTimeoutsRef.current = [];

    const allElements = elementRegistry.getAll();
    const rootElement = canvas.getRootElement();

    // Separate into shapes (events, tasks, gateways) and connections (sequence flows)
    const shapes = [];
    const connections = [];

    allElements.forEach((el) => {
      if (el.id === rootElement.id || el.type === "bpmn:Process" || el.type === "label") return;
      if (el.waypoints) {
        connections.push(el);
      } else {
        shapes.push(el);
      }
    });

    // Sort shapes by execution order: Start Events -> Tasks / Gateways -> End Events, sorted left-to-right (x-coord)
    shapes.sort((a, b) => {
      const isStartA = a.type?.toLowerCase().includes("startevent");
      const isStartB = b.type?.toLowerCase().includes("startevent");
      if (isStartA && !isStartB) return -1;
      if (!isStartA && isStartB) return 1;

      const isEndA = a.type?.toLowerCase().includes("endevent");
      const isEndB = b.type?.toLowerCase().includes("endevent");
      if (isEndA && !isEndB) return 1;
      if (!isEndA && isEndB) return -1;

      return (a.x || 0) - (b.x || 0);
    });

    // Hide all elements initially at the SVG node level
    const orderedElements = [...shapes, ...connections];
    orderedElements.forEach((el) => {
      try {
        canvas.addMarker(el.id, "bpmn-element-hidden");
        const gfx = canvas.getGraphics(el);
        if (gfx) {
          gfx.style.opacity = "0";
          gfx.style.visibility = "hidden";
        }
      } catch (err) {
        console.error("Error hiding BPMN element:", err);
      }
    });

    // Sequentially place each element with staggered delays
    const STEP_DELAY = 220; // ms per symbol
    orderedElements.forEach((el, index) => {
      const timeout = setTimeout(() => {
        try {
          canvas.removeMarker(el.id, "bpmn-element-hidden");
          const gfx = canvas.getGraphics(el);
          if (gfx) {
            gfx.style.visibility = "visible";
            gfx.style.opacity = "1";
          }
          const animClass = el.waypoints ? "bpmn-element-flow-placing" : "bpmn-element-placing";
          canvas.addMarker(el.id, animClass);

          const cleanupTimeout = setTimeout(() => {
            canvas.removeMarker(el.id, animClass);
          }, 700);
          animationTimeoutsRef.current.push(cleanupTimeout);
        } catch (err) {
          console.error("Error animating BPMN element:", err);
        }

        // Once last element appears, notify parent
        if (index === orderedElements.length - 1 && onAnimationDone) {
          onAnimationDone();
        }
      }, (index + 1) * STEP_DELAY);

      animationTimeoutsRef.current.push(timeout);
    });
  };

  // STATE FOR START AND END EVENT ERRORS
  const [diagramWarnings, setDiagramWarnings] = useState("");

  const [modelOpen, setModalOpen] = React.useState(false);
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };



  useEffect(() => {
    modelerRef.current = new BpmnModeler({
      container: containerRef.current,
      width: "100%",
      height: "100%",
      linting: {
        bpmnlint: bpmnlintConfig,
        active: true,
      },
      additionalModules: [
        lintModule,
      ],
    });
    // Expose the modeler instance globally
    window.bpmnModeler = modelerRef.current;

    // Listen to bpmnlint results directly inside the client
    const eventBus = modelerRef.current.get("eventBus");
    const handleLintComplete = (event) => {
      const issues = event.issues || {};
      const formattedErrors = [];
      Object.keys(issues).forEach((elementId) => {
        const elementIssues = issues[elementId] || [];
        elementIssues.forEach((issue) => {
          formattedErrors.push({
            elementId: issue.id || elementId,
            message: issue.message,
            suggestion: issue.rule ? `Rule: ${issue.rule}` : "Fix BPMN syntax or connection flow.",
            category: issue.category || 'error'
          });
        });
      });
      setErrorMessages(formattedErrors);
    };

    eventBus.on("linting.completed", handleLintComplete);

    return () => {
      if (modelerRef.current) {
        eventBus.off("linting.completed", handleLintComplete);
        modelerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!modelerRef.current) return;

    const xmlToLoad = diagramXml || DEFAULT_BPMN_XML;

    modelerRef.current.importXML(xmlToLoad).then(
      () => {
        console.log("BPMN diagram successfully imported or updated.");
        handleRealTimeValidation(); // Initial 
        showDiagramWarnings(); // Check and show warnings on diagram load

        // Cool sequential symbol-by-symbol placement animation for AI-generated diagrams
        if (animatePlacement) {
          try {
            modelerRef.current.get("canvas").zoom("fit-viewport");
          } catch (e) {
            console.warn(e);
          }
          runSequentialPlacementAnimation();
        }
      },
      (err) => {
        console.error("Failed to import BPMN diagram, loading default.", err);

        modelerRef.current.importXML(diagramXml ? diagramXml : DEFAULT_BPMN_XML).then(
          () => {
            console.log("Default BPMN diagram loaded.");
            if (animatePlacement) {
              try {
                modelerRef.current.get("canvas").zoom("fit-viewport");
              } catch (e) {
                console.warn(e);
              }
              runSequentialPlacementAnimation();
            }
          },
          (fallbackErr) => {
            console.error("Failed to load default BPMN diagram.", fallbackErr);
          }
        );
      }
    );
  }, [diagramXml, animatePlacement]);

  const cleanString = (str) => {
    let cleanedStr = str.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanedStr.length > 90) {
      cleanedStr = cleanedStr.substring(0, 90);
    }
    return cleanedStr;
  };

  const socketRoomId = cleanString(encryptedID);

  const socket = useRef(null); // WebSocket reference
  const [cursors, setCursors] = useState({}); // Store other users' cursor positions { [user]: { canvasX, canvasY, color, screenX, screenY } }
  const [peerSelections, setPeerSelections] = useState({}); // Store other users' selected element IDs: { [user]: { elementIds: [], color: '' } }
  const [userColors, setUserColors] = useState({}); // Map username -> color
  const isApplyingRemoteXml = useRef(false);
  const currentViewboxRef = useRef(null);

  const colors = [
    "#2563EB", // Royal Blue
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#EF4444", // Red
    "#14B8A6", // Teal
    "#F97316", // Orange
    "#6366F1"  // Indigo
  ];

  const userColor = useRef(colors[Math.floor(Math.random() * colors.length)]); // Unique color for current user

  const localStorageUser = localStorage.getItem('user');
  const localStorageUserObject = localStorageUser ? JSON.parse(localStorageUser) : null;
  // Generate or retrieve a per-tab session ID so multi-tab collaboration works even under the same account
  const tabSessionId = useRef(Math.random().toString(36).substring(2, 7));
  const baseUsername = localStorageUserObject?.username || `Guest_${Math.floor(Math.random() * 1000)}`;
  const userId = useRef(`${baseUsername}#${tabSessionId.current}`);

  // Helper to recompute screen coordinates for all remote cursors whenever local canvas viewbox changes (pan/zoom)
  const updateScreenCursors = (remoteCursorsMap) => {
    if (!modelerRef.current) return remoteCursorsMap;
    try {
      const canvas = modelerRef.current.get('canvas');
      const vb = canvas.viewbox();
      currentViewboxRef.current = vb;

      const updated = {};
      Object.keys(remoteCursorsMap).forEach((user) => {
        const item = remoteCursorsMap[user];
        if (item && item.canvasX !== undefined && item.canvasY !== undefined) {
          const screenX = (item.canvasX - vb.x) * vb.scale;
          const screenY = (item.canvasY - vb.y) * vb.scale;
          updated[user] = {
            ...item,
            screenX: Math.round(screenX),
            screenY: Math.round(screenY),
          };
        }
      });
      return updated;
    } catch (e) {
      return remoteCursorsMap;
    }
  };

  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    let reconnectTimeout = null;
    let pingInterval = null;
    let isCleanedUp = false;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 10;

    const connectWebSocket = () => {
      if (isCleanedUp) return;
      const socketUrl = config.socketBaseurl + '/ws/bpmn/' + socketRoomId + '/';
      console.log('Connecting to WebSocket:', socketUrl);
      const ws = new WebSocket(socketUrl);
      socket.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection opened successfully:', socketUrl);
        setWsConnected(true);
        reconnectAttempts = 0;

        // Announce user presence
        ws.send(JSON.stringify({
          action: 'user_joined',
          user: userId.current,
          color: userColor.current,
        }));

        // Keepalive heartbeat ping every 25 seconds
        if (pingInterval) clearInterval(pingInterval);
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ action: 'ping' }));
            } catch (e) {
              console.warn('WebSocket ping failed:', e);
            }
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (err) {
          return;
        }

        if (data.action === 'pong') {
          // Heartbeat pong received, connection is healthy
          return;
        }

        const commandStack = modelerRef.current?.get('commandStack');
        const elementRegistry = modelerRef.current?.get('elementRegistry');
        const canvas = modelerRef.current?.get('canvas');

        if (data.action === 'update_cursor' && data.user !== userId.current) {
          if (data.color) {
            setUserColors((prev) => ({ ...prev, [data.user]: data.color }));
          }
          setCursors((prev) => {
            let screenX = data.position.x;
            let screenY = data.position.y;
            try {
              if (canvas) {
                const vb = canvas.viewbox();
                screenX = (data.position.x - vb.x) * vb.scale;
                screenY = (data.position.y - vb.y) * vb.scale;
              }
            } catch (e) { }

            return {
              ...prev,
              [data.user]: {
                canvasX: data.position.x,
                canvasY: data.position.y,
                screenX: Math.round(screenX),
                screenY: Math.round(screenY),
                color: data.color,
              },
            };
          });
        } else if (data.action === 'remove_cursor') {
          setCursors((prev) => {
            const updatedCursors = { ...prev };
            delete updatedCursors[data.user];
            return updatedCursors;
          });
        } else if (data.action === 'element_selected' && data.user !== userId.current) {
          setPeerSelections((prev) => ({
            ...prev,
            [data.user]: {
              elementIds: data.elementIds || [],
              color: data.color || '#2563EB',
            },
          }));

          if (canvas) {
            try {
              (data.elementIds || []).forEach((elId) => {
                try {
                  canvas.addMarker(elId, 'peer-selected');
                  const gfx = canvas.getGraphics(elId);
                  if (gfx) {
                    gfx.style.setProperty('--peer-color', data.color || '#2563EB');
                  }
                } catch (e) { }
              });
            } catch (e) { }
          }
        } else if (data.action === 'element_deselected' && data.user !== userId.current) {
          if (canvas) {
            try {
              (data.elementIds || []).forEach((elId) => {
                try {
                  canvas.removeMarker(elId, 'peer-selected');
                } catch (e) { }
              });
            } catch (e) { }
          }
          setPeerSelections((prev) => {
            const updated = { ...prev };
            delete updated[data.user];
            return updated;
          });
        } else if (data.action === 'update_xml' && data.user !== userId.current) {
          isApplyingRemoteXml.current = true;
          modelerRef.current?.importXML(data.xml).then(
            () => {
              console.log("BPMN diagram updated with remote collaborator XML.");
              handleRealTimeValidation();
              setTimeout(() => {
                isApplyingRemoteXml.current = false;
              }, 100);
            },
            (err) => {
              console.error("Failed to update BPMN diagram with new XML data.", err);
              isApplyingRemoteXml.current = false;
            }
          );
        } else if (data.action === 'update_element') {
          const existingElement = elementRegistry?.get(data.element.id);
          if (existingElement) {
            commandStack.execute('element.updateProperties', {
              element: existingElement,
              properties: data.element.properties,
            });
          } else {
            const rootElement = modelerRef.current?.get('canvas').getRootElement();
            commandStack.execute('shape.create', {
              parent: rootElement,
              shape: {
                id: data.element.id,
                type: data.element.type,
                x: data.element.position.x,
                y: data.element.position.y,
                businessObject: modelerRef.current?.get('moddle').create(data.element.type),
              },
            });
          }
        } else if (data.action === 'remove_element') {
          const elementToRemove = elementRegistry?.get(data.elementId);
          if (elementToRemove) {
            commandStack.execute('elements.delete', {
              elements: [elementToRemove],
            });
          }
        } else if (data.action === 'user_joined' && data.user !== userId.current) {
          setUsers((prev) => {
            if (!prev.includes(data.user)) {
              return [...prev, data.user];
            }
            return prev;
          });
          if (data.color) {
            setUserColors((prev) => ({ ...prev, [data.user]: data.color }));
          }
          setNotifMessage(`${data.user} has joined the session.`);
          setNotifSeverity('info');
          setOpen(true);
        } else if (data.action === 'user_left') {
          setUsers((prev) => prev.filter((user) => user !== data.user));
          setCursors((prev) => {
            const updatedCursors = { ...prev };
            delete updatedCursors[data.user];
            return updatedCursors;
          });
          setPeerSelections((prev) => {
            const userSel = prev[data.user];
            if (userSel && canvas) {
              (userSel.elementIds || []).forEach((elId) => {
                try {
                  canvas.removeMarker(elId, 'peer-selected');
                } catch (e) { }
              });
            }
            const updated = { ...prev };
            delete updated[data.user];
            return updated;
          });
          setNotifMessage(`${data.user} has left the session.`);
          setNotifSeverity('info');
          setOpen(true);
        }
      };

      ws.onerror = (error) => {
        console.warn('WebSocket error observed:', error);
      };

      ws.onclose = (event) => {
        setWsConnected(false);
        if (pingInterval) clearInterval(pingInterval);

        if (!isCleanedUp) {
          // Exponential backoff reconnect: 1s, 2s, 4s, up to 10s
          reconnectAttempts += 1;
          if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 10000);
            console.log(`WebSocket disconnected. Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
            reconnectTimeout = setTimeout(connectWebSocket, delay);
          } else {
            console.warn('Max WebSocket reconnect attempts reached.');
          }
        }
      };
    };

    connectWebSocket();

    let lastCursorUpdate = 0;
    const handleMouseMove = (event) => {
      const now = Date.now();
      if (now - lastCursorUpdate < 80) return; // Smooth 12 updates/sec throttle
      lastCursorUpdate = now;

      if (!modelerRef.current) return;
      const canvas = modelerRef.current.get('canvas');
      const container = modelerRef.current._container;
      if (!canvas || !container) return;

      const boundingRect = container.getBoundingClientRect();
      const screenX = event.clientX - boundingRect.left;
      const screenY = event.clientY - boundingRect.top;

      // Transform screen coordinates into diagram canvas coordinates
      const vb = canvas.viewbox();
      const canvasX = vb.x + (screenX / vb.scale);
      const canvasY = vb.y + (screenY / vb.scale);

      // Broadcast canvas cursor position
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(
          JSON.stringify({
            action: 'update_cursor',
            user: userId.current,
            position: { x: Math.round(canvasX), y: Math.round(canvasY) },
            color: userColor.current,
          })
        );
      }
    };

    const handleModelerChange = async () => {
      if (!modelerRef.current || isApplyingRemoteXml.current) return;
      try {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
          socket.current.send(JSON.stringify({ action: 'update_xml', xml, user: userId.current }));
        }
        handleRealTimeValidation();
      } catch (error) {
        console.error("Failed to send BPMN XML via WebSocket:", error);
      }
    };

    // Broadcast element selection footprint
    let previousSelectedIds = [];
    const handleSelectionChanged = (event) => {
      if (!socket.current || socket.current.readyState !== WebSocket.OPEN) return;
      const newSelected = (event.newSelection || []).map((el) => el.id);

      const deselected = previousSelectedIds.filter((id) => !newSelected.includes(id));
      if (deselected.length > 0) {
        socket.current.send(
          JSON.stringify({
            action: 'element_deselected',
            user: userId.current,
            elementIds: deselected,
          })
        );
      }

      if (newSelected.length > 0) {
        socket.current.send(
          JSON.stringify({
            action: 'element_selected',
            user: userId.current,
            elementIds: newSelected,
            color: userColor.current,
          })
        );
      }

      previousSelectedIds = newSelected;
    };

    // Recompute screen positions when local viewport pans or zooms
    const handleViewboxChanged = () => {
      setCursors((prev) => updateScreenCursors(prev));
    };

    const registerModelerEvents = () => {
      if (modelerRef.current) {
        const eventBus = modelerRef.current.get('eventBus');
        eventBus.on('commandStack.changed', handleModelerChange);
        eventBus.on('selection.changed', handleSelectionChanged);
        eventBus.on('canvas.viewbox.changed', handleViewboxChanged);
        modelerRef.current._container.addEventListener('mousemove', handleMouseMove);
      }
    };

    registerModelerEvents();

    return () => {
      isCleanedUp = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pingInterval) clearInterval(pingInterval);

      if (modelerRef.current) {
        const eventBus = modelerRef.current.get('eventBus');
        eventBus.off('commandStack.changed', handleModelerChange);
        eventBus.off('selection.changed', handleSelectionChanged);
        eventBus.off('canvas.viewbox.changed', handleViewboxChanged);
        modelerRef.current._container?.removeEventListener('mousemove', handleMouseMove);
      }
      if (socket.current) {
        if (socket.current.readyState === WebSocket.OPEN) {
          try {
            socket.current.send(JSON.stringify({ action: 'user_left', user: userId.current }));
          } catch (e) { }
          socket.current.close();
        }
      }
    };
  }, [socketRoomId]);


  const handleZoomIn = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas');
    const zoom = canvas.zoom();
    canvas.zoom(zoom + 0.1);
  };

  const handleZoomOut = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas');
    const zoom = canvas.zoom();
    canvas.zoom(zoom - 0.1);
  };

  const handleFitToView = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas');
    canvas.zoom('fit-viewport');
  };

  const handleUndo = () => {
    if (!modelerRef.current) return;
    const commandStack = modelerRef.current.get('commandStack');
    if (commandStack.canUndo()) {
      commandStack.undo();
    }
  };


  const handleRedo = () => {
    if (!modelerRef.current) return;
    const commandStack = modelerRef.current.get('commandStack');
    if (commandStack.canRedo()) {
      commandStack.redo();
    }
  };

  const handleSave = () => {
    if (!modelerRef.current) return;

    modelerRef.current.saveXML({ format: true }).then(
      async ({ xml }) => {
        try {
          const { svg } = await modelerRef.current.saveSVG({ format: true });
          const token = await refreshAccessToken()
          const url = config.apiBaseUrl + "/bpmn/update-diagram/" + encryptedID;
          const response = await axios.put(
            url,
            {
              bpmn_xml: xml,
              bpmn_svg: svg,
              encrypted_id: encryptedID
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true, // Include cookies if necessary
            }
          );

          if (response.status === 200) {
            const reply = response.data.reply;
            setNotifMessage(reply);
            setNotifSeverity('success');
            setOpen(true);
          }
          else {
            console.error("Failed to save BPMN XML to the server.");
          }
        } catch (error) {

          // console.error("Failed to save BPMN XML:", error.response.status);
          const reply = error.response.data.reply ? error.response.data.reply : 'Something went wrong.';
          setNotifMessage(reply);
          setNotifSeverity('error');
          setOpen(true);

        }
      },
      (err) => {
        console.error("Error saving BPMN XML:", err);
      }
    );
  };
  const [open, setOpen] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [notifSeverity, setNotifSeverity] = useState('success');

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;  // ignore if user clicks away
    }
    setOpen(false);
  };

  const handleReset = () => {
    if (!modelerRef.current) return;

    // Get the command stack
    const commandStack = modelerRef.current.get('commandStack');
    const modeling = modelerRef.current.get('modeling');
    const elementRegistry = modelerRef.current.get('elementRegistry');

    // Clear the current diagram through the command stack
    const elements = elementRegistry.getAll();
    modeling.removeElements(elements);

    // Import the default diagram using modeling operations
    modelerRef.current.importXML(DEFAULT_BPMN_XML).then(
      () => {
        // This will now be part of the command stack
        console.log("BPMN editor reset to default diagram.");

        // Add this reset action to command stack
        commandStack.clear();
      },
      (err) => {
        console.error("Failed to reset BPMN editor.", err);
      }
    );
  };

  const handleNewDiagram = (newXml) => {
    if (!modelerRef.current) return;

    // Clear the command stack before importing
    const commandStack = modelerRef.current.get('commandStack');
    commandStack.clear();

    modelerRef.current.importXML(newXml).then(
      () => {
        setNotifMessage('BPMN Diagram has been successfully imported.');
        setNotifSeverity('success');
        setOpen(true);
      },
      (err) => {
        console.error("Failed to load new BPMN diagram.", err);
        setNotifMessage('Failed to load new BPMN diagram.');
        setNotifSeverity('error');
        setOpen(true);
      }
    );
  };

  useEffect(() => {
    const handleKeyPress = async (event) => {
      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        handlePrintClick();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);


  const handlePrintClick = async () => {

    handlePrint(modelerRef, diagramName);
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // REAL-TIME VALIDATION VIA BPMNLINT (100% CLIENT-SIDE, 0MS LATENCY)
  const handleRealTimeValidation = async () => {
    if (!modelerRef.current) return;
    try {
      const linting = modelerRef.current.get("linting", false);
      if (linting) {
        linting.lint();
      }
    } catch (error) {
      console.warn("Client linting check:", error);
    }
  };

  // Function to check if the diagram has Start and End events
  // CHECK FOR START AND END EVENT COMPLETENESS
  const checkDiagramCompleteness = () => {
    if (!modelerRef.current) return { hasStartEvent: false, hasEndEvent: false };

    const elementRegistry = modelerRef.current.get("elementRegistry");
    const elements = elementRegistry.getAll();

    const hasStartEvent = elements.some(
      (element) => element.type === "bpmn:StartEvent"
    );
    const hasEndEvent = elements.some(
      (element) => element.type === "bpmn:EndEvent"
    );

    let warningMessage = "";
    if (!hasStartEvent && !hasEndEvent) {
      warningMessage = "Warning: The diagram is missing both Start and End events.";
    } else if (!hasStartEvent) {
      warningMessage = "Warning: The diagram is missing a Start event.";
    } else if (!hasEndEvent) {
      warningMessage = "Warning: The diagram is missing an End event.";
    }

    setDiagramWarnings(warningMessage); // Update the state
    return { hasStartEvent, hasEndEvent };
  };
  const navigate = useNavigate();


  const onTimeLineClickHandler = () => {
    //route to  /bpmn-versions/:encryptedID
    // window.location.href = `/bpmn-versions/${encryptedID}`;
    navigate(`/bpmn-versions/${encryptedID}`);

  };


  const showDialogToSaveVersion = () => {
    handleOpenModal();
  }



  const handleSaveAS = async (data) => {


    if (!modelerRef.current) return;

    modelerRef.current.saveXML({ format: true }).then(
      async ({ xml }) => {
        try {
          const { svg } = await modelerRef.current.saveSVG({ format: true });
          const token = await refreshAccessToken()
          console.log('data:', data);
          console.log('token:', token);
          console.log('xml:', xml);
          console.log('svg:', svg);
          //
          // diagram_id = request.data.get('diagram_id')
          // new_bpmn_xml = request.data.get('bpmn_xml')
          // version_name = request.data.get('version_name')

          const formData = new FormData();
          formData.append("diagram_id", encryptedID);
          formData.append("bpmn_xml", xml);
          formData.append("version_name", data);

          const url = config.apiBaseUrl + "/bpmn/save-diagram-version/";
          const response = await axios.post(
            url,
            {
              diagram_id: encryptedID,
              bpmn_xml: xml,
              version_name: data,
              svg: svg
            },
            {
              headers: {
                "Authorization": `Bearer ${token}`, // Bearer token in headers
                "Content-Type": "application/json",
              }
            }
          );

          if (response.status === 200) {
            console.log("Response:", response.data);
            setNotifMessage(`BPMN Diagram saved as ${data}.`);
            setNotifSeverity('success');
            setOpen(true);
          } else {
            console.error("Failed to save BPMN XML to the server.");
            setNotifSeverity('error');
            setNotifMessage(`Failed to save.`);
            setOpen(true);
          }

        } catch (error) {
          console.log("Error saving BPMN XML:", error);
          setNotifSeverity('error');
          setNotifMessage(`Failed to save.`);
          setOpen(true);

        }
      },
      (err) => {
        console.error("Error saving BPMN XML:", err);
      }
    );
  }


  // Function to display warnings if Start or End events are missing
  const showDiagramWarnings = () => {
    const { hasStartEvent, hasEndEvent } = checkDiagramCompleteness();

    // Get or create the warning container
    let warningContainer = document.getElementById("diagram-warning");
    if (!warningContainer) {
      warningContainer = document.createElement("div");
      warningContainer.id = "diagram-warning";
      warningContainer.style.position = "absolute";
      warningContainer.style.top = "0";
      warningContainer.style.left = "0";
      warningContainer.style.width = "100%";
      warningContainer.style.backgroundColor = "red";
      warningContainer.style.color = "white";
      warningContainer.style.textAlign = "center";
      warningContainer.style.padding = "10px";
      warningContainer.style.zIndex = "1000";
      document.body.appendChild(warningContainer);
    }

    // Update the warning message
    if (!hasStartEvent && !hasEndEvent) {
      warningContainer.innerText = "Warning: The diagram is missing both Start and End events.";
    } else if (!hasStartEvent) {
      warningContainer.innerText = "Warning: The diagram is missing a Start event.";
    } else if (!hasEndEvent) {
      warningContainer.innerText = "Warning: The diagram is missing an End event.";
    } else {
      warningContainer.innerText = ""; // Clear the warning if no issues
      warningContainer.style.display = "none"; // Hide the warning container
      return;
    }

    // Show the container
    warningContainer.style.display = "block";
  };

  const [optimizedXml, setOptimizedXml] = useState('');
  useEffect(() => {
    if (!optimizedXml || !modelerRef.current) return;
    
    try {
      const commandStack = modelerRef.current.get('commandStack');
      if (commandStack) commandStack.clear();
    } catch (e) {
      console.warn("Could not clear commandStack:", e);
    }

    modelerRef.current.importXML(optimizedXml).then(
      async () => {
        try {
          const canvas = modelerRef.current.get('canvas');
          if (canvas) canvas.zoom('fit-viewport');
        } catch (e) {
          console.warn("Could not zoom canvas to fit:", e);
        }

        handleRealTimeValidation();
        showDiagramWarnings();

        setNotifMessage('Optimized BPMN Diagram successfully applied to canvas.');
        setNotifSeverity('success');
        setOpen(true);

        // Auto-save the applied optimization (XML + SVG) to the server
        try {
          const { svg } = await modelerRef.current.saveSVG({ format: true });
          const token = await refreshAccessToken();
          const url = config.apiBaseUrl + "/bpmn/update-diagram/" + encryptedID;
          await axios.put(
            url,
            {
              bpmn_xml: optimizedXml,
              bpmn_svg: svg,
              encrypted_id: encryptedID
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );
        } catch (saveErr) {
          console.warn("Could not auto-save applied optimization:", saveErr);
        }
      },
      (err) => {
        console.error("Failed to load optimized BPMN diagram.", err);
        setNotifMessage('Failed to render optimized BPMN diagram. Please verify diagram structure.');
        setNotifSeverity('error');
        setOpen(true);
      }
    );
  }, [optimizedXml]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "85vh" }}>
      <div style={{ position: "relative" }}>
        {/* Toolbar */}
        <Modal open={modelOpen} onClose={handleCloseModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          {/*<SaveVersionDialog*/}
          {/*    isOpen={modelOpen}*/}
          {/*    onClose={handleCloseModal}*/}
          {/*    onSubmit={handleSaveAS}*/}
          {/*/>*/}
          <SaveVersionDialog
            isOpen={modelOpen}
            onClose={handleCloseModal}
            onSubmit={handleSaveAS}
          />
        </Modal>



        <BpmnToolbar
          diagramName={diagramName}
          permissions={permissions}
          onNewDiagram={handleNewDiagram}
          onSaveClick={handleSave}
          onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset}
          onUndo={handleUndo} onRedo={handleRedo}
          onPrint={handlePrintClick}
          users={users}
          showUsers={showUsers}
          setShowUsers={setShowUsers}
          onTimeLineClick={onTimeLineClickHandler}
          onSaveAsClick={showDialogToSaveVersion}
          onOptimizedXml={setOptimizedXml}
          initialOpenOptimizer={openOptimizerAuto}
        />
        {/* START AND END EVENT ERRORS */}
        {/* {diagramWarnings && (
          <div
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "7px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {diagramWarnings}
          </div>
        )} */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            border: "1px solid #ccc",
            height: "75vh",
            position: "relative",
            backgroundColor: "white",
            backgroundImage: "radial-gradient(circle, #dbdbdb 1px, rgba(0, 0, 0, 0) 1px)",
            backgroundSize: "20px 20px"
          }}
        >

          {/* Combined Top Header: Presence & Error Indicators */}
          <div className="collab-presence-bar">
            {/* Error Indicator Button */}
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setShowErrors((prev) => !prev)}
                title={errorMessages.length > 0 ? `${errorMessages.length} issue(s) detected` : "No issues"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "3px 10px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: errorMessages.length > 0 ? "#FEE2E2" : "#F0FDF4",
                  color: errorMessages.length > 0 ? "#DC2626" : "#16A34A",
                  border: errorMessages.length > 0 ? "1px solid #FCA5A5" : "1px solid #BBF7D0",
                  transition: "all 0.2s ease"
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: errorMessages.length > 0 ? "#DC2626" : "#16A34A",
                    display: "inline-block"
                  }}
                />
                <span>{errorMessages.length} {errorMessages.length === 1 ? "Issue" : "Issues"}</span>
              </div>

              {/* Display error list dropdown */}
              {showErrors && (
                <div
                  style={{
                    position: "absolute",
                    top: "38px",
                    right: "0",
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    padding: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #E5E7EB",
                    zIndex: 1100,
                    maxHeight: "260px",
                    overflowY: "auto",
                    width: "320px",
                    scrollbarWidth: "thin",
                  }}
                  onMouseLeave={() => setShowErrors(false)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "0.85rem", color: errorMessages.length > 0 ? "#991B1B" : "#065F46" }}>
                      {errorMessages.length > 0 ? `Issues Detected (${errorMessages.length})` : "Diagram is Valid"}
                    </strong>
                    <span
                      onClick={() => setShowErrors(false)}
                      style={{ cursor: "pointer", color: "#9CA3AF", fontSize: "14px" }}
                    >✕</span>
                  </div>
                  {errorMessages.length === 0 ? (
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#16A34A" }}>No syntax or structural issues found.</p>
                  ) : (
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                      {errorMessages.map((error, index) => (
                        <li
                          key={index}
                          style={{
                            padding: "6px 8px",
                            marginBottom: "6px",
                            borderRadius: "6px",
                            backgroundColor: "#FEF2F2",
                            border: "1px solid #FEE2E2",
                            fontSize: "0.8rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <div style={{ color: "#991B1B", fontWeight: 600 }}>
                            {error.message}
                          </div>
                          {error.suggestion && (
                            <div style={{ color: "#6B7280", fontSize: "0.75rem" }}>
                              {error.suggestion}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div style={{ height: "18px", width: "1px", backgroundColor: "#E2E8F0" }}></div>

            <div className="collab-live-badge" style={{ color: wsConnected ? '#10b981' : '#f59e0b' }}>
              <span className="collab-live-dot" style={{ backgroundColor: wsConnected ? '#10b981' : '#f59e0b' }}></span>
              <span>{wsConnected ? 'Live' : 'Connecting...'}</span>
            </div>
            <div className="collab-avatar-stack">
              {/* Current user avatar */}
              <Tooltip title={`${userId.current} (You)`}>
                <div
                  className="collab-avatar-circle"
                  style={{ backgroundColor: userColor.current }}
                >
                  {userId.current ? userId.current.charAt(0).toUpperCase() : 'Y'}
                </div>
              </Tooltip>
              {/* Online collaborators avatars */}
              {users
                .filter((u) => u !== userId.current)
                .map((u) => {
                  const peerColor = userColors[u] || (cursors[u] && cursors[u].color) || '#3B82F6';
                  return (
                    <Tooltip key={u} title={`${u} (Collaborating)`}>
                      <div
                        className="collab-avatar-circle"
                        style={{ backgroundColor: peerColor }}
                      >
                        {u.charAt(0).toUpperCase()}
                      </div>
                    </Tooltip>
                  );
                })}
            </div>
          </div>

          {/* Floating buttons container */}
          <div style={{
            backgroundColor: "#f1f1f1",
            borderRadius: "5px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "5px",
            position: "absolute",
            bottom: "110px",
            right: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 100
          }}>
            <IconButton size="small" style={{ padding: '8px' }} onClick={handleZoomIn}>
              <Tooltip title="Zoom In">
                <ZoomIn style={{ fontSize: '20px' }} />
              </Tooltip>
            </IconButton>
            <IconButton size="small" style={{ padding: '8px' }} onClick={handleZoomOut}>
              <Tooltip title="Zoom Out">
                <ZoomOut style={{ fontSize: '20px' }} />
              </Tooltip>
            </IconButton>
            <IconButton size="small" style={{ padding: '8px' }} onClick={handleFitToView}>
              <Tooltip title="Fit to Screen">
                <FitScreen style={{ fontSize: '20px' }} />
              </Tooltip>
            </IconButton>
            <IconButton size="small" style={{ padding: '8px' }} onClick={handleReset}>
              <Tooltip title="Reset Diagram">
                <Replay style={{ fontSize: '20px' }} />
              </Tooltip>
            </IconButton>
            {isFullscreen ?
              <IconButton size="small" style={{ padding: '8px' }} onClick={handleFullscreen} >
                <Tooltip title="Exit Fullscreen">
                  <FullscreenExit style={{ fontSize: '20px' }} />
                </Tooltip>
              </IconButton> :
              <IconButton size="small" style={{ padding: '8px' }} onClick={handleFullscreen} >
                <Tooltip title="Enter Fullscreen">
                  <Fullscreen style={{ fontSize: '20px' }} />
                </Tooltip>
              </IconButton>
            }
          </div>

          {/* Render peer selection badges on canvas */}
          {Object.keys(peerSelections).map((peerUser) => {
            const selInfo = peerSelections[peerUser];
            if (!selInfo || !selInfo.elementIds || selInfo.elementIds.length === 0) return null;
            const peerColor = selInfo.color || '#2563EB';

            // Find first element's position on canvas
            let badgePos = null;
            try {
              if (modelerRef.current) {
                const elementRegistry = modelerRef.current.get('elementRegistry');
                const canvas = modelerRef.current.get('canvas');
                const vb = canvas.viewbox();
                const firstEl = elementRegistry.get(selInfo.elementIds[0]);
                if (firstEl) {
                  badgePos = {
                    left: Math.round((firstEl.x - vb.x) * vb.scale),
                    top: Math.round((firstEl.y - 24 - vb.y) * vb.scale),
                  };
                }
              }
            } catch (e) { }

            if (!badgePos) return null;

            return (
              <div
                key={`badge-${peerUser}`}
                className="peer-element-badge"
                style={{
                  left: `${badgePos.left}px`,
                  top: `${badgePos.top}px`,
                  backgroundColor: peerColor,
                }}
              >
                <span>✏️ {peerUser}</span>
              </div>
            );
          })}

          {/* Render modern synchronized peer cursors */}
          {Object.keys(cursors).map((user) => {
            const cursorData = cursors[user];
            if (!cursorData || cursorData.screenX === undefined || cursorData.screenY === undefined) return null;
            const peerColor = cursorData.color || '#2563EB';

            return (
              <div
                key={`cursor-${user}`}
                className="peer-cursor-container"
                style={{
                  left: `${cursorData.screenX}px`,
                  top: `${cursorData.screenY}px`,
                }}
              >
                {/* Crisp dynamic SVG cursor pointer */}
                <svg
                  className="peer-cursor-pointer"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ display: "block" }}
                >
                  <path
                    d="M3 3L10.07 19.97L12.58 13.58L18.97 11.07L3 3Z"
                    fill={peerColor}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Sleek collaborator name tag */}
                <span
                  className="peer-cursor-label"
                  style={{ backgroundColor: peerColor }}
                >
                  {user}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <NotificationSnackBar
        open={open}
        onClose={handleClose}
        severity={notifSeverity}
        message={notifMessage}
      />
    </div>
  );
};

export default BpmnModelerComponent;
