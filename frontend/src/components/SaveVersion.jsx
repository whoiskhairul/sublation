import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React,{ forwardRef } from 'react';

const SaveVersionDialog = forwardRef(({ isOpen, onClose, onSubmit }, ref) => {
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const formJson = Object.fromEntries(formData.entries());
        onSubmit(formJson.versionName);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            PaperProps={{
                ref, // Pass ref here
                component: 'form',
                onSubmit: handleSubmit,
            }}
        >
            <DialogTitle>Enter Version Name</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="versionName"
                    label="Version Name"
                    type="text"
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button type="submit">Save</Button>
            </DialogActions>
        </Dialog>
    );
});

export default SaveVersionDialog;
