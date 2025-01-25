// src/BpmnModeler.js
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
// import '..BpmnModeler';



import { refreshAccessToken } from "../auth";
import config from "../../config";

const DEFAULT_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn:process id="Process_1" isExecutable="false" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BpmnModelerComponent = ({ diagramXml, diagramName, permissions }) => {
    const { encryptedID } = useParams();
    const [bpmnXML, setBpmnXML] = useState('');
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
                    const url = config.apiBaseUrl + `/bpmn/update-diagram/${encryptedID}`;
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
                        bottom: "50px",
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
                                <Fullscreen style={{ fontSize: '20px' }} /></Tooltip>
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
