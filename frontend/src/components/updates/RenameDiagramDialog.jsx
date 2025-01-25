import React, { useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { refreshAccessToken } from '../auth.jsx';
import config from '../../config.js';

function RenameDiagramDialog({ 
  open, 
  onClose, 
  encryptedDiagramID, 
  diagrams, 
  setDiagrams 
}) {
  console.log("renaming diagram", encryptedDiagramID);
  const [newName, setNewName] = useState('');

  const handleSubmitRename = async () => {

    try {
      const token = await refreshAccessToken();
      const url = config.apiBaseUrl + `/bpmn/save-bpmn/${encryptedDiagramID}`;
      const response = await axios.put(
        url,
        {
          name: newName
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
        let updatedDiagram = diagrams.map(diagram => 
          diagram.encrypted_id === encryptedDiagramID 
            ? { ...diagram, name: newName } 
            : diagram
        );
        let firstDiagram = updatedDiagram.filter(diagram => diagram.encrypted_id === encryptedDiagramID);
        let otherDiagrams = updatedDiagram.filter(diagram => diagram.encrypted_id !== encryptedDiagramID);
        updatedDiagram = [firstDiagram[0], ...otherDiagrams];
        setDiagrams(updatedDiagram);
      }
      setNewName('');
      onClose();
    } catch (error) {
      console.error('Failed to rename diagram:', error);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
        <Typography variant="body2" fontSize="1rem" style={{ marginRight: '8px' }}>{diagramName}</Typography>
        
        <IconButton variant="contained" size="small" aria-label="edit-diagram" onClick={handleRenameClick}>
          <Edit style={{ fontSize: '16px' }} />
        </IconButton>
      </div>
    {/* <Dialog open={true} onClose={false}>
      <DialogTitle>Rename Diagram</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          id='renameDiagram'
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          margin="dense"
          label="New Name"
          type="text"
          name='name'
          fullWidth
          variant="outlined"
          />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmitRename} color="primary">
          Rename
        </Button>
      </DialogActions>
    </Dialog> */}
          </>
  );
};

export default RenameDiagramDialog;
