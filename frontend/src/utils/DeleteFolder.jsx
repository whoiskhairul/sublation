import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

function DeleteFolder({ openConfirmDialog, setOpenConfirmDialog, handleConfirmDeleteDiagram }) {
    return (
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
    );
}
export default DeleteFolder;
