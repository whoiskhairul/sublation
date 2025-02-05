// src/BpmnModeler.js
import React, { useEffect, useRef, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import axios from "axios"; // Import Axios
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { useNavigate, useParams } from "react-router-dom";
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



import { refreshAccessToken } from "./auth";
import saveVersion from "./SaveVersion.jsx";

const DEFAULT_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn:process id="Process_1" isExecutable="false" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BpmnModelerComponent = ({ diagramXml, diagramName, permissions }) => {
  const { encryptedID } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const [users, setUsers] = useState([]); // Store the list of users
  const [activeUserList, setActiveUserList] = useState([]);

  const containerRef = useRef(null);
  const modelerRef = useRef(null);

  const [errorMessages, setErrorMessages] = useState([]);
  const [showErrors, setShowErrors] = useState(false); // State to toggle visibility

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
    });
    // Expose the modeler instance globally
    window.bpmnModeler = modelerRef.current;

    const handleModelerUpdate = async () => {
      // Handle real-time validation
      await handleRealTimeValidation();

      // Handle socket update
      if (!modelerRef.current) return;
      try {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
          socket.current.send(JSON.stringify({ action: 'update_xml', xml, user: userId.current }));
        }
      } catch (error) {
        console.error("Failed to send BPMN XML via WebSocket:", error);
      }
    };

    modelerRef.current.on("commandStack.changed", handleModelerUpdate);

    return () => {
      if (modelerRef.current) {
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

      },
      (err) => {
        console.error("Failed to import BPMN diagram, loading default.", err);

        modelerRef.current.importXML(diagramXml ? diagramXml : DEFAULT_BPMN_XML).then(
          () => {
            console.log("Default BPMN diagram loaded.");
          },
          (fallbackErr) => {
            console.error("Failed to load default BPMN diagram.", fallbackErr);
          }
        );
      }
    );
  }, [diagramXml]);

  const cleanString = (str) => {
    let cleanedStr = str.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanedStr.length > 90) {
      cleanedStr = cleanedStr.substring(0, 90);
    }
    return cleanedStr;
  };

  const socketRoomId = cleanString(encryptedID);

  const socket = useRef(null); // WebSocket reference
  const [cursors, setCursors] = useState({}); // Store other users' cursor positions
  const colors = [
    "#FF5733", // Deep Red
    "#33FF57", // Deep Green
    "#3357FF", // Deep Blue
    "#FF33A1", // Deep Pink
    "#FF8C33", // Deep Orange
    "#8C33FF", // Deep Purple
    "#33FFF5", // Deep Cyan
    "#FF3333", // Deep Crimson
    "#33FF8C", // Deep Mint
    "#FF33D4"  // Deep Magenta
  ];

  const userColor = useRef(colors[Math.floor(Math.random() * colors.length)]); // Unique color for the user's cursor

  const localStorageUser = localStorage.getItem('user');
  const localStorageUserObject = localStorageUser ? JSON.parse(localStorageUser) : null;
  const userId = useRef(localStorageUserObject ? localStorageUserObject.username : `Guest_${Math.floor(Math.random() * 1000)}`);


  useEffect(() => {
    // Initialize WebSocket
    const socketUrl = config.socketBaseurl + '/ws/bpmn/' + socketRoomId + '/';
    socket.current = new WebSocket(socketUrl);

    socket.current.onopen = () => {
      console.log('WebSocket connection opened');
      // Wait for next tick to ensure connection is ready
      setTimeout(() => {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
          // Notify others of the new user
          socket.current.send(JSON.stringify({ action: 'user_joined', user: userId.current }));
        }
      }, 0);
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const commandStack = modelerRef.current?.get('commandStack');
      const elementRegistry = modelerRef.current?.get('elementRegistry');

      if (data.action === 'update_cursor' && data.user !== userId.current) {
        // Update cursor position for a user
        setCursors((prev) => ({
          ...prev,
          [data.user]: { x: data.position.x, y: data.position.y, color: data.color },
        }));
      } else if (data.action === 'remove_cursor') {
        // Remove cursor when a user disconnects
        setCursors((prev) => {
          const updatedCursors = { ...prev };
          delete updatedCursors[data.user];
          return updatedCursors;
        });
      } else if (data.action === 'update_xml' && data.user !== userId.current) {
        // Handle BPMN diagram updates
        // console.log(data.user, userId.current);
        modelerRef.current?.importXML(data.xml).then(
          () => {
            console.log("BPMN diagram updated with new XML data.");
            handleRealTimeValidation(); //real time update 1


          },
          (err) => {
            console.error("Failed to update BPMN diagram with new XML data.", err);
          }

        );
      } else if (data.action === 'update_element') {
        // Update or add element via commandStack
        // console.log('update_element:', data);
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
        // Remove an element via commandStack
        const elementToRemove = elementRegistry?.get(data.elementId);
        if (elementToRemove) {
          commandStack.execute('elements.delete', {
            elements: [elementToRemove],
          });
        }
      } else if (data.action === 'user_joined' && data.user !== userId.current) {
        // Add new user to the list
        setUsers((prev) => {
          if (!prev.includes(data.user)) {
            return [...prev, data.user];
          }
          return prev;
        });
        setNotifMessage(`${data.user} has joined the room.`);
        setNotifSeverity('info');
        setOpen(true);
      } else if (data.action === 'user_left') {
        // Remove user from the list
        setUsers((prev) => prev.filter((user) => user !== data.user));
        setCursors((prev) => {
          const updatedCursors = { ...prev };
          delete updatedCursors[data.user];
          return updatedCursors;
        });
        setNotifMessage(`${data.user} has left the room.`);
        setNotifSeverity('info');
        setOpen(true);
      }
    };

    socket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.current.onclose = (event) => {
      console.warn('WebSocket closed:', event);
      // Only attempt to send if the connection is still open
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ action: 'user_left', user: userId.current }));
      }
    };

    const handleMouseMove = (event) => {
      const boundingRect = modelerRef.current._container.getBoundingClientRect();
      const x = event.clientX - boundingRect.left;
      const y = event.clientY - boundingRect.top;

      // Broadcast cursor position
      socket.current.send(
        JSON.stringify({
          action: 'update_cursor',
          user: userId.current,
          position: { x, y },
          color: userColor.current,
        })
      );
    };

    const handleModelerChange = async () => {
      if (!modelerRef.current) return;
      try {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        socket.current.send(JSON.stringify({ action: 'update_xml', xml, user: userId.current }));
        modelerRef.current.on("commandStack.changed", handleRealTimeValidation); //real time update 1
      } catch (error) {
        console.error("Failed to send BPMN XML via WebSocket:", error);
      }
    };

    const registerModelerEvents = () => {
      if (modelerRef.current) {
        const eventBus = modelerRef.current.get('eventBus');
        eventBus.on('commandStack.changed', handleModelerChange);
        modelerRef.current._container.addEventListener('mousemove', handleMouseMove); // Track mouse movements
      }
    };

    registerModelerEvents();

    return () => {
      if (modelerRef.current) {
        const eventBus = modelerRef.current.get('eventBus');
        eventBus.off('commandStack.changed', handleModelerChange);
        modelerRef.current._container.removeEventListener('mousemove', handleMouseMove);
      }
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ action: 'user_left', user: userId.current }));
        socket.current.close();
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
          const reply = error.response.data.reply? error.response.data.reply: 'Something went wrong.';
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

  // REAL-TIME VALIDATION FOR START AND END EVENT ERRORS
  const handleRealTimeValidation = async () => {
    console.log("Real-time validation triggered.");
    if (!modelerRef.current) return;

    const overlays = modelerRef.current.get("overlays");
    const elementRegistry = modelerRef.current.get("elementRegistry");

    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });

      // Create FormData with the XML for validation
      const formData = new FormData();
      const blob = new Blob([xml], { type: "text/xml" });
      formData.append("file", blob, "diagram.bpmn");
      const url = config.apiBaseUrl + "/bpmn-error-detection/validate/";

      const response = await axios.post(
        url,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        const errors = response.data.errors || [];
        setErrorMessages(errors);
        overlays.clear(); // Clear existing overlays

        // Check for Start and End Event Completeness
        checkDiagramCompleteness();

        // Add overlays for errors
        errors.forEach((error) => {
          const element = elementRegistry.get(error.elementId);
          if (element) {
            const errorIcon = document.createElement("img");
            errorIcon.src = errorIconImg;
            errorIcon.alt = "Error Icon";
            errorIcon.style.width = "20px";
            errorIcon.style.height = "20px";
            errorIcon.style.cursor = "pointer";

            const tooltip = document.createElement("div");
            tooltip.style.position = "absolute";
            tooltip.style.backgroundColor = "rgb(243, 239, 117)";
            tooltip.style.color = "black";
            tooltip.style.padding = "10px";
            tooltip.style.borderRadius = "5px";
            tooltip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
            tooltip.style.display = "none";
            tooltip.style.zIndex = "1000";
            tooltip.innerHTML = `
              <strong>Error: ${error.message}</strong><br/>
              <i>Suggestion: ${error.suggestion}</i>
            `;
            document.body.appendChild(tooltip);

            errorIcon.addEventListener("mouseenter", (event) => {
              tooltip.style.display = "block";
              tooltip.style.top = `${event.pageY + 10}px`;
              tooltip.style.left = `${event.pageX + 10}px`;
            });

            errorIcon.addEventListener("mouseleave", () => {
              tooltip.style.display = "none";
            });

            overlays.add(element.id, {
              position: {
                top: -10,
                left: 10,
              },
              html: errorIcon,
            });
          }
        });
      }
    } catch (error) {
      console.error("Error during real-time validation:", error);
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
            }else
            {
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
    if (!optimizedXml) return;
    modelerRef.current.importXML(optimizedXml).then(
        () => {
          setNotifMessage('Optimized BPMN Diagram has been successfully imported.');
          setNotifSeverity('success');
          setOpen(true);
        },
        (err) => {
          console.error("Failed to load optimized BPMN diagram.", err);
          setNotifMessage('Failed to load optimized BPMN diagram.');
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

<div
            className="indicatior-row"
            style={{
              display: "flex",
              flexDirection: "row", // Ensure they are side by side
              position: "absolute", // Position them relative to the diagram-area
              top: "10px", // Adjust to be near the top
              right: "10px", // Adjust to be near the right
              gap: "10px", // Add spacing between the two indicators
              zIndex: 1000, // Ensure they appear above other elements
            }}
          >

            {/* Error Indicator */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              }}
              onClick={() => {
                setShowErrors((prev) => !prev); // Toggle error list visibility
                if (showUsers) setShowUsers(false); // Close user indicator if open
              }}

            >
              ⛔{errorMessages.length} {/* Total number of errors */}
            </div>

      {/* Display error list when toggled */}
      {showErrors && errorMessages.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50px", // Position below the error indicator
            right: "0",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            maxHeight: "200px", // Limit height for long lists
            overflowY: "auto", // Scroll for long lists
            transition: "transform 0.3s ease-in-out",
            width: "300px", // Width of the error list

            /* Scrollbar Styling */
            scrollbarWidth: "thin", // Modern scrollbar for Firefox
            scrollbarColor: "#c0c0c0 #f0f0f0", // Thumb and track colors


          }}
          onMouseLeave={()=>{if (showErrors) setShowErrors(false)}} // Hide error list on mouse leave


        >
          <strong
            style={{
              display: "block",
              marginBottom: "10px",
              fontSize: "1rem",
              color: "#721c24",
            }}
          >
            Errors ({errorMessages.length}): {/* Total number of errors */}
          </strong>
          <ul
            style={{
              listStyleType: "none",
              padding: 0,
              margin: 0,
              overflow: "hidden",
            }}
          >
            {errorMessages.map((error, index) => (
              <li
                key={index}
                style={{
                  color: "#721c24",
                  marginBottom: "10px",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    fontSize: "1rem",
                    color: "#721c24",
                    fontWeight: "bold",
                  }}
                >
                  ⛔
                </span>
                <div>
                  <strong>Element:</strong> {error.elementId || "Unknown"}
                  <br />
                  <strong>Message:</strong> {error.message}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}


            {/* /* User presence indicator */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              }}
            >
              <div
                onClick={() => {
                  setShowUsers((prev) => !prev); // Toggle user list visibility
                  if (showErrors) setShowErrors(false); // Close error indicator if open
                }}

                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                }}
              >
                <strong style={{ color: "#333" }}>👤{users.length}</strong>
              </div>
              {showUsers && (
                <div
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: "0",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    padding: "10px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    zIndex: 1000,
                    transition: "transform 0.3s ease-in-out",

                  }}
                  onMouseLeave={()=>{if (showUsers) setShowUsers(false)}} // Hide user list on mouse leave
                >
                  <strong style={{ display: "block", marginBottom: "5px", color: "#333" }}>
                    Users:
                  </strong>
                  <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                    {users.map((user) => (
                      <li
                        key={user}
                        style={{
                          color: user === userId.current ? "#1976d2" : "#555",
                          fontWeight: user === userId.current ? "bold" : "normal",
                          marginBottom: "5px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: user === userId.current ? "#1976d2" : "#555",
                            marginRight: "8px",
                          }}
                        ></span>
                        {user}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
          {/* /* User presence indicator */}
          {/* <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 1000,
            }}
          >
            <div
              onClick={() => setShowUsers((prev) => !prev)}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              }}
            >
              <strong style={{ color: "#333" }}>{users.length}</strong>
            </div>
            {showUsers && (
              <div
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "0",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  padding: "10px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                  transition: "transform 0.3s ease-in-out",
                }}
              >
                <strong style={{ display: "block", marginBottom: "5px", color: "#333" }}>
                  Users:
                </strong>
                <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                  {users.map((user) => (
                    <li
                      key={user}
                      style={{
                        color: user === userId.current ? "#1976d2" : "#555",
                        fontWeight: user === userId.current ? "bold" : "normal",
                        marginBottom: "5px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: user === userId.current ? "#1976d2" : "#555",
                          marginRight: "8px",
                        }}
                      ></span>
                      {user}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                  <FullscreenExit style={{ fontSize: '20px' }} />
                </Tooltip>
              </IconButton> :
              <IconButton size="small" style={{ padding: '8px' }} onClick={handleFullscreen} >
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                  <Fullscreen style={{ fontSize: '20px' }} />
                </Tooltip>
              </IconButton>

            }
          </div>
          {/* Render other users' cursors */}
          {Object.keys(cursors).map((user) => (
            <div
              key={user}
              style={{
                position: "absolute",
                left: `${cursors[user].x}px`,
                top: `${cursors[user].y}px`,
                pointerEvents: "none",
                zIndex: 1000,
                display: "flex",
                alignItems: "center"
              }}
            >
              <Tooltip title={localStorage.user}>
                {/* <NorthWestSharp style={{ color: cursors[user].color, fontSize: '20px' }} /> */}
                <img src="/arrow-pointer-solid.svg" alt="" style={{width: '15px', height: '15px'}} />

              </Tooltip>
              <span style={{ marginLeft: '5px', color: cursors[user].color, fontSize: '12px' }}>{user}</span>
            </div>
          ))}
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
