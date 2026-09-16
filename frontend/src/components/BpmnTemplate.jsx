import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar.jsx';
import { refreshAccessToken } from './auth.jsx';
import config from "../config.js";

import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogContent,
    IconButton,
    InputAdornment,
    TextField,
    CircularProgress,
    Stack,
    Tooltip,
    Divider
} from '@mui/material';
import {
    Close,
    Search,
    AutoStoriesOutlined,
    ArrowForward,
    ZoomIn,
    ZoomOut,
    RestartAlt,
    AccountTreeOutlined,
    OpenInNew,
    CheckCircleOutline,
    LayersOutlined,
    FilterList
} from '@mui/icons-material';

const CATEGORY_MAP = {
    'Order-to-Cash (Procurement & Fulfillment)': 'Operations',
    'Employee Onboarding Workflow': 'Human Resources',
    'IT Incident Management & Resolution': 'IT Service',
    'Customer Support Ticket Escalation': 'Support',
    'Invoice Approval & Expense Reimbursement': 'Finance'
};

const STEP_COUNT_MAP = {
    'Order-to-Cash (Procurement & Fulfillment)': 7,
    'Employee Onboarding Workflow': 6,
    'IT Incident Management & Resolution': 7,
    'Customer Support Ticket Escalation': 6,
    'Invoice Approval & Expense Reimbursement': 7
};

