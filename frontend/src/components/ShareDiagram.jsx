import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import NotificationSnackBar from './NotificationSnackbar';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, TextField, Typography,
    Box, List, ListItem, MenuItem
} from '@mui/material';
import { Share, Delete } from '@mui/icons-material';

import { red } from '@mui/material/colors';

import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import { refreshAccessToken } from './auth';
import config from '../config';

export default function ShareSlidesDialog(permissions) {
    const { encryptedID } = useParams();
    // Local state for controlling dialog open/close
    const [open, setOpen] = useState(false);

    // State for access type (public/restricted)
    const [accessType, setAccessType] = useState('');
    // State for the invite text field and the list of newly invited people
    const [inviteInput, setInviteInput] = useState('');
    const [invitedList, setInvitedList] = useState('');
    const [reply, setReply] = useState('');
    // State for the access type
    const [accessList, setAccessList] = useState([]);

    // State for the owner of the diagram
    const [owner, setOwner] = useState([]);

    // State for the diagram privacy
    const [diagramPrivacy, setDiagramPrivacy] = useState('');

    const [permittedEmail, setPermittedEmail] = useState('');

    const [permittedEmailPermission, setPermittedEmailPermission] = useState('');

    const [publicAccessOptions, setPublicAccessOptions] = useState('');
    const [snackbaropen, setSnackbaropen] = useState(false);
    const [notifMessage, setNotifMessage] = useState('');
    const [notifSeverity, setNotifSeverity] = useState('success');

    const SharedData = async () => {
        try {
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/diagram-share/" + encryptedID;
            const dataToSend = {};

            if (inviteInput) dataToSend.inviteInput = inviteInput;
            if (permittedEmail) dataToSend.permittedEmail = permittedEmail;
            if (permittedEmailPermission) dataToSend.permittedEmailPermission = permittedEmailPermission;
            if (accessType) dataToSend.accessType = accessType;

            const response = await axios.put(url,
                dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            setDiagramPrivacy(response.data.DiagramPrivacy)
            setAccessList(response.data.sharedWith);
            setOwner(response.data.owner);
            setReply(response.data.reply);
            // setPermittedEmail('');
            // setPermittedEmailPermission('');

            if (response.data.reply) {
                setNotifMessage(response.data.reply);
                setNotifSeverity(response.data.severity);
                setSnackbaropen(true);
            }
        } catch (err) {
            console.log("Error in share", err);
        }
    }

    const handleRemoveEmail = async (email) => {
        try {
            const token = await refreshAccessToken();
            const url = config.apiBaseUrl + "/bpmn/diagram-share/" + encryptedID;
            await axios.delete(url, {
                data: { email },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAccessList(accessList.filter(item => item.name !== email));
            setNotifMessage("User removed successfully");
            setNotifSeverity('success');
            setSnackbaropen(true);
        } catch (err) {
            console.log("Error in removing user", err);
        }
    };

    useEffect(() => {
        SharedData();
    }, []);

    useEffect(() => {
        if (permittedEmail || permittedEmailPermission || diagramPrivacy || accessType) {
            SharedData();
        }
    }, [permittedEmail, permittedEmailPermission, diagramPrivacy, accessType]);

    const handleInvite = () => {
        if (!inviteInput.trim()) {  // Check if input is empty or only whitespace
            setNotifMessage("Please enter an email address");
            setNotifSeverity('error');
            setSnackbaropen(true);
            return;
        }
        SharedData();
        setInviteInput('');
    };

    const handleCopyLink = () => {
        //  actual "copy link" logic 
        const linkToCopy = window.location.href;
        navigator.clipboard.writeText(linkToCopy).then(() => {
            setNotifMessage("Link copied to clipboard");
            setNotifSeverity('success');
            setSnackbaropen(true);
        }).catch(err => {
            console.error('Failed to copy link:', err);
        });
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbaropen(false);
    };

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16 }} onClick={() => setOpen(true)}>
                <IconButton size="small" aria-label="share">
                    <Share fontSize="small" />
                </IconButton>
                <Typography variant="caption" style={{ fontSize: '0.65rem' }}>Share</Typography></div>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ position: 'relative', padding: '12px 24px', fontSize: '1rem' }}>
                    Share Diagram

                    <Button
                        variant="text"
                        startIcon={<LinkIcon />}
                        onClick={handleCopyLink}
                        sx={{ position: 'absolute', right: 48, top: 8, fontSize: '0.75rem' }}
                    >
                        Copy link
                    </Button>

                    <IconButton
                        aria-label="close"
                        onClick={() => setOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ padding: '12px' }}>
                    <Box sx={{ mb: 1.5 }}>
                        {reply ?
                            <Typography
                                color="info"
                                variant="caption"
                                sx={{
                                    fontSize: '0.75rem',
                                    display: 'block',
                                    marginBottom: '8px'
                                }}
                            >
                                {reply}
                            </Typography>
                            :
                            invitedList && (
                                <Typography
                                    color="error"
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.75rem',
                                        display: 'block',
                                        marginBottom: '8px'
                                    }}
                                >
                                    {invitedList}
                                </Typography>
                            )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Share with others by email"
                            value={inviteInput}
                            onChange={(e) => setInviteInput(e.target.value)}
                            disabled={permissions.permissions !== 'editor'}
                            sx={{ '& .MuiInputBase-root': { height: 40, fontSize: '0.75rem' } }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleInvite}
                            disabled={permissions.permissions !== 'editor'}
                            sx={{ height: 40, fontSize: '0.75rem' }}
                        >
                            SHARE
                        </Button>
                    </Box>

                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.disabled', fontSize: '0.75rem' }}>
                        Who has access
                    </Typography>

                    <List dense>
                        <ListItem disableGutters sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Typography sx={{ fontSize: '0.75rem' }}>{owner && owner.name}</Typography>
                            <TextField
                                select
                                disabled
                                size="small"
                                defaultValue={owner.permission}
                                variant="standard"
                                slotProps={{ input: { disableUnderline: true } }}
                                sx={{ '& .MuiInputBase-root': { fontSize: '0.75rem' } }}
                            >
                                <MenuItem value={owner.permission} sx={{ fontSize: '0.75rem' }}>{owner.permission}</MenuItem>
                            </TextField>
                        </ListItem>
                        {accessList.map((item, idx) => (
                            <ListItem key={idx} disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ fontSize: '0.75rem' }}>{item.name}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                    select
                                    defaultValue={item.permission}
                                    size="small"
                                    variant="standard"
                                        disabled={permissions.permissions !== 'editor'}
                                    slotProps={{ input: { disableUnderline: true } }}
                                    sx={{ '& .MuiInputBase-root': { fontSize: '0.75rem' } }}
                                    onChange={(e) => {
                                        // console.log(`Changed permission for ${item.name} to ${e.target.value}`)
                                        setPermittedEmail(item.name)
                                        setPermittedEmailPermission(e.target.value)
                                        setAccessType('')
                                    }}
                                >
                                    <MenuItem value="viewer" sx={{ fontSize: '0.75rem' }}>Viewer</MenuItem>
                                    <MenuItem value="editor" sx={{ fontSize: '0.75rem' }}>Editor</MenuItem>
                                    <MenuItem value="commenter" sx={{ fontSize: '0.75rem' }}>Commenter</MenuItem>
                                </TextField>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveEmail(item.name)}
                                        sx={{ 
                                            marginLeft: 1,
                                            '&:hover': {
                                                '& .MuiSvgIcon-root': {
                                                    color: red[500]
                                                }
                                            }
                                        }}
                                        title="Remove user"
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.disabled', fontSize: '0.75rem' }}>
                        General access
                    </Typography>
                    <List dense>
                        <ListItem disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <TextField
                                select
                                value={diagramPrivacy}
                                size="small"
                                variant="standard"
                                disabled={permissions.permissions !== 'editor'}
                                slotProps={{ input: { disableUnderline: true } }}
                                onChange={(e) => {
                                    setAccessType(e.target.value)
                                }}
                                sx={{ '& .MuiInputBase-root': { fontSize: '0.75rem' } }}
                            >
                                <MenuItem value="public" sx={{ fontSize: '0.75rem' }}>Public</MenuItem>
                                <MenuItem value="restricted" sx={{ fontSize: '0.75rem' }}>Restricted</MenuItem>
                            </TextField>
                            {accessType === 'public' ? (
                                <>
                                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.disabled', fontSize: '0.75rem' }}>
                                        Anyone on the internet with the link can view.
                                    </Typography>
                                    <TextField
                                        select
                                        disabled
                                        defaultValue="view"
                                        size="small"
                                        variant="standard"
                                        slotProps={{ input: { disableUnderline: true } }}
                                        sx={{ '& .MuiInputBase-root': { fontSize: '0.75rem' } }}

                                    >
                                        <MenuItem value="view" sx={{ fontSize: '0.75rem' }}>View</MenuItem>
                                        {/* <MenuItem value="comment" sx={{ fontSize: '0.75rem' }}>Comment</MenuItem> */}
                                    </TextField>
                                </>
                            ) : (
                                <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.disabled', fontSize: '0.75rem' }}>
                                    Only people with access can open with the link.
                                </Typography>
                            )}
                        </ListItem>
                    </List>
                </DialogContent>

                <DialogActions sx={{ padding: '8px' }}>
                </DialogActions>
            </Dialog>
            <NotificationSnackBar
                open={snackbaropen}
                onClose={handleClose}
                severity={notifSeverity}
                message={notifMessage}
            />
        </div>
    );
}
