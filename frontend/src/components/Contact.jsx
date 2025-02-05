import React from 'react';
import NavigationBar from './NavigationBar';
import { Box, Typography, TextField, Button, Grid, Container } from '@mui/material';

const Contact = () => {
    return (
        <div>
       
            <NavigationBar username="John Doe" />

            <Box sx={{ height: '50px' }} />

            {/* Contact Page Content */}
            <Container maxWidth="md" sx={{ mt: 4 }}>
                {/* Contact Information Section */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom  color="primary">
                        Contact Us
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Let's talk with us
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Questions, comments, or suggestions? Simply fill in the form and we'll be in touch shortly.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            📍 Str. Nationen 62, 09111 Chemnitz, Germany
                        </Typography>
                        <Typography variant="body2">
                            📞 +49 1781329326
                        </Typography>
                        <Typography variant="body2">
                            📧 contactFolia@gmail.com
                        </Typography>
                    </Box>
                </Box>

                {/* Contact Form Section */}
                <Box component="form" sx={{ mt: 4 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name"
                                variant="outlined"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                variant="outlined"
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                variant="outlined"
                                required
                            />
                        </Grid>
                        {/* <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                type="tel"
                                variant="outlined"
                               
                            />
                        </Grid> */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Your Message"
                                multiline
                                rows={5}
                                variant="outlined"
                                required
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Button variant="contained" color="primary" type="submit">
                            Send Message
                        </Button>
                    </Box>
                </Box>
            </Container>
        </div>
    );
};

export default Contact;
