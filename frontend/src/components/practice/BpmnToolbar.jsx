// Import necessary libraries
import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {refreshAccessToken} from '../auth.jsx';
import ShareDiagram from '../ShareDiagram.jsx';

import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Button, Tooltip, Paper, Divider, Alert, TextField } from '@mui/material';
import { Undo, Redo, FolderOpen, ZoomIn, ZoomOut, Share, FileDownload, Save, Edit, Replay, MoreVert } from '@mui/icons-material';


import RenameDiagramDialog from '../updates/RenameDiagramDialog';

const BpmnToolbar = ({ diagramName, onNewDiagram, onSaveClick, onZoomIn, onZoomOut, onReset, onUndo, onRedo }) => {
    const { encryptedID } = useParams();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorElExport, setAnchorElExport] = React.useState(null); // For Export dropdown

    const open = Boolean(anchorEl);


        
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
        if (!localDiagramName &&  diagramName){
            setLocalDiagramName(diagramName);

        }
        
    })

    const handleNameChange = (e) => {
        setLocalDiagramName(e.target.value);
    };

    const submitDiagramName = async () => {
        try {
            const token = await refreshAccessToken();
            const response = await axios.put(
              `http://127.0.0.1:8000/bpmn/save-bpmn/${encryptedID}`,
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
              console.log('Diagram renamed successfully');
            }
          } catch (error) {
            console.error('Failed to rename diagram:', error);
          }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            submitDiagramName();
            e.preventDefault();
            e.target.blur();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                <TextField
                    id='renemeDiagram'
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
                            width: `${localDiagramName.length+3}ch`,
                            // width: 'auto',
                            minWidth: '4ch',
                            marginX: '1rem'
                        },
                        '& .MuiInput-underline:before': {
                            borderBottom: 'none'
                        },
                        '&:hover .MuiInput:before': {
                            borderBottom: '2px solid rgba(0, 0, 0, 0.42)'
                        }
                    }}
                />
            </div>
            <AppBar position="static" style={{ backgroundColor: '#fff', color: '#333', boxShadow: 'none', border: '1px solid #ddd' }}>
                <Toolbar style={{ justifyContent: 'space-between' }}>
                    {/* Left Section */}
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <IconButton size="small" aria-label="open-bpmn" onClick={handleMenuClick}>
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

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16 }} onClick={onSaveClick}>
                            <IconButton size="small" aria-label="save">
                                <Save fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Save</Typography>
                        </div>

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
                    </div>
                    {/* Right Section */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ShareDiagram />

                        {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16 }}>
                            <IconButton size="small" aria-label="export" onClick={handleExport}>
                                <FileDownload fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: '0.7rem' }}>Export</Typography>
                        </div> */}
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
                                onClick={handleMenuClick}
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
                        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Delete</MenuItem>
                        <Divider />
                        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Version History</MenuItem>
                        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Details</MenuItem>
                        <Divider />
                        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.8rem' }}>Print</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default BpmnToolbar;
