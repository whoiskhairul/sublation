import React, { useState } from "react";
import BpmnViewerComponent from "./BpmnViewer.jsx";
import NavigationBar from './NavigationBar';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { refreshAccessToken } from "./auth.jsx";
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Tooltip,
    Fade
} from '@mui/material';
import {
    CloudUploadOutlined,
    CheckCircleOutline,
    OpenInNew,
    Refresh,
    Image as ImageIcon
} from '@mui/icons-material';
import config from "../config.js";

function ImageToBPMN() {
    const navigate = useNavigate();
    const [diagramXml, setDiagramXml] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [encryptedID, setEncryptedID] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFileName, setImageFileName] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);

    const processFile = async (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
            return;
        }

        setImageFileName(file.name);
        setError(null);
        setUploading(true);

        // Generate local preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/image-to-bpmn/";
            const response = await axios.post(url, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status === 200 && response.data?.bpmn_xml) {
                setDiagramXml(response.data.bpmn_xml);
                setEncryptedID(response.data.encrypted_id);
            } else {
                setError(response.data?.error || "Could not generate BPMN from the provided image. Please check the image and try again.");
            }
        } catch (err) {
            console.error("Image to BPMN upload error:", err);
            const serverMsg = err.response?.data?.error || err.message;
            setError(`Failed to convert image to BPMN: ${serverMsg}`);
        } finally {
            setUploading(false);
        }
    };

    const handleFileInput = (event) => {
        const file = event.target.files?.[0];
        event.target.value = null;
        if (file) processFile(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleReset = () => {
        setDiagramXml("");
        setEncryptedID("");
        setImagePreview(null);
        setImageFileName("");
        setError(null);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            <NavigationBar username="" />

            <div style={{ marginTop: "65px", padding: "24px 32px", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Header Title Section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
                            Image to BPMN Converter
                        </Typography>
                        <Typography sx={{ color: "#64748b", fontSize: "0.875rem", mt: 0.5 }}>
                            Upload an architectural diagram, whiteboard sketch, or workflow screenshot to automatically reconstruct it as interactive BPMN 2.0.
                        </Typography>
                    </div>

                    {encryptedID && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleReset}
                                startIcon={<Refresh fontSize="small" />}
                                sx={{ textTransform: "none", color: "#475569", borderColor: "#cbd5e1" }}
                            >
                                Convert Another
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => navigate(`/homepage/bpmn/${encryptedID}`)}
                                startIcon={<OpenInNew fontSize="small" />}
                                sx={{ textTransform: "none", backgroundColor: "#2563eb", boxShadow: "none" }}
                            >
                                Open in Studio
                            </Button>
                        </div>
                    )}
                </div>

                {error && (
                    <Fade in={Boolean(error)}>
                        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: "8px" }}>
                            {error}
                        </Alert>
                    </Fade>
                )}

                {/* Main Content Area */}
                <div style={{ display: "grid", gridTemplateColumns: diagramXml ? "320px 1fr" : "1fr", gap: "24px", flex: 1 }}>
                    {/* Left Upload / Source Preview Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#ffffff",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2
                        }}
                    >
                        <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>
                            Source Image
                        </Typography>

                        {/* Drag and Drop Zone */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            style={{
                                border: isDragOver ? "2px dashed #2563eb" : "2px dashed #cbd5e1",
                                backgroundColor: isDragOver ? "#eff6ff" : "#f8fafc",
                                borderRadius: "10px",
                                padding: "24px 16px",
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onClick={() => document.getElementById("image-upload-input")?.click()}
                        >
                            <input
                                id="image-upload-input"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                style={{ display: "none" }}
                                onChange={handleFileInput}
                                disabled={uploading}
                            />

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                <CloudUploadOutlined sx={{ fontSize: 40, color: isDragOver ? "#2563eb" : "#64748b" }} />
                                <div>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                                        {uploading ? "Analyzing Image..." : "Click or drag image here"}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
                                        PNG, JPG, or WEBP up to 10MB
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar / Indicator */}
                        {uploading && (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", backgroundColor: "#eff6ff", borderRadius: "8px" }}>
                                <CircularProgress size={20} />
                                <Typography sx={{ fontSize: "0.825rem", color: "#1d4ed8", fontWeight: 500 }}>
                                    Reconstructing process model via Vision AI...
                                </Typography>
                            </div>
                        )}

                        {/* Image Preview */}
                        {imagePreview && (
                            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>
                                        Uploaded Preview
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {imageFileName}
                                    </Typography>
                                </div>
                                <div style={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    maxHeight: "240px",
                                    backgroundColor: "#00000008",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <img
                                        src={imagePreview}
                                        alt="Source Process"
                                        style={{ width: "100%", maxHeight: "240px", objectFit: "contain" }}
                                    />
                                </div>
                            </div>
                        )}
                    </Paper>

                    {/* Right Canvas: Generated BPMN Interactive Viewer */}
                    {diagramXml && (
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#ffffff",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                height: "72vh"
                            }}
                        >
                            <div style={{
                                padding: "12px 20px",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "#f8fafc"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <CheckCircleOutline sx={{ fontSize: 18, color: "#16a34a" }} />
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                                        Generated BPMN 2.0 Process Diagram
                                    </Typography>
                                </div>

                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => navigate(`/homepage/bpmn/${encryptedID}`)}
                                    startIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "0.8rem",
                                        backgroundColor: "#2563eb",
                                        boxShadow: "none"
                                    }}
                                >
                                    Open in Studio
                                </Button>
                            </div>

                            <div style={{ flex: 1, position: "relative" }}>
                                <BpmnViewerComponent diagramXml={diagramXml} />
                            </div>
                        </Paper>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ImageToBPMN;