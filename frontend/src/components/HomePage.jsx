import React from 'react';
import NavigationBar from './NavigationBar'; // Import NavigationBar component
import {useNavigate} from 'react-router-dom';

const HomePage = () => {
  //const username = 'John Doe'; // Replace with dynamic username if available
  const navigate = useNavigate();


  return (
    <div className="app-container">
      {/* Navigation Bar as the header */}
      <NavigationBar/>

      {/* Main Content */}
      <main className="app-main content">
        <h1>Welcome To Folia</h1>
        <p>
          Your Smart BPMN Assistant is Here
          <br />How Can I Assist?
        </p>
        <div className="search-container">
          <input
            type="text"
            placeholder="Tell Us What You Need"
            className="search-input"
          />
          <button className="search-button">→</button>
        </div>
        <div className="tool-grid">
          <div className="tool-card" style={{ backgroundColor: '#FEEFC3' }} onClick={() => navigate('/studio')}>
            BPMN Generation
          </div>
          <div className="tool-card" style={{ backgroundColor: '#D1E7DD' }}>
            Process Optimization
          </div>
          <div className="tool-card" style={{ backgroundColor: '#FBCFD9' }}>
            Smart Simulation
          </div>
          <div className="tool-card" style={{ backgroundColor: '#E0E7FF' }}>
            Process Validation
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
