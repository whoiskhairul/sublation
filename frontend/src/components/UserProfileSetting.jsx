import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Grid, Avatar } from "@mui/material";
import NavigationBar from "./NavigationBar";

const UserProfileSettings = () => {
  const [userData, setUserData] = useState({
    profilePicture: "https://via.placeholder.com/150", 
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    profession: "",
    company: "",
    subscriptionLevel: "", 
  });

  useEffect(() => {
    // Simulate fetching data from the database
    const fetchUserData = async () => {
      const dataFromDB = {
        profilePicture: "https://via.placeholder.com/150",
        firstName: "John",
        lastName: "Doe",
        email: "example@xyz.com",
        phone: "+49 xxxxxxxxxx",
        address: "City, Postal Code, Country",
        profession: "Student, Engineer",
        company: "XYZ Co.",
        subscriptionLevel: "Premium", 
      };
      setUserData(dataFromDB);
    };

    fetchUserData();
  }, []);

  const handleChange = (field) => (event) => {
    setUserData({ ...userData, [field]: event.target.value });
  };

  const handleSave = () => {
    // Add save logic here (e.g., update database)
    console.log("Updated user data:", userData);
  };

  const handleCancel = () => {
    // Reset logic or navigate away
    console.log("Cancelled");
  };

  return (
    <Box>
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Spacer */}
      <Box sx={{ height: 16 }} />

      {/* Content */}
      <Box sx={{ padding: 4 }}>
        <Box
          sx={{
            padding: 4,
            maxWidth: 800,
            margin: "auto",
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
          }}
        >
          {/* Profile Header */}
          <Box sx={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            {/* Profile Picture */}
            <Avatar
              src={userData.profilePicture}
              alt={`${userData.firstName} ${userData.lastName}`}
              sx={{ width: 100, height: 100, marginRight: 3 }}
            />
            {/* Name and Family Name */}
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {userData.firstName} {userData.lastName}
              </Typography>
              <Typography variant="body1" sx={{ color: "#666" }}>
                {userData.email}
              </Typography>
            </Box>
          </Box>

          {/* Editable Form */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                value={userData.firstName}
                onChange={handleChange("firstName")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                value={userData.lastName}
                onChange={handleChange("lastName")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={userData.email}
                onChange={handleChange("email")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                variant="outlined"
                value={userData.phone}
                onChange={handleChange("phone")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                variant="outlined"
                value={userData.address}
                onChange={handleChange("address")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Profession"
                variant="outlined"
                value={userData.profession}
                onChange={handleChange("profession")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company"
                variant="outlined"
                value={userData.company}
                onChange={handleChange("company")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subscription Level"
                variant="outlined"
                value={userData.subscriptionLevel}
                onChange={handleChange("subscriptionLevel")}
              />
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "center", marginTop: 2 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ marginRight: 2, backgroundColor: "#2196f3" }}
                onClick={handleSave}
              >
                Save
              </Button>
              <Button variant="outlined" color="primary" onClick={handleCancel}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfileSettings;
