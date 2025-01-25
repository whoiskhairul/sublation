import NavigationBar from './NavigationBar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { refreshAccessToken } from './auth';
import NotificationSnackBar from './NotificationSnackbar';

import {
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Avatar,
  Box,
  Container,
  Stack,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import { red, green } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Delete } from '@mui/icons-material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import config from '../config';

const BpmnProfile = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { hash, pathname, search } = location;

  const handletextToBpmn = async () => {
    try {
      const token = await refreshAccessToken();
      const url = config.apiBaseUrl + '/bpmn/create-bpmn-diagram/';
      const response = await axios.post(url, {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      navigate(pathname + '/bpmn/' + response.data.encrypted_id)

    } catch (err) {
      console.log("Error creating BPMN diagram", err);
    }
  }
  const handleImageToBPMN = async () => {
    //go to path image-to-bpmn
    navigate('/image-to-bpmn/')
  }
  const handleOptimization = async () => {
    try {
      navigate(pathname + '/optimize-bpmn/')

    } catch (err) {
      console.log(err);
    }
  }
  const handleErrorDetection = async () => {
    try {
      navigate(pathname + '/error-detection/')

    } catch (err) {
      console.log(err);
    }
  }
  const handleSimulation = async () => {
    try {
      navigate(pathname + '/simulation/')

    } catch (err) {
      console.log(err);
    }
  }
  const handleTemplate = async () => {
    try {
      navigate(pathname + '/templates/')

    } catch (err) {
      console.log(err);
  }
}
  const options = [
    { name: 'Create New BPMN', color: '#fff', image: '/createbpmn.svg', path: () => handletextToBpmn(), tooltip: 'Create BPMN by texting with interective chatbot' },
    { name: 'Image to BPMN', color: '#E0E7FF', image: '/image.jpg', path: () => handleImageToBPMN() },
    { name: 'Template Galary', color: green[400], image: '/template.jpg', path: () => handleTemplate() },
    { name: 'Error Detection', color: red[400], image: '/error.jpg', path: () => handleErrorDetection() },
    { name: 'Process optimization', color: '#E0E7FF', image: '/optimization.jpg', path: () => handleSimulation() },
    { name: 'Smart Simulation', color: '#E0E7FF', image: '/simulation.jpg', path: () => handleSimulation() },
    // { name: 'Smart Simulation', color: '#E0E7FF', image: '/Untitled.png', path: () => handleSimulation() },
    // { name: 'Smart Simulation', color: '#E0E7FF', image: '/Untitled.png', path: () => handleSimulation() },
  ];
  const [diagrams, setDiagrams] = useState([]);
  const [sharedDiagrams, setSharedDiagrams] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const getAllDiagrams = async () => {
    try {
      const token = await refreshAccessToken();
      const url = config.apiBaseUrl + '/bpmn/get-all-diagram/';
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDiagrams(response.data.diagrams);
      setSharedDiagrams(response.data.sharedWithMe);

    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getAllDiagrams();
  }, []);

  const scrollRef = React.useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };
  const [encryptedDiagramID, setEncryptedDiagramID] = useState([]);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [openRenameDialog, setOpenRenameDialog] = useState(false);

  const [openSnack, setOpenSnack] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSeverity, setNotifSeverity] = useState('success');

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;  // ignore if user clicks away
    }
    setOpenSnack(false);
  };

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleDeleteDiagram = async () => {
    setAnchorEl(null);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDeleteDiagram = async () => {
    setOpenConfirmDialog(false);
    try {
      const token = await refreshAccessToken();
      const url = config.apiBaseUrl + '/bpmn/delete-diagram/' + encryptedDiagramID;
      const response = await axios.delete(url,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        const updatedDiagram = diagrams.filter(diagram => diagram.encrypted_id !== encryptedDiagramID);
        setDiagrams(updatedDiagram);
        const reply = response.data.reply;
        setNotifMessage(reply);
        setNotifSeverity('success');
        setOpenSnack(true);
      }

      else if (response.status === 500) {
        const reply = response.data.reply;
        setNotifMessage(reply);
        setNotifSeverity('error');
        setOpenSnack(true);
      }
    } catch (error) {
      const reply = error.response.data.reply;
      setNotifMessage(reply);
      setNotifSeverity('error');
      setOpenSnack(true);
    }
  };

  const [newName, setNewName] = useState('');

  const handleRenameDiagram = () => {
    setAnchorEl(null);
    setOpenRenameDialog(true);
  }
  const handleSubmitRename = async (event) => {
    const token = await refreshAccessToken();
    const url = config.apiBaseUrl + '/bpmn/update-diagram/' + encryptedDiagramID;
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
        withCredentials: true, // Include cookies if necessary
      }
    );
    setNewName('')
    if (response.status === 200) {
      let updatedDiagram = diagrams.map(diagram => { return diagram.encrypted_id === encryptedDiagramID ? { ...diagram, name: newName } : diagram });
      let firstDiagram = updatedDiagram.filter(diagram => diagram.encrypted_id == encryptedDiagramID);
      let otherDiagrams = updatedDiagram.filter(diagram => diagram.encrypted_id != encryptedDiagramID);
      updatedDiagram = [firstDiagram[0], ...otherDiagrams];
      setDiagrams(updatedDiagram);
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [sortOption, setSortOption] = useState('date'); // 'name' or 'date'
  const [filterText, setFilterText] = useState('');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  const sortedDiagrams = [...(activeTab === 0 ? diagrams : sharedDiagrams)]
    .filter(diagram => diagram.name.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });

  return (
    <div style={{ height: '100vh', overflow: 'none' }}>
      <NavigationBar />
      <div className="content" style={{
        paddingTop: '1rem',
        paddingBottom: '1rem',
        backgroundImage: 'url(/bg.svg)',
        backgroundSize: 'cover',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden'
      }}>
        <Container sx={{ maxWidth: '100%', position: 'relative', marginX: 'auto' }}>
          <IconButton
            onClick={scrollLeft}
            sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
          >
            <ArrowBackIosIcon />
          </IconButton>

          <Box
            ref={scrollRef}
            sx={{
              overflowX: 'auto',
              overflowY: 'hidden',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              padding: '1rem 0'
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{
                minWidth: 'max-content',
                flexWrap: 'nowrap',
                marginBottom: '20px'
              }}
            >
              {options.map((option, index) => (
                <Box
                  key={index}
                  sx={{
                    width: '200px',
                    flexShrink: 0,
                    borderRadius: 2,
                    boxShadow: '2',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: option.color,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: 0,
                    animation: 'fadeIn 0.5s ease forwards',
                    animationDelay: `${index * 0.2}s`,
                    '@keyframes fadeIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(20px)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}
                  onClick={option.path}
                >
                  <img
                    src={option.image}
                    alt={option.name}
                    style={{
                      width: '100%',
                      height: '133px',
                      objectFit: 'cover',
                      marginBottom: '10px',
                    }}
                  />
                  <Typography variant="subtitle1" style={{ fontWeight: 500, padding: '0 8px 8px' }}>
                    {option.name}
                  </Typography>
                </Box>

              ))}
            </Stack>
          </Box>
          <IconButton
            onClick={scrollRight}
            sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Container>
      </div>
      <div style={{ backgroundColor: '#fff', overflow: 'auto' }}></div>
      <Container style={{ padding: '20px' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="diagram tabs">
            <Tab label="Owned by Me" />
            <Tab label="Shared with Me" />
          </Tabs>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={filterText}
              onChange={handleFilterChange}
            />
            <TextField
              select
              label="Sort By"
              value={sortOption}
              onChange={handleSortChange}
              variant="outlined"
              size="small"
              slotProps={{
                select: {
                  native: true
                }
              }}
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
            </TextField>
            <IconButton onClick={() => handleViewModeChange('card')}>
              <Tooltip title="Grid View">
                <ViewModuleIcon />
              </Tooltip>
            </IconButton>
            <IconButton onClick={() => handleViewModeChange('list')}>
              <Tooltip title="List View">
                <ViewListIcon />
              </Tooltip>
            </IconButton>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
          <Typography sx={{ paddingBottom: '10px' }} variant="h6" gutterBottom>
            {activeTab === 0 ? 'My Diagrams' : 'Shared Diagrams'}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            flexWrap="wrap"
            justifyContent="flex-start"
            sx={{ width: '100%' }}
          >
            {sortedDiagrams.map((diagram, index) => (
              viewMode === 'card' ? (
                <Card key={index} sx={{
                  width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)', lg: 'calc(25% - 16px)' },
                  marginBottom: 2,
                  flexGrow: 0,
                  flexShrink: 0,
                  opacity: 0,
                  animation: 'fadeIn 0.5s ease forwards',
                  animationDelay: `${index * 0.1}s`,
                  '@keyframes fadeIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(20px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: red[500] }} aria-label="diagram">
                        {diagram.name.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    action={
                      <IconButton aria-label="settings" onClick={(event) => { handleMenuClick(event); setEncryptedDiagramID(diagram.encrypted_id); }}>
                        <MoreVertIcon />
                      </IconButton>
                    }
                    title={diagram.name.length > 20 ? `${diagram.name.slice(0, 20)}...` : diagram.name}
                    subheader={diagram.id}
                  />
                  <CardMedia
                    onClick={() => navigate(`/homepage/bpmn/${diagram.encrypted_id}`)}
                    component="img"
                    height="194"
                    image={diagram.bpmn_svg ? `data:image/svg+xml;utf8,${encodeURIComponent(diagram.bpmn_svg)}` : '/folia.svg'}
                    style={{
                      objectFit: 'contain',
                      transform: 'scale(1)',
                      transformOrigin: 'center center'
                    }}
                    alt={diagram.name}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {`Last edited: ${diagram.updated_at}`}
                    </Typography>
                  </CardContent>
                  <CardActions disableSpacing>
                    <IconButton aria-label="add to favorites">
                      <FavoriteIcon />
                    </IconButton>
                    <IconButton aria-label="share">
                      <ShareIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              ) : (
                <Box key={index} sx={{
                  width: '100%',
                  padding: 2,
                  borderBottom: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: 0,
                  animation: 'fadeIn 0.5s ease forwards',
                  animationDelay: `${index * 0.1}s`,
                  '@keyframes fadeIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(20px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }

                }}>
                  <Tooltip title={diagram.name ? diagram.name : ''}>
                    <Typography sx={{ cursor: 'pointer', width: '20%' }} variant="body1" onClick={() => navigate(`/homepage/bpmn/${diagram.encrypted_id}`)}>
                      {diagram.name.length > 30 ? `${diagram.name.slice(0, 30)}...` : diagram.name}
                    </Typography>
                  </Tooltip>
                  <Tooltip title={`Last Edited at ${diagram.updated_at}`}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {`${diagram.updated_at}`}
                    </Typography>
                  </Tooltip>
                  <IconButton aria-label="settings" onClick={(event) => { handleMenuClick(event); setEncryptedDiagramID(diagram.encrypted_id); }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              )
            ))}
          </Stack>
        </Stack>
        <Menu
          id="mui-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              style: {
                width: '180px',
                maxWidth: '100%'
              }
            }
          }}
        >
          <MenuItem onClick={handleRenameDiagram}>
            <DriveFileRenameOutlineOutlinedIcon sx={{ marginRight: '1rem' }} /> <Typography variant="body2" fontSize="0.8rem">Rename</Typography>
          </MenuItem>
          <MenuItem onClick={handleDeleteDiagram}>
            <Delete sx={{ marginRight: '1rem' }} /><Typography variant="body2" fontSize="0.8rem">Delete</Typography>

          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <InfoOutlinedIcon sx={{ marginRight: '1rem' }} /><Typography variant="body2" fontSize="0.8rem">Details</Typography>
          </MenuItem>
        </Menu>

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

        <Dialog
          open={openRenameDialog}
          onClose={() => setOpenRenameDialog(false)}
        >
          <DialogTitle>Rename Diagram</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              id='renemeDiagram'
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
            <Button onClick={() => setOpenRenameDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setOpenRenameDialog(false);
              handleSubmitRename(event);
            }} color="primary">
              Rename
            </Button>
          </DialogActions>
        </Dialog>
        <NotificationSnackBar
          open={openSnack}
          onClose={handleClose}
          severity={notifSeverity}
          message={notifMessage}
        />
      </Container>
    </div>
  );
}

export default BpmnProfile;
