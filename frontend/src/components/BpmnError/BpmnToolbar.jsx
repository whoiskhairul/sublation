// Import necessary libraries
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { refreshAccessToken } from '../auth.jsx';
import ShareDiagram from '../ShareDiagram.jsx';
import NotificationSnackBar from '../NotificationSnackbar.jsx';
import config from "../../config.js";

import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Button, Tooltip, Paper, Chip, Divider, Alert, TextField } from '@mui/material';
import { Undo, Redo, FolderOpen, ZoomIn, ZoomOut, Share, FileDownload, Save, Edit, Replay, MoreVert,Timeline,BookmarkAdd} from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

import RenameDiagramDialog from '../updates/RenameDiagramDialog';

import Modal from '@mui/material/Modal';
import { FileCopy, GetApp } from '@mui/icons-material';
import { TextareaAutosize } from '@mui/material';
import { Description  } from '@mui/icons-material';

const BpmnToolbar = ({ diagramName, permissions, onNewDiagram,
    onSaveClick, onZoomIn, onZoomOut, onReset, onUndo, onRedo,
    onPrint,onTimeLineClick,onSaveAsClick }) => {
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
    
        const handleGenerateDocumentation = async () => {
    
          setOpenDoc(true);  // Show modal immediately when button is clicked
          setIsLoadingDoc(true); // Show loading state
      
            try {
                // Send request to documentation API
                const url = config.apiBaseUrl + '/bpmn/generate-bpmn-documentation/';
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
            }finally {
              setIsLoadingDoc(false); // Remove loading state when response arrives
          }
        };
    
        const handleCopy = () => {
            navigator.clipboard.writeText(editedText);
        };
    
        const handleDocumentationExport = () => {
            const blob = new Blob([editedText], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'BPMN_Documentation.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
        <div>
            <Paper
                elevation={0}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingX: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    marginX: '2px',
                    marginTop: '65px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {permissions === 'editor' ? (
                        <TextField
                            id='renameDiagram'
                            value={localDiagramName}
                            type="text"
                            name='name'
                            variant="standard"
                            onChange={handleNameChange}
                            onBlur={submitDiagramName}
                            onKeyDown={handleKeyDown}
                            sx={{
                                width: 'auto',
                                '& .MuiInputBase-input': {
                                    width: `${localDiagramName.length + 3}ch`,
                                    minWidth: '4ch',
                                    marginX: '1rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                },
                                '& .MuiInput-underline:before': {
                                    borderBottom: 'none'
                                },
                                '&:hover .MuiInput:before': {
                                    borderBottom: '2px solid rgba(0, 0, 0, 0.42)'
                                }
                            }}
                        />
                    ) : (
                        <Typography
                            variant="h6"
                            sx={{
                                marginX: '1rem',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: 'rgba(0, 0, 0, 0.87)'
                            }}
                        >
                            {localDiagramName}
                        </Typography>
                    )}
                </div>
                <Chip
                    label={permissions}
                    size="small"
                    color={permissions === 'editor' ? 'primary' : 'secondary'}
                    sx={{
                        marginRight: '1rem',
                        padding: '4px 8px 4px 8px',
                        textTransform: 'capitalize',
                        fontWeight: 500
                    }}
                />
            </Paper>

            <AppBar position="static" style={{ backgroundColor: '#fff', color: '#333', boxShadow: 'none', border: '1px solid #ddd' }}>
                <Toolbar style={{ justifyContent: 'space-between' }}>
                    {/* Left Section */}
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <IconButton size="small" aria-label="open-bpmn" onClick={handleMenuClick} disabled={permissions !== 'editor'}>
                                <FolderOpen fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>File</Typography>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16 }}>
                            <IconButton size="small" aria-label="undo" onClick={onUndo}>
                                <Undo fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Undo</Typography>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8 }}>
                            <IconButton size="small" aria-label="redo" onClick={onRedo}>
                                <Redo fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Redo</Typography>
                        </div>

                        {permissions === 'editor' ?
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16 }} onClick={onSaveClick}>
                                <IconButton size="small" aria-label="save">
                                    <Save fontSize="small" />
                                </IconButton>
                                <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Save</Typography>
                            </div>
                            : ''
                        }



                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16 }} onClick={onReset}>
                            <IconButton size="small" aria-label="save" onClick={onReset}>
                                <Replay fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Reset</Typography>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16 }}>
                            <IconButton size="small" aria-label="zoom-in" onClick={onZoomIn}>
                                <ZoomIn fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Zoom In</Typography>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8 }}>
                            <IconButton size="small" aria-label="zoom-out" onClick={onZoomOut}>
                                <ZoomOut fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Zoom Out</Typography>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8 }}>
                            <IconButton size="small" aria-label="make-a-version" onClick={onSaveAsClick}>
                                <BookmarkAdd fontSize="small" />
                            </IconButton>

                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Save as Version</Typography>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8 }}>
                            <IconButton size="small" aria-label="timeline" onClick={onTimeLineClick}>
                                <Timeline fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Timeline</Typography>
                        </div>

                        {/* Smart Documention Generator */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8 }}>
                            <IconButton size="small" aria-label="Documentation" onClick={handleGenerateDocumentation}>
                                <Description fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Documentation</Typography>

                             <Modal open={openDoc} onClose={() => setOpenDoc(false)}>
                                        <div style={{ 
                                            backgroundColor: 'white', 
                                            padding: '20px', 
                                            margin: '5% auto', 
                                            width: '60%', 
                                            maxHeight: '80vh', 
                                            borderRadius: '8px',
                                            fontFamily: 'Arial, sans-serif',
                                            fontSize: '12px',
                                            color: 'black', 
                                            overflowY: 'auto'             
                                        }}>
                                            <div
                                              style={{
                                                marginTop: "5px",
                                                marginBottom: "3px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                width: "100%",
                                              }}
                                            >
                                                <h1 style={{ margin: 0 }}>Smart BPMN Workflow Documentation</h1>
                                                <div>
                                                    <IconButton onClick={handleCopy}><FileCopy /></IconButton>
                                                    <IconButton onClick={handleDocumentationExport}><GetApp /></IconButton>
                                                </div>
                                            </div>   
                            
                                            {/* Display Loading Text or Documentation */}
                                            {isLoadingDoc ? (
                                                <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '20px' }}>
                                                    <p>⏳Documentation Generating...</p>
                                                </div>
                                            ) : (
                                                <TextareaAutosize
                                                    value={isEditing ? editedText : documentation}
                                                    onChange={(e) => setEditedText(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        height: '300px',
                                                        padding: '10px',
                                                        fontFamily: 'Arial, sans-serif',
                                                        fontSize: '20px',
                                                        color: 'black',
                                                        resize: 'none',
                                                        overflowY: 'auto',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '5px'
                                                    }}
                                                    disabled={!isEditing}
                                                />  
                                            )}
                                        </div>
                                    </Modal>
                        </div>

                    </div>
                    {/* Right Section */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {permissions ?
                            <ShareDiagram permissions={permissions} />
                            :
                            ''
                        }


                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16 }} onMouseLeave={() => setAnchorElExport(null)}>
                            <IconButton
                                size="small"
                                aria-label="export"
                                onClick={(e) => setAnchorElExport(e.currentTarget)} // Open the dropdown
                            >
                                <FileDownload fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Export</Typography>

                            {/* Dropdown Menu */}
                            <Menu
                                anchorEl={anchorElExport}
                                open={Boolean(anchorElExport)}
                                onClose={() => setAnchorElExport(null)}
                                onMouseLeave={() => setAnchorElExport(null)}
                            >
                                <MenuItem onClick={() => handleExport('bpmn')} sx={{ fontSize: '0.8rem' }}>Export as BPMN</MenuItem>
                                <MenuItem onClick={() => handleExport('xml')} sx={{ fontSize: '0.8rem' }}>Export as XML</MenuItem>
                                <MenuItem onClick={() => handleExport('png')} sx={{ fontSize: '0.8rem' }}>Export as PNG</MenuItem>
                                <MenuItem onClick={() => handleExport('jpg')} sx={{ fontSize: '0.8rem' }}>Export as JPG</MenuItem>
                            </Menu>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16 }}>
                            <IconButton
                                size="small"
                                aria-controls={open ? 'mui-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                            // onClick={handleMenuClick}
                            >
                                <MoreVert fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>More</Typography>
                        </div>
                    </div>

                    <Menu
                        id="mui-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        slotProps={{
                            paper: {
                                style: {
                                    width: '220px',
                                    maxWidth: '100%'
                                }
                            }
                        }}
                    >
                        <MenuItem onClick={() => {
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
                            sx={{ fontSize: '0.8rem' }}
                        >
                            Import Diagram
                        </MenuItem>

                        <Divider />
                        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Make a copy</MenuItem>
                        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Share</MenuItem>
                        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Email</MenuItem>
                        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Export</MenuItem>
                        <Divider />
                        {/* <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Rename</MenuItem> */}
                        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Move</MenuItem>
                        {/* <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Delete</MenuItem> */}
                        <MenuItem onClick={() => {
                            handleMenuClose();
                            handleDeleteDiagram();
                        }} sx={{ fontSize: '0.8rem' }}>Delete</MenuItem>
                        <Divider />
                        <MenuItem onClick={() =>{
                            handleMenuClose;
                            navigate('/bpmn-versions/'+encryptedID);
                        }} sx={{ fontSize: '0.8rem' }}>Version History</MenuItem>
                        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Details</MenuItem>
                        <Divider />
                        <MenuItem onClick={() => {
                            handleMenuClose();
                            onPrint()
                        }
                        } sx={{ fontSize: '0.8rem' }}>Print</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this diagram? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDeleteDiagram} color="error" autoFocus>
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
