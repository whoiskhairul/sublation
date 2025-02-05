import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import NavigationBar from "./NavigationBar";
import "./About.css";
import logo from "../assets/logo.png"; // Ensure correct path
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const AboutPage = () => {
  const navigate = useNavigate();
  
    const handleGetStartedClick = () => {
      navigate("/login");
    };
  return (
    <Box>
      <Header/>

      {/* Content */}
      <Box sx={{ padding: 4,  paddingTop: 4 }} class="about-content"> 
        <Grid container spacing={3}>
          {/* About Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                backgroundColor: "#E3F2FD",
                padding: 3,
                borderRadius: 2,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", 
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                About Folia
              </Typography>
              <Typography sx={{ marginTop: 1, color: "#444" }}>
                AI-powered Smart BPMN tool that is specially designed to streamline and optimize workflows, particularly in healthcare organizations.
              </Typography>
            </Box>
          </Grid>

          {/* Vision Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                backgroundColor: "#E3F2FD", 
                padding: 3,
                borderRadius: 2,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", 
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Focus Area
              </Typography>
              <Typography
                variant="h6"
                sx={{ marginTop: 1, fontStyle: "italic", color: "#444" }}
              >
                Folia simplifies the process of building and managing workflows and increasing Collaboration Across Teams.
              </Typography>
              <Typography sx={{ marginTop: 2, color: "#666" }}>
                Folia is specifically tailored for healthcare administrators, hospital management teams, and process managers in healthcare institutions and healthcare IT teams.
                Whether streamlining workflows in large hospitals, clinics, or specialized healthcare facilities, it enables experts to work more efficiently and foster better collaboration.
                Ultimately, this leads to improved operational efficiency and better patient outcomes.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AboutPage;
