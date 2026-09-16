import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar.jsx";
import {
    Box,
    Button,
    Paper,
    Typography,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert
} from "@mui/material";
import BpmnViewerComponent from "./BpmnViewer.jsx";
import { useParams, useNavigate } from "react-router-dom";
import { refreshAccessToken } from "./auth.jsx";
import axios from "axios";
import {
    Restore,
    ArrowBack,
    History,
    CalendarToday,
    Visibility,
    CheckCircle
} from '@mui/icons-material';
import config from "../config.js";

function BpmnVersionsModule() {
    const navigate = useNavigate();
    const { encryptedID } = useParams();
    const [diagramXml, setDiagramXml] = useState("");
    const [bpmnVersions, setBpmnVersions] = useState([]);
    const [selectedVersionId, setSelectedVersionId] = useState(null);
    const [versionToRestore, setVersionToRestore] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [restoring, setRestoring] = useState(false);
    const [error, setError] = useState(null);

    const fetchDiagramVersions = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/get-versions/" + encryptedID;
            const response = await axios.get(url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            const versions = response.data.versions || [];
            setBpmnVersions(versions);
            if (versions.length > 0) {
                setDiagramXml(versions[0].bpmn_xml);
                setSelectedVersionId(versions[0].id);
            }
        } catch (err) {
            console.error("Failed to load versions:", err);
            setError("Failed to fetch diagram versions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreDiagram = async () => {
        if (!versionToRestore) return;
        setRestoring(true);
        try {
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/restore-diagram-version/";
            const response = await axios.post(
                url,
                {
                    version_id: versionToRestore.id,
                    encrypted_id: encryptedID
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );

            if (response.status === 200) {
                setOpenDialog(false);
                navigate(`/homepage/bpmn/${encryptedID}`);
            } else {
                setError("Could not restore selected version.");
            }
        } catch (err) {
            console.error("Error restoring version:", err);
            setError("An error occurred while restoring the version.");
        } finally {
            setRestoring(false);
        }
    };

    useEffect(() => {
        fetchDiagramVersions();
    }, [encryptedID]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            <NavigationBar />

            <div style={{ marginTop: "65px", padding: "20px 28px", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Header Navigation and Title */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/homepage/bpmn/${encryptedID}`)}
                            sx={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}
                        >
                            <ArrowBack fontSize="small" />
                        </IconButton>
                        <div>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                                <History sx={{ color: "#2563eb", fontSize: 22 }} />
                                Version History
                            </Typography>
                            <Typography sx={{ color: "#64748b", fontSize: "0.8rem" }}>
                                Inspect and restore earlier milestones of your process workflow.
                            </Typography>
                        </div>
                    </div>

                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/homepage/bpmn/${encryptedID}`)}
                        sx={{ textTransform: "none", color: "#334155", borderColor: "#cbd5e1" }}
                    >
                        Back to Editor
                    </Button>
                </div>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: "8px" }}>
                        {error}
                    </Alert>
                )}

                {/* Main Content Layout */}
                <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "20px", flex: 1 }}>
                    {/* Left Sidebar: Version List */}
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#ffffff",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            height: "calc(100vh - 160px)"
                        }}
                    >
                        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                                Saved Milestones ({bpmnVersions.length})
                            </Typography>
                        </div>

                        <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            {loading ? (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                                    <CircularProgress size={28} />
                                </div>
                            ) : bpmnVersions.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
                                    <History sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                        No versions saved yet.
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.5 }}>
                                        Use "Save as Version" in the BPMN editor to snapshot milestones.
                                    </Typography>
                                </div>
                            ) : (
                                bpmnVersions.map((v, index) => {
                                    const isSelected = selectedVersionId === v.id;
                                    const isLatest = index === 0;

                                    return (
                                        <div
                                            key={v.id}
                                            onClick={() => {
                                                setSelectedVersionId(v.id);
                                                setDiagramXml(v.bpmn_xml);
                                            }}
                                            style={{
                                                padding: "12px 14px",
                                                borderRadius: "10px",
                                                border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                                                backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                                                cursor: "pointer",
                                                transition: "all 0.15s ease",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "6px"
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: isSelected ? "#1d4ed8" : "#0f172a" }}>
                                                        {v.version_name || `Version #${v.version_number}`}
                                                    </Typography>
                                                    {isLatest && (
                                                        <Chip label="Latest" size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600, backgroundColor: "#dcfce7", color: "#166534" }} />
                                                    )}
                                                </div>

                                                <Tooltip title="Restore this version">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setVersionToRestore(v);
                                                            setOpenDialog(true);
                                                        }}
                                                        sx={{
                                                            color: isSelected ? "#1d4ed8" : "#64748b",
                                                            '&:hover': { backgroundColor: "#dbeafe", color: "#1e40af" }
                                                        }}
                                                    >
                                                        <Restore fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "0.75rem" }}>
                                                <CalendarToday sx={{ fontSize: 13 }} />
                                                <span>{formatDate(v.created_at)}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Paper>

                    {/* Right Main Viewer */}
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#ffffff",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            height: "calc(100vh - 160px)"
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
                                <Visibility sx={{ fontSize: 18, color: "#475569" }} />
                                <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                                    Snapshot Preview
                                </Typography>
                            </div>

                            {selectedVersionId && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Restore sx={{ fontSize: 16 }} />}
                                    onClick={() => {
                                        const currentV = bpmnVersions.find(v => v.id === selectedVersionId);
                                        if (currentV) {
                                            setVersionToRestore(currentV);
                                            setOpenDialog(true);
                                        }
                                    }}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "0.8rem",
                                        borderColor: "#cbd5e1",
                                        color: "#334155"
                                    }}
                                >
                                    Restore This Version
                                </Button>
                            )}
                        </div>

                        <div style={{ flex: 1, position: "relative" }}>
                            <BpmnViewerComponent diagramXml={diagramXml} />
                        </div>
                    </Paper>
                </div>
            </div>

            {/* Restore Confirmation Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => !restoring && setOpenDialog(false)}
                slotProps={{ paper: { sx: { borderRadius: "12px" } } }}
            >
                <DialogTitle sx={{ fontWeight: 600, fontSize: "1.05rem" }}>
                    Restore Diagram Version
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: "0.875rem", color: "#475569" }}>
                        Are you sure you want to restore <strong>{versionToRestore?.version_name || `Version #${versionToRestore?.version_number}`}</strong>?
                        Your current active canvas will be replaced with this snapshot.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} disabled={restoring} sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRestoreDiagram}
                        variant="contained"
                        disabled={restoring}
                        sx={{ textTransform: "none", backgroundColor: "#2563eb" }}
                        autoFocus
                    >
                        {restoring ? <CircularProgress size={18} color="inherit" /> : "Confirm & Restore"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default BpmnVersionsModule;