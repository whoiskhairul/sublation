      
import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import NavigationBar from "./NavigationBar";
import "./About.css";
import logo from "../assets/logo.png"; // Ensure correct path
import { useNavigate } from "react-router-dom";
import "./Header.css";
        
const Header = () => {
            const navigate = useNavigate();
            
              const handleGetStartedClick = () => {
                navigate("/login");
              };
            return (
              <header className="header">
              {/* Logo Section */}
              <div className="logo-container" onClick={() => navigate("/")}>
                <img src={logo} alt="Folia Logo" className="logo" />
                <span className="logo-text">Folia</span>
              </div>
        
              {/* Navigation Section */}
              <nav className="nav-links">
                <a href="/about">About</a>
                <a href="/pricing">Pricing</a>
                {/* <a href="/contact">Contact</a> */}
                <a href="/faq">FAQ</a>
        
                {/* Login Button */}
                <button className="btn-signup" onClick={handleGetStartedClick}>
                  Login
                </button>
              </nav>
            </header>
  
            );
          };
          
          export default Header;
          