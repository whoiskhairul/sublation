import React, { useState, useEffect } from "react";
import BpmnViewerComponent from "./BpmnViewer.jsx";
import NavigationBar from './NavigationBar';
import { useParams } from "react-router-dom";
import axios from "axios";
import {refreshAccessToken} from "./auth.jsx";
import { Box, Button } from '@mui/material';
import config from "../config.js";
function ImageToBPMN() {
    const [diagramXml, setDiagramXml] = useState(""); // Current BPMN XML
    const [uploading, setUploading] = useState(false); // Upload state
    const [error, setError] = useState(null); // Error state
    const [encryptedID, setEncryptedID] = useState(""); // Encrypted ID
    const isReadOnly = true;
    const [haveDiagram, setHaveDiagram] = useState(false);
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

    // Fetch default diagram on load


    // Handle image upload
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        //clear input file selection
        event.target.value = null;
        const formData = new FormData();

        formData.append("image", file);





        try {
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/image-to-bpmn/";
            const response = await axios.post(
                url,
                formData, // Form data as the body
                {
                    headers: {
                        "Authorization": `Bearer ${token}`, // Bearer token in headers
                        "Content-Type": "multipart/form-data" // Optional for FormData, Axios may handle it automatically
                    }
                }
            );
            // const response = await fetch(config.apiBaseUrl + "/bpmn/image-to-bpmn/", {
            //     method: "POST",
            //     headers: {
            //         "Authorization": `Bearer ${token}`,
            //         "Content-Type": "multipart/form-data" // Optional, depending on the API's requirements
            //     },
            //     body: formData,
            //
            // });
            console.log("Response:", response.data);
            console.log("Response:", response.data);
            if (!response.status === 200) {
                setError("Something went wrong. Please try again.");
            }

           // const data = await response.json();
            if (response.data.bpmn_xml) {
                setDiagramXml(response.data.bpmn_xml);
                setEncryptedID(response.data.encrypted_id);
                setHaveDiagram(true);
            } else {
                setError("Something went wrong. Please try again.");

            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div style={{flex: "0 0 10%", height: "10%"}}>
                <NavigationBar username=""/>
            </div>
            <div style={{display: "flex", flexDirection: "column", height: "100vh", padding: "20px", marginTop: "65px"}}>

                <div>
                    <label htmlFor="file-upload" style={{marginRight: "10px"}}>
                        Upload an Image to Generate BPMN:
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    {uploading && <p>Please Wait...</p>}
                    {error && <p style={{color: "red"}}>{error}</p>}
                    {!uploading && !error && haveDiagram &&
                        <Box
                            display="flex"
                            justifyContent="flex-end"
                            padding={2}
                        >
                            <Button
                                onClick={() => window.location.href = `/homepage/bpmn/${encryptedID}`}
                                variant="contained" color="primary">
                                Open In Studio
                            </Button>
                        </Box>

                    }
                </div>


                <div style={{display: "flex", flexGrow: 1, marginTop: "10px"}}>
                    <div style={{width: "100%"}}>
                       {<BpmnViewerComponent diagramXml={diagramXml}/>}
                    </div>


                </div>

            </div>
        </div>

    );

}

export default ImageToBPMN;