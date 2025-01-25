import React from 'react';
import { Box, Typography, Paper, Container, Button } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import HomeIcon from '@mui/icons-material/Home';
import { keyframes } from '@mui/system';
import { useNavigate } from 'react-router-dom';

// Define animations
const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
`;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const NotAllowed = () => {
        const navigate = useNavigate();

        return (
                <Container maxWidth="sm">
                        <Box
                                sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '80vh',
                                }}
                        >
                                <Paper
                                        elevation={3}
                                        sx={{
                                                p: 4,
                                                textAlign: 'center',
                                                backgroundColor: '#fff',
                                                borderRadius: 2,
                                                animation: `${fadeIn} 0.6s ease-out`,
                                                border: '2px solid #d32f2f',
                                        }}
                                >
                                        <BlockIcon
                                                sx={{
                                                        fontSize: 80,
                                                        color: '#d32f2f',
                                                        mb: 2,
                                                        animation: `${bounce} 2s infinite ease-in-out`,
                                                }}
                                        />
                                        <Typography
                                                variant="h4"
                                                component="h1"
                                                gutterBottom
                                                sx={{ 
                                                        color: '#d32f2f',
                                                        fontWeight: 'bold',
                                                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                        >
                                                Access Denied
                                        </Typography>
                                        <Typography 
                                                variant="h6" 
                                                color="text.secondary"
                                                sx={{ mb: 3 }}
                                        >
                                                Sorry, you don't have permission to view this page.
                                        </Typography>
                                        <Typography 
                                                variant="body1" 
                                                color="text.secondary"
                                                sx={{ mb: 4 }}
                                        >
                                                Please contact your administrator if you believe this is a mistake.
                                        </Typography>
                                        <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<HomeIcon />}
                                                onClick={() => navigate('/')}
                                                sx={{
                                                        '&:hover': {
                                                                transform: 'scale(1.05)',
                                                                transition: 'transform 0.2s',
                                                        },
                                                }}
                                        >
                                                Return to Home
                                        </Button>
                                </Paper>
                        </Box>
                </Container>
        );
};

export default NotAllowed;