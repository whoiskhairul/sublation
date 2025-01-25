
import React, { useEffect, useRef, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import axios from "axios"; // Import Axios
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { useParams } from "react-router-dom";
import BpmnToolbar from "../BpmnToolbar";
import NotificationSnackBar from "../NotificationSnackbar";
import '../BpmnModeler.css';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import errorIconImg from '../../assets/error_icon.png'; // Import error icon image


import { refreshAccessToken } from "../auth";
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

const BpmnModelerComponent = ({ diagramXml }) => {
  const { encryptedID } = useParams();
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

        modelerRef.current.importXML(DEFAULT_BPMN_XML).then(
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




  const handleErrorDetection = async () => {
    if (!modelerRef.current) return;

    const overlays = modelerRef.current.get("overlays");
    const elementRegistry = modelerRef.current.get("elementRegistry");

    try {
      // Save the current BPMN XML from the modeler
      const { xml } = await modelerRef.current.saveXML({ format: true });

      // Create a FormData object to send the file
      const formData = new FormData();
      const blob = new Blob([xml], { type: "text/xml" });
      formData.append("file", blob, "diagram.bpmn");
      const url = config.apiBaseUrl + "/bpmn-error-detection/validate/";

      // Send the BPMN XML to the validation API
      const response = await axios.post(
        url,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        const errors = response.data.errors || [];
        setErrorMessages(errors); // Update error messages in the list

        // Clear existing overlays
        overlays.clear();

        // Add overlays for each error
        errors.forEach((error) => {
          const element = elementRegistry.get(error.elementId); // Use `elementId` returned from the backend
          if (element) {
            const errorIcon = document.createElement("img");
            errorIcon.src = errorIconImg; // Path to your image
            console.log(errorIconImg); // Should output the URL

            errorIcon.alt = "Error Icon";
            errorIcon.style.width = "20px";
            errorIcon.style.height = "20px";
            errorIcon.style.cursor = "pointer";
            errorIcon.removeAttribute("title"); // REMOVE DEFAULT BROWSER TOOLTIP

            // Tooltip container
            const tooltip = document.createElement("div");
            tooltip.style.position = "absolute";
            tooltip.style.backgroundColor = "rgb(243, 239, 117)";
            tooltip.style.color = "black";
            tooltip.style.padding = "10px";
            tooltip.style.borderRadius = "5px";
            tooltip.style.boxShadow = "0 2px 8px rgba(11, 11, 11, 0.2)";
            tooltip.style.display = "none"; // Initially hidden
            tooltip.style.zIndex = "1000";
            tooltip.innerHTML = `
              <strong>Error: ${error.message}</strong><br/>
              <i>Suggestion: ${error.suggestion}</i>
            `;
            document.body.appendChild(tooltip); // ADD TOOLTIP TO DOCUMENT BODY

            // Show tooltip on hover or click
            const showTooltip = (event) => {
              tooltip.style.display = "block";
              tooltip.style.top = `${event.pageY + 10}px`; // Adjust tooltip position
              tooltip.style.left = `${event.pageX + 10}px`;
            };

            // Hide tooltip on mouse leave
            const hideTooltip = () => {
              tooltip.style.display = "none";
            };

            // Add event listeners for hover and click
            errorIcon.addEventListener("mouseenter", showTooltip); // On hover
            errorIcon.addEventListener("click", showTooltip); // On click
            errorIcon.addEventListener("mouseleave", hideTooltip); // On mouse leave

            // Add overlay with the error icon
            overlays.add(element.id, {
              position: {
                top: -10,
                left: 10,
              },
              html: errorIcon,
            });
          }
        });
      } else {
        setErrorMessages(["Error occurred while detecting issues."]);
      }
    } catch (error) {
      console.error("Error detecting BPMN issues:", error);
      setErrorMessages(["Failed to detect issues in the BPMN diagram."]);
    }
  };

  // Real-time validation for BPMN diagram
  const handleRealTimeValidation = async () => {
    if (!modelerRef.current) return;

    const overlays = modelerRef.current.get("overlays");
    const elementRegistry = modelerRef.current.get("elementRegistry");

    try {
      // Save the current BPMN XML
      const { xml } = await modelerRef.current.saveXML({ format: true });

      // Create FormData with the XML for validation
      const formData = new FormData();
      const blob = new Blob([xml], { type: "text/xml" });
      formData.append("file", blob, "diagram.bpmn");
      const url = config.apiBaseUrl + "/bpmn-error-detection/validate/";

      // Send the XML to the validation API
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

            // Tooltip for the error
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

            // Show tooltip on hover
            errorIcon.addEventListener("mouseenter", (event) => {
              tooltip.style.display = "block";
              tooltip.style.top = `${event.pageY + 10}px`;
              tooltip.style.left = `${event.pageX + 10}px`;
            });

            // Hide tooltip on mouse leave
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
    showDiagramWarnings(); // Check and show warnings in real-time

  };

  // Function to check if the diagram has Start and End events
  const checkDiagramCompleteness = () => {
    if (!modelerRef.current) return;

    const elementRegistry = modelerRef.current.get("elementRegistry");
    const elements = elementRegistry.getAll();

    // Check for the existence of StartEvent and EndEvent
    const hasStartEvent = elements.some(
      (element) => element.type === "bpmn:StartEvent"
    );
    const hasEndEvent = elements.some(
      (element) => element.type === "bpmn:EndEvent"
    );

    // Return the result
    return {
      hasStartEvent,
      hasEndEvent,
    };
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

  const handleSave = () => {
    if (!modelerRef.current) return;

    modelerRef.current.saveXML({ format: true }).then(
      async ({ xml }) => {
        try {
          const { svg } = await modelerRef.current.saveSVG({ format: true });
          const token = await refreshAccessToken()
          const url = config.apiBaseUrl + "/bpmn/save-bpmn/" + encryptedID;
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

    modelerRef.current.importXML(DEFAULT_BPMN_XML).then(
      () => {
        console.log("BPMN editor reset to default diagram.");
      },
      (err) => {
        console.error("Failed to reset BPMN editor.", err);
      }
    );
  };

  const handleNewDiagram = (newXml) => {
    if (!modelerRef.current) return;

    modelerRef.current.importXML(newXml).then(
      () => {
        setNotifMessage('BPMN DIagram has been successfully imported.');
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "85vh" }}>
      <div style={{ position: "relative" }}>
        {/* Toolbar */}
        <BpmnToolbar onNewDiagram={handleNewDiagram} onSaveClick={handleSave} />

        <div
          ref={containerRef}
          style={{
            flex: 1,
            border: "1px solid #ccc",
            height: "75vh"
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
          borderTop: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
        }}
      >
        <button onClick={handleReset} className="reset-button">
          Reset BPMN
        </button>
        <button onClick={handleErrorDetection} className="error-button">
          Error Detection
        </button>
        <button onClick={handleSave} className="save-button">
          Save Changes
        </button>
      </div>


      <ul>
        {errorMessages.map((error, index) => (
          <li key={index} style={{ color: "red", marginBottom: "10px" }}>
            <strong>{error.message}</strong>
            {error.suggestion && (
              <div style={{ color: "gray", fontStyle: "italic" }}>
                Suggestion: {error.suggestion}
              </div>
            )}
          </li>
        ))}
      </ul>
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
