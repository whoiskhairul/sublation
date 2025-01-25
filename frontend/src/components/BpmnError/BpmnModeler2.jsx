
import React, { useEffect, useRef, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import axios from "axios"; // Import Axios
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { useParams } from "react-router-dom";

import { Fullscreen, FullscreenExit, ZoomIn, ZoomOut, FitScreen, Replay } from '@mui/icons-material';
import { Tooltip, IconButton } from "@mui/material";



import BpmnToolbar from "../BpmnToolbar";
import NotificationSnackBar from "../NotificationSnackbar";
import { handlePrint } from "../../utils/handlePrint";
import '../BpmnModeler.css';



import { refreshAccessToken } from "../auth";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import errorIconImg from '../../assets/error_icon.png'; // Import error icon image
import config from "../../config";


const DEFAULT_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BpmnModelerComponent = ({ diagramXml, diagramName, permissions }) => {
  const { encryptedID } = useParams();
  const [bpmnXML, setBpmnXML] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const [errorMessages, setErrorMessages] = useState([]);
  // STATE FOR START AND END EVENT ERRORS
  const [diagramWarnings, setDiagramWarnings] = useState("");

  const containerRef = useRef(null);
  const modelerRef = useRef(null);

  useEffect(() => {
    modelerRef.current = new BpmnModeler({
      container: containerRef.current,
      width: "100%",
      height: "100%",
    });

    // Expose the modeler instance globally
    window.bpmnModeler = modelerRef.current;

    modelerRef.current.on("commandStack.changed", handleRealTimeValidation); //real time update 1


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
  console.log('socketRoomId:', socketRoomId.length);
  console.log('encryptedID:', encryptedID);

  useEffect(() => {
    const socketUrl = config.socketBaseurl + '/ws/bpmn/' + socketRoomId + '/';
    socket.current = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBpmnXML(data.xml);  // Update diagram XML

      modelerRef.current.importXML(data.xml).then(
        () => {
          // console.log("BPMN diagram updated with new XML data.");
        },
        (err) => {
          console.error("Failed to update BPMN diagram with new XML data.", err);
        }
      );
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = (event) => {
      console.warn('WebSocket closed:', event);
    };

    const handleModelerChange = async () => {
      // console.log("Modeler change detected.");
      if (!modelerRef.current) return;
      try {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        socket.send(JSON.stringify({ 'xml': xml }));
      } catch (error) {
        console.error("Failed to send BPMN XML via WebSocket:", error);
      }
    };

    const registerModelerChange = () => {
      if (modelerRef.current) {
        const eventBus = modelerRef.current.get('eventBus');
        eventBus.on('commandStack.changed', handleModelerChange);
      }
    };

    registerModelerChange();

    return () => {
      if (modelerRef.current) {
        const eventBus = modelerRef.current.get('eventBus');
        eventBus.off('commandStack.changed', handleModelerChange);
      }
      socket.close();  // Clean up WebSocket when component unmounts
    };
  }, [encryptedID]);

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
          else if (response.status === 500) {
            console.log(response.data.status);

          }
          else {
            console.error("Failed to save BPMN XML to the server.");
          }
        } catch (error) {

          // console.error("Failed to save BPMN XML:", error.response.status);
          const reply = error.response.data.reply;
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
  // useEffect(() => {
  //   if (!modelerRef.current) return;

  //   const eventBus = modelerRef.current.get('eventBus');

  //   const saveChanges = async () => {
  //     try {
  //       const { xml } = await modelerRef.current.saveXML({ format: true });
  //       const { svg } = await modelerRef.current.saveSVG({ format: true });
  //       const token = await refreshAccessToken();

  //       await axios.put(
  //         `http://127.0.0.1:8000/bpmn/save-bpmn/${encryptedID}`,
  //         {
  //           bpmn_xml: xml,
  //           bpmn_svg: svg,
  //           encrypted_id: encryptedID
  //         },
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${token}`,
  //           },
  //           withCredentials: true,
  //         }
  //       );
  //     } catch (error) {
  //       console.error("Auto-save failed:", error);
  //     }
  //   };

  //   // Listen for any changes in the diagram
  //   const onChange = () => {
  //     saveChanges();
  //   };

  //   eventBus.on('commandStack.changed', onChange);

  //   return () => {
  //     eventBus.off('commandStack.changed', onChange);
  //   };
  // }, [encryptedID]);

  // Add these functions before the return statement:
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
  // Real-time validation for BPMN diagram
  // REAL-TIME VALIDATION FOR START AND END EVENT ERRORS
  const handleRealTimeValidation = async () => {
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
            tooltip.style.padding = "5px"; // Reduced padding
            tooltip.style.fontSize = "12px"; // Smaller font size
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
    if (!modelerRef.current) return;

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
  };



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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "85vh" }}>
      <div style={{ position: "relative" }}>
        {/* Toolbar */}
        <BpmnToolbar
          diagramName={diagramName}
          permissions={permissions}
          onNewDiagram={handleNewDiagram}
          onSaveClick={handleSave}
          onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset}
          onUndo={handleUndo} onRedo={handleRedo}
          onPrint={handlePrintClick}
        />
        {/* START AND END EVENT ERRORS */}
        {diagramWarnings && (
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
        )}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            border: "1px solid #ccc",
            height: "75vh",
            position: "relative",
            backgroundColor: "white"
          }}
        >
          {/* Floating buttons container */}
          <div style={{
            backgroundColor: "#f1f1f1",
            borderRadius: "5px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "5px",
            position: "absolute",
            bottom: "125px",
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
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}></Tooltip>
                <Fullscreen style={{ fontSize: '20px' }} />
              </IconButton>

            }
          </div>
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



