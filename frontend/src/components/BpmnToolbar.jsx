// Import necessary libraries
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { refreshAccessToken } from './auth.jsx';
import ShareDiagram from './ShareDiagram.jsx';
import NotificationSnackBar from './NotificationSnackbar.jsx';
import config from "../config.js";

import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Button, Tooltip, Paper, Chip, Divider, Alert, TextField, Backdrop, CircularProgress } from '@mui/material';
import { Undo, Redo, FolderOpen, ZoomIn, ZoomOut, Share, FileDownload, Save, Edit, Replay, MoreVert, Timeline, BookmarkAdd, Build } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

import RenameDiagramDialog from './updates/RenameDiagramDialog';

import Modal from '@mui/material/Modal';
import { FileCopy, GetApp } from '@mui/icons-material';
import { TextareaAutosize } from '@mui/material';
import { Description } from '@mui/icons-material';
import { jsPDF } from "jspdf";


const BpmnToolbar = ({ diagramName, permissions, onNewDiagram,
    onSaveClick, onZoomIn, onZoomOut, onReset, onUndo, onRedo,
    onPrint, onTimeLineClick, onSaveAsClick, onOptimizedXml, initialOpenOptimizer = false }) => {
    const { encryptedID } = useParams();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const [anchorElExport, setAnchorElExport] = React.useState(null); // For Export dropdown

    const [documentation, setDocumentation] = useState('');
    const [openDoc, setOpenDoc] = useState(false);
    const [isLoadingDoc, setIsLoadingDoc] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState('');
    const [optidialog, setOptidialog] = useState(initialOpenOptimizer);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optiGoal, setOptiGoal] = useState('comprehensive');
    const [optimizationResult, setOptimizationResult] = useState(null); // { xml, msg, goal }

    useEffect(() => {
        if (initialOpenOptimizer) {
            setOptidialog(true);
        }
    }, [initialOpenOptimizer]);

    const handleGenerateDocumentation = async () => {

        setOpenDoc(true);  // Show modal immediately when button is clicked
        setIsLoadingDoc(true); // Show loading state

        try {
            // Send request to documentation API
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/generate-bpmn-documentation/";
            const response = await axios.post(
                url,
                { encrypted_id: encryptedID }

            );

            if (response.status === 200) {
                setDocumentation(response.data.reply);
                setEditedText(response.data.reply);
                setOpenDoc(true);
                //console.log('Documentation generated:', response.data.reply);
            } else {
                console.error('Failed to generate documentation:', response.data.error);
            }
        } catch (error) {
            console.error('Error generating documentation:', error);
        } finally {
            setIsLoadingDoc(false); // Remove loading state when response arrives
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(editedText);
    };

    // const handleDocumentationExport = () => {
    //     const blob = new Blob([editedText], { type: 'text/plain' });
    //     const link = document.createElement('a');
    //     link.href = window.URL.createObjectURL(blob);
    //     link.download = 'BPMN_Documentation.txt';
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    // }; 



    const handleDocumentationExport = () => {
        const doc = new jsPDF();

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("BPMN Documentation", 20, 20);

        // Add the actual content
        const content = editedText.trim(); // Ensure text is not empty
        if (content.length === 0) {
            alert("No content to export!");
            return;
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        // Split text into lines to avoid text overflow
        const marginLeft = 20;
        const marginTop = 40;
        const pageWidth = doc.internal.pageSize.width - marginLeft * 2; // Adjust width

        const splitContent = doc.splitTextToSize(content, pageWidth);

        // Add text to the PDF
        doc.text(splitContent, marginLeft, marginTop);

        // Save the document
        doc.save("BPMN_Documentation.pdf");
    };


    const handleExport = async (format) => {
        try {
            const modeler = window.bpmnModeler; // Ensure the BPMN modeler instance is globally accessible
            if (!modeler) {
                console.error('BPMN Modeler is not available.');
                return;
            }

            let content, mimeType, fileExtension;

            switch (format) {
                case 'bpmn':
                case 'xml':
                    // Export as BPMN or XML
                    const { xml } = await modeler.saveXML({ format: true });
                    content = xml;
                    mimeType = 'application/xml';
                    fileExtension = format;
                    break;

                case 'png':
                    // Export as PNG
                    const { svg } = await modeler.saveSVG({ format: true });
                    const canvas = document.createElement('canvas');
                    const img = new Image();
                    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

                    // Convert SVG to PNG
                    await new Promise((resolve) => {
                        img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            canvas.toBlob((blob) => {
                                content = blob;
                                mimeType = 'image/png';
                                fileExtension = 'png';
                                resolve();
                            }, 'image/png');
                        };
                    });
                    break;

                case 'jpg':
                    // Export as JPG
                    const { svg: svgForJpg } = await modeler.saveSVG({ format: true });
                    const canvasForJpg = document.createElement('canvas');
                    const imgForJpg = new Image();
                    imgForJpg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgForJpg);

                    // Convert SVG to JPG
                    await new Promise((resolve) => {
                        imgForJpg.onload = () => {
                            canvasForJpg.width = imgForJpg.width;
                            canvasForJpg.height = imgForJpg.height;
                            const ctx = canvasForJpg.getContext('2d');
                            ctx.fillStyle = '#ffffff'; // Set white background for JPG
                            ctx.fillRect(0, 0, canvasForJpg.width, canvasForJpg.height);
                            ctx.drawImage(imgForJpg, 0, 0);
                            canvasForJpg.toBlob((blob) => {
                                content = blob;
                                mimeType = 'image/jpeg';
                                fileExtension = 'jpg';
                                resolve();
                            }, 'image/jpeg');
                        };
                    });
                    break;

                default:
                    console.error('Unsupported export format:', format);
                    return;
            }

            // Trigger download
            const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `diagram.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(`Exported as ${fileExtension}`);
        } catch (error) {
            console.error('Failed to export diagram:', error);
        }
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const [localDiagramName, setLocalDiagramName] = useState(diagramName || '');

    useEffect(() => {
        if (!localDiagramName && diagramName) {
            setLocalDiagramName(diagramName);

        }

    })

    const handleNameChange = (e) => {
        setLocalDiagramName(e.target.value);
    };

    const submitDiagramName = async () => {
        try {
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/update-diagram/" + encryptedID;
            const response = await axios.put(
                url,
                {
                    name: localDiagramName
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                setNotifMessage(response.data.reply);
                setNotifSeverity('success');
                setNotifOpen(true);
            }
        } catch (error) {
            console.error('Failed to rename diagram:', error);
            setNotifMessage(response.data.reply);
            setNotifSeverity('error');
            setNotifOpen(true);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            submitDiagramName();
            e.preventDefault();
            e.target.blur();
        }
    };

    const handleDeleteDiagram = async () => {
        setAnchorEl(null);
        setOpenConfirmDialog(true);
    };

    const handleConfirmDeleteDiagram = async () => {
        setOpenConfirmDialog(false);
        try {
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/delete-diagram/" + encryptedID;
            const response = await axios.delete(
                url,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );
            if (response.status === 200) {
                setNotifMessage('Diagram deleted successfully');
                setNotifSeverity('success');
                setNotifOpen(true);
                setTimeout(() => {
                    navigate('/homepage', { replace: true });
                }, 1000);
            }
        } catch (error) {
            console.error('Failed to delete diagram:', error);
            setNotifMessage(error.response.data.reply);
            setNotifSeverity('error');
            setNotifOpen(true);
        }
    };


    const [notifOpen, setNotifOpen] = useState(false);
    const [notifMessage, setNotifMessage] = useState('');
    const [notifSeverity, setNotifSeverity] = useState('success');

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;  // ignore if user clicks away
        }
        setNotifOpen(false);
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Unified Modern Toolbar */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    marginTop: '65px',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                    px: { xs: 1, sm: 2 },
                    py: 0.5
                }}
            >
                <Toolbar
                    variant="dense"
                    disableGutters
                    sx={{
                        minHeight: 52,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        flexWrap: 'nowrap',
                        overflowX: 'auto'
                    }}
                >
                    {/* Left Section: Document Identity & File Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
                        {/* Diagram Name & Permission Chip */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            {permissions === 'editor' ? (
                                <TextField
                                    id="renameDiagram"
                                    value={localDiagramName}
                                    type="text"
                                    name="name"
                                    variant="standard"
                                    onChange={handleNameChange}
                                    onBlur={submitDiagramName}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Diagram Name"
                                    InputProps={{ disableUnderline: true }}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            fontWeight: 600,
                                            fontSize: '0.925rem',
                                            color: '#0f172a',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid transparent',
                                            transition: 'border-color 0.15s, background-color 0.15s',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '220px',
                                            '&:hover': {
                                                borderColor: '#cbd5e1',
                                                backgroundColor: '#f8fafc'
                                            },
                                            '&:focus': {
                                                borderColor: '#2563eb',
                                                backgroundColor: '#ffffff'
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.925rem',
                                        color: '#0f172a',
                                        px: 1,
                                        maxWidth: '220px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {localDiagramName || 'Untitled Diagram'}
                                </Typography>
                            )}

                            <Chip
                                label={permissions}
                                size="small"
                                variant="outlined"
                                color={permissions === 'editor' ? 'primary' : 'default'}
                                sx={{
                                    height: '22px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>

                        <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', mx: 0.5 }} />

                        {/* File Menu Dropdown */}
                        <Button
                            size="small"
                            variant="text"
                            onClick={handleMenuClick}
                            disabled={permissions !== 'editor'}
                            startIcon={<FolderOpen sx={{ fontSize: 18 }} />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '0.825rem',
                                color: '#334155',
                                minWidth: 'auto',
                                px: 1,
                                height: 32,
                                borderRadius: '6px',
                                '&:hover': { backgroundColor: '#f1f5f9' }
                            }}
                        >
                            File
                        </Button>

                        {/* Save Button */}
                        {permissions === 'editor' && (
                            <Tooltip title="Save Diagram (Ctrl+S)">
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={onSaveClick}
                                    startIcon={<Save sx={{ fontSize: 16 }} />}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.825rem',
                                        height: 32,
                                        px: 1.5,
                                        borderRadius: '6px',
                                        boxShadow: 'none',
                                        backgroundColor: '#2563eb',
                                        '&:hover': {
                                            backgroundColor: '#1d4ed8',
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    Save
                                </Button>
                            </Tooltip>
                        )}
                    </div>

                    {/* Center Section: History & View Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <Tooltip title="Undo">
                            <span>
                                <IconButton size="small" onClick={onUndo} sx={{ color: '#475569', borderRadius: '6px' }}>
                                    <Undo fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Redo">
                            <span>
                                <IconButton size="small" onClick={onRedo} sx={{ color: '#475569', borderRadius: '6px' }}>
                                    <Redo fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: 'center', mx: 0.5 }} />

                        <Tooltip title="Zoom Out">
                            <IconButton size="small" onClick={onZoomOut} sx={{ color: '#475569', borderRadius: '6px' }}>
                                <ZoomOut fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Zoom In">
                            <IconButton size="small" onClick={onZoomIn} sx={{ color: '#475569', borderRadius: '6px' }}>
                                <ZoomIn fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Reset View">
                            <IconButton size="small" onClick={onReset} sx={{ color: '#475569', borderRadius: '6px' }}>
                                <Replay fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: 'center', mx: 0.5 }} />

                        <Tooltip title="Save as Version">
                            <IconButton size="small" onClick={onSaveAsClick} sx={{ color: '#475569', borderRadius: '6px' }}>
                                <BookmarkAdd fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Version Timeline">
                            <IconButton size="small" onClick={onTimeLineClick} sx={{ color: '#475569', borderRadius: '6px' }}>
                                <Timeline fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>

                    {/* Right Section: Workflow Tools & Export */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {/* Process Optimization Button */}
                        {permissions === 'editor' && (
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setOptidialog(true)}
                                startIcon={<Build sx={{ fontSize: 16 }} />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.825rem',
                                    height: 32,
                                    px: 1.5,
                                    borderRadius: '6px',
                                    borderColor: '#93c5fd',
                                    color: '#1d4ed8',
                                    backgroundColor: '#eff6ff',
                                    '&:hover': {
                                        borderColor: '#60a5fa',
                                        backgroundColor: '#dbeafe'
                                    }
                                }}
                            >
                                Optimize
                            </Button>
                        )}

                        {/* Documentation Modal Button */}
                        <Tooltip title="Generate Workflow Documentation">
                            <Button
                                size="small"
                                variant="text"
                                onClick={handleGenerateDocumentation}
                                startIcon={<Description sx={{ fontSize: 17 }} />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.825rem',
                                    height: 32,
                                    px: 1.25,
                                    color: '#334155',
                                    borderRadius: '6px',
                                    '&:hover': { backgroundColor: '#f1f5f9' }
                                }}
                            >
                                Docs
                            </Button>
                        </Tooltip>

                        {/* Export Dropdown Button */}
                        <Button
                            size="small"
                            variant="text"
                            onClick={(e) => setAnchorElExport(e.currentTarget)}
                            startIcon={<FileDownload sx={{ fontSize: 17 }} />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '0.825rem',
                                height: 32,
                                px: 1.25,
                                color: '#334155',
                                borderRadius: '6px',
                                '&:hover': { backgroundColor: '#f1f5f9' }
                            }}
                        >
                            Export
                        </Button>

                        {/* Share Dialog */}
                        {permissions && (
                            <ShareDiagram permissions={permissions} />
                        )}

                        {/* More Menu */}
                        <Tooltip title="More Options">
                            <IconButton
                                size="small"
                                onClick={handleMenuClick}
                                sx={{ color: '#64748b', borderRadius: '6px' }}
                            >
                                <MoreVert fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </Toolbar>
            </AppBar>

            {/* Export Menu Dropdown */}
            <Menu
                anchorEl={anchorElExport}
                open={Boolean(anchorElExport)}
                onClose={() => setAnchorElExport(null)}
                slotProps={{
                    paper: {
                        elevation: 3,
                        sx: { minWidth: 160, borderRadius: '8px', mt: 0.5 }
                    }
                }}
            >
                <MenuItem onClick={() => { handleExport('bpmn'); setAnchorElExport(null); }} sx={{ fontSize: '0.825rem' }}>
                    Export as BPMN (.bpmn)
                </MenuItem>
                <MenuItem onClick={() => { handleExport('xml'); setAnchorElExport(null); }} sx={{ fontSize: '0.825rem' }}>
                    Export as XML (.xml)
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={() => { handleExport('png'); setAnchorElExport(null); }} sx={{ fontSize: '0.825rem' }}>
                    Export Image (.png)
                </MenuItem>
                <MenuItem onClick={() => { handleExport('jpg'); setAnchorElExport(null); }} sx={{ fontSize: '0.825rem' }}>
                    Export Image (.jpg)
                </MenuItem>
            </Menu>

            {/* File & More Menu */}
            <Menu
                id="mui-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                slotProps={{
                    paper: {
                        elevation: 3,
                        sx: { minWidth: 210, borderRadius: '8px', mt: 0.5 }
                    }
                }}
            >
                <MenuItem
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.bpmn,.xml';
                        input.onchange = (e) => {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const content = event.target.result;
                                onNewDiagram(content);
                            };
                            reader.readAsText(file);
                        };
                        input.click();
                        handleMenuClose();
                    }}
                    sx={{ fontSize: '0.825rem' }}
                >
                    Import Diagram
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        navigate('/bpmn-versions/' + encryptedID);
                    }}
                    sx={{ fontSize: '0.825rem' }}
                >
                    Version History
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        onPrint();
                    }}
                    sx={{ fontSize: '0.825rem' }}
                >
                    Print Diagram
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        handleDeleteDiagram();
                    }}
                    sx={{ fontSize: '0.825rem', color: '#dc2626' }}
                >
                    Delete Diagram
                </MenuItem>
            </Menu>

            {/* Clean Documentation Dialog */}
            <Dialog
                open={openDoc}
                onClose={() => setOpenDoc(false)}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: { borderRadius: '12px' }
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pb: 1,
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: '1.05rem',
                        fontWeight: 600
                    }}
                >
                    <span>Process Workflow Documentation</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tooltip title="Copy Text">
                            <IconButton size="small" onClick={handleCopy} disabled={isLoadingDoc}>
                                <FileCopy fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Export to PDF">
                            <IconButton size="small" onClick={handleDocumentationExport} disabled={isLoadingDoc}>
                                <GetApp fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </DialogTitle>
                <DialogContent sx={{ p: 2.5, minHeight: 280 }}>
                    {isLoadingDoc ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240, gap: 12 }}>
                            <CircularProgress size={32} />
                            <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Generating workflow documentation...
                            </Typography>
                        </div>
                    ) : (
                        <TextareaAutosize
                            value={isEditing ? editedText : documentation}
                            onChange={(e) => setEditedText(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '320px',
                                padding: '14px',
                                fontFamily: 'Inter, system-ui, sans-serif',
                                fontSize: '0.875rem',
                                lineHeight: '1.6',
                                color: '#1e293b',
                                resize: 'vertical',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                backgroundColor: '#f8fafc',
                                outline: 'none'
                            }}
                            disabled={!isEditing}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                    <Button
                        size="small"
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={isLoadingDoc || !documentation}
                        sx={{ textTransform: 'none', fontSize: '0.825rem' }}
                    >
                        {isEditing ? 'Done Editing' : 'Edit Text'}
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setOpenDoc(false)}
                        sx={{ textTransform: 'none', fontSize: '0.825rem' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Optimization Settings Dialog */}
            <Dialog
                open={Boolean(optidialog)}
                onClose={() => setOptidialog(false)}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: '12px' } } }}
            >
                <DialogTitle sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Optimize BPMN Workflow</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2, fontSize: '0.875rem', color: '#475569' }}>
                        Select an objective to analyze your process model and generate recommendations:
                    </DialogContentText>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        {[
                            { id: 'comprehensive', label: 'Comprehensive Optimization', desc: 'Balances cycle time, simplicity, and structural readability.' },
                            { id: 'parallel', label: 'Parallelization', desc: 'Converts sequential independent tasks into parallel branches.' },
                            { id: 'simplify', label: 'Simplification & Pruning', desc: 'Eliminates redundant verification steps and consolidates tasks.' },
                            { id: 'resilience', label: 'Error-Resilience', desc: 'Adds fallback paths, boundary error events, and safe terminations.' },
                        ].map((strategy) => (
                            <div
                                key={strategy.id}
                                onClick={() => setOptiGoal(strategy.id)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: optiGoal === strategy.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                    backgroundColor: optiGoal === strategy.id ? '#eff6ff' : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: optiGoal === strategy.id ? '#1d4ed8' : '#1e293b' }}>
                                    {strategy.label}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                                    {strategy.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOptidialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        sx={{ textTransform: 'none', backgroundColor: '#2563eb' }}
                        onClick={async () => {
                            setIsOptimizing(true);
                            setOptidialog(false);
                            try {
                                const url = config.apiBaseUrl + "/bpmn/optimize/" + encryptedID;
                                const token = await refreshAccessToken();
                                const response = await axios.post(
                                    url,
                                    { goal: optiGoal },
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                );
                                setOptimizationResult(response.data);
                            } catch (error) {
                                console.error("Optimization failed:", error);
                            } finally {
                                setIsOptimizing(false);
                            }
                        }}
                    >
                        Analyze & Optimize
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Optimization Results Dialog */}
            <Dialog
                open={Boolean(optimizationResult)}
                onClose={() => setOptimizationResult(null)}
                maxWidth="md"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: '12px' } } }}
            >
                <DialogTitle sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    Proposed Process Optimization
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
                        Summary of Enhancements:
                    </Typography>
                    <div
                        style={{
                            backgroundColor: '#f8fafc',
                            padding: '14px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.875rem',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-line',
                            color: '#334155',
                            maxHeight: '260px',
                            overflowY: 'auto'
                        }}
                    >
                        {optimizationResult?.msg || "Optimized BPMN 2.0 flow generated."}
                    </div>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Review the suggested improvements above. Clicking <strong>Apply Changes</strong> will update your active canvas with the optimized workflow.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOptimizationResult(null)} sx={{ textTransform: 'none' }}>
                        Discard
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ textTransform: 'none', backgroundColor: '#2563eb' }}
                        onClick={() => {
                            if (optimizationResult?.xml_data) {
                                onOptimizedXml(optimizationResult.xml_data);
                            }
                            setOptimizationResult(null);
                        }}
                    >
                        Apply Changes to Canvas
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Loading Backdrop */}
            <Backdrop open={isOptimizing} style={{ zIndex: 1300, color: '#fff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <CircularProgress color="inherit" />
                    <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>Analyzing process model...</Typography>
                </div>
            </Backdrop>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                slotProps={{ paper: { sx: { borderRadius: '10px' } } }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '0.875rem' }}>
                        Are you sure you want to delete this diagram? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenConfirmDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleConfirmDeleteDiagram} color="error" variant="contained" autoFocus sx={{ textTransform: 'none' }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <NotificationSnackBar
                open={notifOpen}
                onClose={handleClose}
                severity={notifSeverity}
                message={notifMessage}
            />
        </div>
    );
};

export default BpmnToolbar;
