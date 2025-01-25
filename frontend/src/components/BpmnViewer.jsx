// src/BpmnModeler.js
import React, { useEffect, useRef } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import axios from "axios"; // Import Axios
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { useParams } from "react-router-dom";
import './BpmnViewer.css';
import config from "../config";

import { refreshAccessToken } from "./auth";

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

const BpmnViewerComponent = ({ diagramXml }) => {
    const { encryptedID } = useParams();

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

    const handleSave = () => {
        if (!modelerRef.current) return;

        modelerRef.current.saveXML({ format: true }).then(
            async ({ xml }) => {
                try {
                    const token = await refreshAccessToken()
                    const url = config.apiBaseUrl + "/bpmn/save-bpmn/";
                    const response = await axios.post(
                        url,
                        {
                            xmlDiagram: xml,
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
                    console.log(response.status)


                    if (response.status === 200) {
                        console.log("BPMN XML successfully saved to the server.");
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

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "85vh" }}>
            <div
                ref={containerRef}
                style={{
                    flex: 1, // Ensures the canvas takes up all available vertical space
                    border: "1px solid #ccc",
                }}
            />
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    borderTop: "1px solid #ccc",
                    backgroundColor: "#f9f9f9",
                }}
            >

            </div>
        </div>
    );
};

export default BpmnViewerComponent;
