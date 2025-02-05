import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';


import NavigationBar from './NavigationBar.jsx';
import { refreshAccessToken } from './auth.jsx';
import config from "../config.js";

import { Container, AppBar, Toolbar, IconButton, Button, List, ListItemButton, Divider, ListItemText, Grid2 as Grid, Card, Slide, CardActionArea, CardContent, CardMedia, Typography, Dialog, DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import { Close, } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const BpmnTemplate = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [open, setOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { hash, pathname, search } = location;

    const getTemplates = async () => {
        try {
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/templates/";
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTemplates(response.data.templates);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getTemplates();
    }, []);

    const handleTemplatetoBpmn = async (templateXml, templateSvg) => {
        try {
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/create-bpmn-diagram/";
            const response = await axios.post(url,
                {
                    templateXml: templateXml,
                    templateSvg: templateSvg,

                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            navigate('/homepage/bpmn/' + response.data.encrypted_id)

        } catch (err) {
            console.log("Error creating BPMN diagram", err);
        }
    }

    useEffect(() => {
        if (!open) {
            setSelectedTemplate(null);
        }
    }, [open]);


    const handleClickOpen = (template) => {
        setSelectedTemplate(template);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedTemplate(null);
    };



    const [zoomLevel, setZoomLevel] = useState(1);

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newZoom = Math.min(Math.max(zoomLevel + delta, 0.5), 5);
        setZoomLevel(newZoom);
    };

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div>
            <NavigationBar />
            <Container sx={{ my: 8 }}>
                <Typography variant="h4" gutterBottom>
                    Select a Template
                </Typography>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Grid container spacing={4}>
                        {templates.map((template) => (
                            <Grid xs={12} sm={6} md={4} key={template.id}>
                                <Card sx={{ maxWidth: 345, minWidth: 345 }} onClick={() => handleClickOpen(template)}>
                                    <CardActionArea>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={template.bpmn_svg ? `data:image/svg+xml;utf8,${encodeURIComponent(template.bpmn_svg)}` : '/folia.svg'}
                                            style={{
                                                objectFit: 'contain',
                                                transform: 'scale(1)',
                                                transformOrigin: 'center center'
                                            }}
                                            alt="image"
                                        />
                                        <CardContent>
                                            <Typography gutterBottom variant="h6" component="div" noWrap>
                                                {template.name}
                                            </Typography>
                                            {/* <Typography variant="body2" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {template.description}
                                            </Typography> */}
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>

                <Dialog
                    fullScreen
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Transition}
                >
                    <AppBar sx={{ position: 'relative' }}>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleClose}
                                aria-label="close"
                            >
                                <Close />
                            </IconButton>
                            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div" noWrap>
                                {selectedTemplate?.name}
                            </Typography>
                            <Button autoFocus color="inherit" onClick={
                                () => {
                                    handleClose();
                                    handleTemplatetoBpmn(selectedTemplate.bpmn_xml, selectedTemplate.bpmn_svg);
                                }
                            }>
                                Use Template
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <div className='description' style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
                        <div style={{ width: '50%', padding: '20px' }}>
                            <Typography variant="h6" gutterBottom>
                                Description
                            </Typography>
                            {/* <Typography variant="body1" gutterBottom>
                                {selectedTemplate?.description}
                            </Typography> */}
                            <div
                                style={{ color: 'rgba(0, 0, 0, 0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                dangerouslySetInnerHTML={{ __html: selectedTemplate?.description }}
                            />
                        </div>
                        <div
                            style={{ width: '50%', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', padding: '20px', overflow: 'hidden' }}
                            onWheel={handleWheel}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img
                                src={selectedTemplate?.bpmn_svg ? `data:image/svg+xml;utf8,${encodeURIComponent(selectedTemplate.bpmn_svg)}` : '/folia.svg'}
                                alt="image"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                    cursor: zoomLevel > 1 ? 'grab' : 'default',
                                    userSelect: 'none'
                                }}
                            />
                        </div>
                    </div>
                </Dialog>
            </Container>
        </div>
    );
};

export default BpmnTemplate;