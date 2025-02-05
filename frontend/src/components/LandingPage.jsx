import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/logo.png"; // Ensure correct path
import healthcareImage from "../assets/landing.jpg"; // Ensure correct path

// Material UI Icons
import AutoGraphIcon from "@mui/icons-material/AutoGraph"; // AI-Powered BPMN
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions"; // Seamless Integration
import GroupsIcon from "@mui/icons-material/Groups"; // Collaboration
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"; // Compliance & Security
import Header from "./Header";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate("/login");
  };

  return (
    <div>
      <Header/>
    <div className="landing-container">
      
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Smart BPMN Solution for Healthcare</h1>
          <p>Generate workflows, optimize processes, and enhance collaboration for the healthcare administration.</p>
          <button className="btn-primary" onClick={handleGetStartedClick}>
            Get Started
          </button>
        </div>
        <div className="hero-image">
          <img src={healthcareImage} alt="Healthcare Workflow" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Folia?</h2>
        <div className="feature-grid">
          <div className="feature-item">
            <AutoGraphIcon className="feature-icon" />
            <h3>AI-Powered BPMN Generation</h3>
            <p>Generate BPMN workflows instantly using AI-driven technology.</p>
          </div>
          <div className="feature-item">
            <IntegrationInstructionsIcon className="feature-icon" />
            <h3>Smart Process Optimization</h3>
            <p>Optimize workflows for higher efficiency</p>
          </div>
          <div className="feature-item">
            <VerifiedUserIcon className="feature-icon" />
            <h3>Real-time BPMN Error Handling</h3>
            <p>Detect and resolve errors or bottlenecks in real time.</p>
          </div>
          <div className="feature-item">
            <GroupsIcon className="feature-icon" />
            <h3>Seamless Collaboration</h3>
            <p>Ensuring team alignment and enhanced productivity with seamless multiuser collaboration.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h2>Revolutionizing Healthcare Administration</h2>
        <p>Join the magnificent era of Artificial Intelligence</p>
        <button className="btn-primary" onClick={handleGetStartedClick}>
          Try Now
        </button>
      </section>
      <footer className="footer">
      This website has been developed as part of the Web Engineering Planspiel Project offered at TU Chemnitz.
    </footer>
    </div>
    </div>
  );
};

export default LandingPage;
