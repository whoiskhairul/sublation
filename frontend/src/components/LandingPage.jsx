import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Import CSS for styling
import logo from '../assets/logo.png'; // Ensure the path matches your logo file

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
      navigate('/login');
  };

  return (
      <div className="app-container">
          <header className="app-header">
              <div className="logo-container">
                  <img src={logo} alt="Folia Logo" className="logo-image" />
                  <span className="logo-text">Folia</span>
              </div>
              <nav className="nav-links">
                  <a href="#product">Product</a>
                  <a href="#services">Services</a>
                  <a href="#pricing">Pricing</a>
                  <a href="#tutorial">Tutorial</a>
              </nav>
              <button className="get-started-button" onClick={handleGetStartedClick}>
                  Get Started
              </button>
          </header>
          <main className="app-main">
              <h1 className="main-title">Welcome To Folia</h1>
              <p className="main-subtitle">Your Smart BPMN Assistant for Healthcare</p>
              
              <div className="chat-bar-container">
                  <img src={logo} alt="Folia Logo" className="logo-image" />
                  <input
                      type="text"
                      placeholder="Tell Folia what you need..."
                      className="chat-input"
                  />
                  <button className="send-button">➤</button>
              </div>
          </main>
      </div>
  );
};

export default LandingPage;
