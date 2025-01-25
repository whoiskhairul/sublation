import React, { useEffect, useRef, useState } from "react";
import BpmnViewer from "bpmn-js/lib/NavigatedViewer";
import axios from "axios";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { useParams } from "react-router-dom";
import { Tooltip, IconButton } from "@mui/material";
import { ZoomIn, ZoomOut, FitScreen, Fullscreen, FullscreenExit } from '@mui/icons-material';
import { refreshAccessToken } from "./auth";
import NotificationSnackBar from "./NotificationSnackbar";
import BpmnToolbar from "./BpmnToolbar";
import './BpmnModeler.css';

const DEFAULT_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:endEvent id="Event_02vmko8" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="Event_02vmko8_di" bpmnElement="Event_02vmko8">
        <dc:Bounds x="132" y="172" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BpmnViewerComponent = ({ diagramXml, diagramName, permissions }) => {
  let serverxml = diagramXml;
  console.log('permissions:', permissions);
  const { encryptedID } = useParams();
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!viewerRef.current) {
      viewerRef.current = new BpmnViewer({
        container: containerRef.current,
        width: "100%",
        height: "100%",
      });
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current) return;

    const xmlToLoad = diagramXml || DEFAULT_BPMN_XML;

    viewerRef.current.importXML(xmlToLoad).then(
      () => {
        console.log("BPMN diagram successfully imported or updated.");
      },
      (err) => {
        console.error("Failed to import BPMN diagram, loading default.", err);

        viewerRef.current.importXML(diagramXml ? diagramXml : DEFAULT_BPMN_XML).then(
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
    if (!viewerRef.current) return;
    const canvas = viewerRef.current.get('canvas');
    const zoom = canvas.zoom();
    canvas.zoom(zoom + 0.1);
  };

  const handleZoomOut = () => {
    if (!viewerRef.current) return;
    const canvas = viewerRef.current.get('canvas');
    const zoom = canvas.zoom();
    canvas.zoom(zoom - 0.1);
  };

  const handleFitToView = () => {
    if (!viewerRef.current) return;
    const canvas = viewerRef.current.get('canvas');
    canvas.zoom('fit-viewport');
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [open, setOpen] = useState(false);
  const [notifSeverity, setNotifSeverity] = useState("info");
  const [notifMessage, setNotifMessage] = useState("");

  const handleClose = () => {
    setOpen(false);
  };

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

        <BpmnToolbar
          diagramName={diagramName}
          permissions={permissions}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToView={handleFitToView}
          onFullscreen={handleFullscreen}
          isFullscreen={isFullscreen}
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
            <IconButton size="small" style={{ padding: '8px' }}>
              <Tooltip title="Zoom In">
                <ZoomIn style={{ fontSize: '20px' }} onClick={handleZoomIn} />
              </Tooltip>
            </IconButton>
            <IconButton size="small" style={{ padding: '8px' }}>
              <Tooltip title="Zoom Out">
                <ZoomOut style={{ fontSize: '20px' }} onClick={handleZoomOut} />
              </Tooltip>
            </IconButton>
            <IconButton size="small" style={{ padding: '8px' }}>
              <Tooltip title="Fit to Screen">
                <FitScreen style={{ fontSize: '20px' }} onClick={handleFitToView} />
              </Tooltip>
            </IconButton>
            <IconButton size="small" style={{ padding: '8px' }}>
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                {isFullscreen ?
                  <FullscreenExit style={{ fontSize: '20px' }} onClick={handleFullscreen} /> :
                  <Fullscreen style={{ fontSize: '20px' }} onClick={handleFullscreen} />
                }
              </Tooltip>
            </IconButton>
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

export default BpmnViewerComponent;