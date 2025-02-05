// src/BpmnModeler.js
import React, { useEffect, useRef, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import axios from "axios"; // Import Axios
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { useParams } from "react-router-dom";
//import BpmnToolbar from "./BpmnToolbar";
import NotificationSnackBar from "./NotificationSnackbar";
import './BpmnModeler.css';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";


import { refreshAccessToken } from "./auth";
import config from "../src/config";

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

  const containerRef = useRef(null);
  const modelerRef = useRef(null);

  useEffect(() => {
    modelerRef.current = new BpmnModeler({
      container: containerRef.current,
      width: "100%",
      height: "100%",
    });

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

  const [errorMessages, setErrorMessages] = useState([]);

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
  
      // Send the BPMN XML to the validation API
      const token = await refreshAccessToken()
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
        setErrorMessages(errors); // Update error messages in the list
  
        // Clear existing overlays
        overlays.clear();
  
        // Add overlays for each error
        errors.forEach((error) => {
          const element = elementRegistry.get(error.elementId); // Use `elementId` returned from the backend
          if (element) {
            overlays.add(element.id, {
              position: {
                top: -10,
                left: 0,
              },
              html: `<div style="color: red; background: #fff; padding: 5px; border: 1px solid red; border-radius: 3px;">
                      ${error.message}<br/>
                      <i>${error.suggestion}</i>
                     </div>`,
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
