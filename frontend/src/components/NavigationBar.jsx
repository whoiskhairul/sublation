import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './NavigationBar.css';
import axios from 'axios';
import logo from '../assets/logo.png';
import config from '../config';

const NavigationBar = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const sidebarRef = useRef(null);

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownVisible((prevState) => !prevState);
    // NEW CHANGE: Close sidebar when dropdown is opened
    if (!isDropdownVisible) setSidebarOpen(false); // Close sidebar
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(true); // Open sidebar on click
    // NEW CHANGE: Close dropdown when sidebar is opened
    setDropdownVisible(false); // Close dropdown
  };
  const handleMouseLeaveForDropdown = () => {
    setDropdownVisible(false); // Hide dropdown
  };

  //Handle logout
  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      const refreshUrl = config.apiBaseUrl + '/authentication/api/token/refresh/';
      const response = await axios.post(
        refreshUrl,
        { refresh }
      );

      localStorage.setItem('access', response.data.access);

      const logoutUrl = config.apiBaseUrl + '/authentication/dj-rest-auth/logout/';
      await axios.post(
        logoutUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${response.data.access}`,
          },
        }
      );

        } catch (error) {
      console.error('Logout Error:', error.response?.data || error.message);
     // alert('Logout failed. Please try again.');
    }finally {
      localStorage.clear(); // Clear all stored tokens
      setUser(null);
      navigate('/'); // Redirect to login
    }
  };

  

  // Close sidebar when mouse leaves
  const handleMouseLeave = () => {
    setSidebarOpen(false); // Close sidebar
  };

  // Close sidebar when clicking outside
  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <div
            className="menu-icon"
            onClick={toggleSidebar}
          >
            ☰
          </div>
          <div className="logo-container" style={{cursor:'pointer'}} onClick={() => navigate('/homepage')}>
            <img src={logo} alt="Folia Logo" className="logo-image" />
            <span className="logo-text">Folia</span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-user" onClick={toggleDropdown}>
            Hi, <span className="username">{user ? user.username : 'Guest'}</span>
          </div>
          {/* Dropdown Menu */}
        {isDropdownVisible && (
          <div className="dropdown-menu"onMouseLeave={handleMouseLeaveForDropdown}>
            <div className="dropdown-header">
              <span className="dropdown-avatar">👤</span>
              <div className="dropdown-info" onClick={() => navigate('/homepage')}>
                <p className="dropdown-name">{user?.username || 'Guest'}</p>
                <p className="dropdown-email">{user?.email || 'example@gmail.com'}</p>
              </div>
            </div>
            <hr />
            <ul className="dropdown-options">
              {/* <li>
                <span className="dropdown-icon">⚙️</span> Settings
              </li> */}
              <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
                <span className="dropdown-icon">🔓</span> Logout
              </li>
            </ul>
          </div>
        )}
          
        </div>
      </nav>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        onMouseLeave={handleMouseLeave} // Auto-close on mouse leave
      >
        <div className="sidebar-header">
          <img src={logo} alt="Profile" className="profile-image" />
          <div className="sidebar_user_info" onClick={() => navigate('/homepage')}>
            <p className="profile-name">{user?.username || 'Guest'}</p>
            <p className="profile-email">{user?.email || 'example@gmail.com'}</p>
          </div>
        </div>
        <ul className="sidebar-options">
          <li onClick={() => navigate('/homepage')}>Home</li>
          <li onClick={() => navigate('/image-to-bpmn')}>Image To BPMN</li>          
          <li onClick={() => navigate('/homepage/templates/')}>Templates</li>
          <li onClick={() => navigate('/faq')}>FAQ</li>
          <li onClick={handleLogout}>Log out</li>
        </ul>
      </div>
    </>
  );
};

export default NavigationBar;