const BpmnTemplate = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [instantiating, setInstantiating] = useState(false);

    // Zoom & pan controls for modal preview
    const [zoomLevel, setZoomLevel] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const navigate = useNavigate();

    const getTemplates = async () => {
        try {
            setLoading(true);
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/templates/";
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTemplates(response.data.templates || []);
        } catch (err) {
            console.error("Failed to load templates:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTemplates();
    }, []);

    const handleTemplatetoBpmn = async (template) => {
        if (!template) return;
        try {
            setInstantiating(true);
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/create-bpmn-diagram/";
            const response = await axios.post(
                url,
                {
                    templateXml: template.bpmn_xml,
                    templateSvg: template.bpmn_svg,
                    templateName: template.name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            navigate('/homepage/bpmn/' + response.data.encrypted_id);
        } catch (err) {
            console.error("Error creating BPMN diagram from template", err);
        } finally {
            setInstantiating(false);
        }
    };

    const handleClickOpen = (template) => {
        setSelectedTemplate(template);
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedTemplate(null);
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.005;
        const newZoom = Math.min(Math.max(zoomLevel + delta, 0.6), 3.5);
        setZoomLevel(newZoom);
    };

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

    const categories = useMemo(() => {
        const set = new Set(['All']);
        templates.forEach(t => {
            const cat = CATEGORY_MAP[t.name] || 'General';
            set.add(cat);
        });
        return Array.from(set);
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        return templates.filter((tpl) => {
            const cat = CATEGORY_MAP[tpl.name] || 'General';
            const matchesCat = selectedCategory === 'All' || cat === selectedCategory;
            const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tpl.description && tpl.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCat && matchesSearch;
        });
    }, [templates, selectedCategory, searchQuery]);

    const cleanDescription = (htmlStr) => {
        if (!htmlStr) return '';
        return htmlStr.replace(/<[^>]*>/g, '').trim();
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            <NavigationBar />

            {/* Main Content Area */}
            <Box sx={{ pt: '64px', pb: 10, flex: 1 }}>
                {/* Header Section */}
                <Box
                    sx={{
                        backgroundColor: '#ffffff',
                        borderBottom: '1px solid #e2e8f0',
                        py: { xs: 4, md: 5 },
                        px: { xs: 2.5, md: 4 }
                    }}
                >
                    <Container maxWidth="lg" disableGutters>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={2}
                            sx={{ mb: 3 }}
                        >
                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        fontWeight: 700,
                                        color: '#64748b',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    Workflow Library
                                </Typography>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#0f172a',
                                        letterSpacing: '-0.025em',
                                        mt: 0.5,
                                        fontSize: { xs: '1.6rem', md: '2rem' }
                                    }}
                                >
                                    Process Templates
                                </Typography>
                            </Box>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#64748b',
                                    maxWidth: 480,
                                    fontSize: '0.9rem',
                                    lineHeight: 1.5
                                }}
                            >
                                Production-grade BPMN 2.0 reference workflows. Click any template to inspect its sequence flow or instantiate a clean editable copy into Studio.
                            </Typography>
                        </Stack>

                        {/* Search and Filter Row */}
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={2}
                            alignItems={{ xs: 'stretch', md: 'center' }}
                            justifyContent="space-between"
                            sx={{ pt: 1 }}
                        >
                            {/* Category Filter Pills */}
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    overflowX: 'auto',
                                    pb: { xs: 1, md: 0 },
                                    '::-webkit-scrollbar': { display: 'none' }
                                }}
                            >
                                {categories.map((cat) => {
                                    const active = selectedCategory === cat;
                                    return (
                                        <Button
                                            key={cat}
                                            size="small"
                                            onClick={() => setSelectedCategory(cat)}
                                            sx={{
                                                textTransform: 'none',
                                                borderRadius: '20px',
                                                px: 2,
                                                py: 0.5,
                                                fontSize: '0.825rem',
                                                fontWeight: active ? 600 : 500,
                                                whiteSpace: 'nowrap',
                                                color: active ? '#ffffff' : '#475569',
                                                backgroundColor: active ? '#0f172a' : '#f1f5f9',
                                                border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
                                                '&:hover': {
                                                    backgroundColor: active ? '#1e293b' : '#e2e8f0'
                                                }
                                            }}
                                        >
                                            {cat}
                                        </Button>
                                    );
                                })}
                            </Stack>

                            {/* Search Input */}
                            <TextField
                                size="small"
                                placeholder="Search by name or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{
                                    minWidth: { xs: '100%', md: 280 },
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        backgroundColor: '#f8fafc',
                                        fontSize: '0.875rem'
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: '#94a3b8', fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>
                    </Container>
                </Box>

                {/* Gallery Grid */}
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 16 }}>
                            <CircularProgress size={32} sx={{ color: '#0f172a' }} />
                        </Box>
                    ) : filteredTemplates.length === 0 ? (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 12,
                                px: 4,
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                border: '1px dashed #cbd5e1'
                            }}
                        >
                            <AutoStoriesOutlined sx={{ fontSize: 36, color: '#94a3b8', mb: 1.5 }} />
                            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>
                                No matching templates found
                            </Typography>
                            <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.5 }}>
                                Try searching for another keyword or select a different category.
                            </Typography>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                    lg: 'repeat(3, 1fr)'
                                },
                                gap: 3
                            }}
                        >
                            {filteredTemplates.map((template) => {
                                const category = CATEGORY_MAP[template.name] || 'General';
                                const steps = STEP_COUNT_MAP[template.name] || 6;
                                const previewSrc = template.bpmn_svg
                                    ? `data:image/svg+xml;utf8,${encodeURIComponent(template.bpmn_svg)}`
                                    : '/folia.svg';

                                return (
                                    <Card
                                        key={template.id}
                                        elevation={0}
                                        sx={{
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            backgroundColor: '#ffffff',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                                            '&:hover': {
                                                borderColor: '#94a3b8',
                                                boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.08)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        {/* Diagram Vector Thumbnail Canvas */}
                                        <Box
                                            onClick={() => handleClickOpen(template)}
                                            sx={{
                                                height: 190,
                                                backgroundColor: '#f8fafc',
                                                borderBottom: '1px solid #f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 2.5,
                                                cursor: 'pointer',
                                                position: 'relative'
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={previewSrc}
                                                alt={template.name}
                                                sx={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain',
                                                    filter: 'contrast(1.02)'
                                                }}
                                            />

                                            {/* Department Tag */}
                                            <Chip
                                                size="small"
                                                label={category}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    left: 12,
                                                    height: '22px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    backgroundColor: '#ffffff',
                                                    color: '#334155',
                                                    border: '1px solid #e2e8f0'
                                                }}
                                            />
                                        </Box>

                                        {/* Card Metadata & Actions */}
                                        <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Typography
                                                variant="subtitle1"
                                                onClick={() => handleClickOpen(template)}
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#0f172a',
                                                    fontSize: '0.975rem',
                                                    lineHeight: 1.35,
                                                    cursor: 'pointer',
                                                    mb: 1,
                                                    '&:hover': { color: '#2563eb' }
                                                }}
                                            >
                                                {template.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#64748b',
                                                    fontSize: '0.825rem',
                                                    lineHeight: 1.55,
                                                    mb: 2.5,
                                                    flex: 1,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {cleanDescription(template.description)}
                                            </Typography>

                                            <Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />

                                            {/* Footer Action Bar */}
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#94a3b8',
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5
                                                    }}
                                                >
                                                    <LayersOutlined sx={{ fontSize: 15 }} />
                                                    {steps} activities
                                                </Typography>

                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleClickOpen(template)}
                                                        sx={{
                                                            textTransform: 'none',
                                                            color: '#475569',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            px: 1.5,
                                                            py: 0.5,
                                                            borderRadius: '6px',
                                                            '&:hover': {
                                                                backgroundColor: '#f1f5f9'
                                                            }
                                                        }}
                                                    >
                                                        Preview
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() => handleTemplatetoBpmn(template)}
                                                        disabled={instantiating}
                                                        sx={{
                                                            textTransform: 'none',
                                                            backgroundColor: '#0f172a',
                                                            color: '#ffffff',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            px: 1.75,
                                                            py: 0.5,
                                                            borderRadius: '6px',
                                                            boxShadow: 'none',
                                                            '&:hover': {
                                                                backgroundColor: '#1e293b',
                                                                boxShadow: 'none'
                                                            }
                                                        }}
                                                    >
                                                        Use
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    )}
                </Container>
            </Box>

            {/* Minimalist Centered Preview Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.18)',
                        overflow: 'hidden',
                        m: { xs: 2, md: 4 }
                    }
                }}
            >
                {/* Modal Header */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#ffffff'
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Chip
                            size="small"
                            label={CATEGORY_MAP[selectedTemplate?.name] || 'General'}
                            sx={{
                                height: '22px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                backgroundColor: '#f1f5f9',
                                color: '#334155'
                            }}
                        />
                        <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>
                            {selectedTemplate?.name}
                        </Typography>
                    </Stack>

                    <IconButton size="small" onClick={handleClose} sx={{ color: '#64748b' }}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>

                {/* Modal Body */}
                <DialogContent sx={{ p: 0, backgroundColor: '#ffffff' }}>
                    {/* Interactive Zoom Canvas */}
                    <Box
                        sx={{
                            height: 380,
                            backgroundColor: '#f8fafc',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                        }}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Floating Zoom Bar */}
                        <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{
                                position: 'absolute',
                                bottom: 12,
                                right: 12,
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                p: 0.5,
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                                zIndex: 5
                            }}
                        >
                            <Tooltip title="Zoom in">
                                <IconButton
                                    size="small"
                                    onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3.5))}
                                    sx={{ color: '#475569' }}
                                >
                                    <ZoomIn fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Zoom out">
                                <IconButton
                                    size="small"
                                    onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.6))}
                                    sx={{ color: '#475569' }}
                                >
                                    <ZoomOut fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Reset">
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setZoomLevel(1);
                                        setPosition({ x: 0, y: 0 });
                                    }}
                                    sx={{ color: '#475569' }}
                                >
                                    <RestartAlt fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>

                        {/* Rendered SVG */}
                        <Box
                            component="img"
                            src={
                                selectedTemplate?.bpmn_svg
                                    ? `data:image/svg+xml;utf8,${encodeURIComponent(selectedTemplate.bpmn_svg)}`
                                    : '/folia.svg'
                            }
                            alt={selectedTemplate?.name}
                            sx={{
                                maxWidth: '92%',
                                maxHeight: '92%',
                                objectFit: 'contain',
                                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                userSelect: 'none',
                                pointerEvents: 'none'
                            }}
                        />
                    </Box>

                    {/* Bottom Metadata & Primary Action */}
                    <Box sx={{ p: 3 }}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={2}
                        >
                            <Box sx={{ maxWidth: 500 }}>
                                <Typography sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55 }}>
                                    {cleanDescription(selectedTemplate?.description)}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: '#94a3b8', mt: 1, display: 'block', fontSize: '0.75rem' }}
                                >
                                    Format: BPMN 2.0 XML with full DI layout. Ready for editing in Studio.
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleClose}
                                    sx={{
                                        flex: { xs: 1, sm: 'none' },
                                        textTransform: 'none',
                                        borderColor: '#cbd5e1',
                                        color: '#334155',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        px: 2.5,
                                        '&:hover': {
                                            borderColor: '#94a3b8',
                                            backgroundColor: '#f8fafc'
                                        }
                                    }}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="contained"
                                    endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                                    onClick={() => {
                                        handleClose();
                                        handleTemplatetoBpmn(selectedTemplate);
                                    }}
                                    disabled={instantiating}
                                    sx={{
                                        flex: { xs: 1, sm: 'none' },
                                        textTransform: 'none',
                                        backgroundColor: '#0f172a',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        px: 3,
                                        boxShadow: 'none',
                                        '&:hover': {
                                            backgroundColor: '#1e293b',
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    Open in Studio
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default BpmnTemplate;