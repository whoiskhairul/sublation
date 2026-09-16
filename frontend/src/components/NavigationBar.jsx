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
          <button
            type="button"
            className="menu-icon-btn"
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div className="logo-container" onClick={() => navigate('/homepage')}>
            <img src={logo} alt="Folia Logo" className="logo-image" />
            <span className="logo-text">Folia</span>
          </div>

          <div className="navbar-nav-links">
            <button className="nav-link-btn" onClick={() => navigate('/homepage')}>Home</button>
            <button className="nav-link-btn" onClick={() => navigate('/homepage/templates/')}>Templates</button>
            <button className="nav-link-btn" onClick={() => navigate('/image-to-bpmn')}>Image to BPMN</button>
            <button className="nav-link-btn" onClick={() => navigate('/faq')}>FAQ</button>
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-user-chip" onClick={toggleDropdown}>
            <div className="user-avatar-small">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'G'}
            </div>
            <span className="user-display-name">{user?.username || 'Guest'}</span>
            <svg className={`chevron-icon ${isDropdownVisible ? 'rotate' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {/* Dropdown Menu */}
          {isDropdownVisible && (
            <div className="dropdown-menu" onMouseLeave={handleMouseLeaveForDropdown}>
              <div className="dropdown-header">
                <div className="user-avatar-large">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'G'}
                </div>
                <div className="dropdown-info" onClick={() => navigate('/homepage')}>
                  <p className="dropdown-name">{user?.username || 'Guest'}</p>
                  <p className="dropdown-email">{user?.email || 'example@gmail.com'}</p>
                </div>
              </div>
              <ul className="dropdown-options">
                <li onClick={() => { setDropdownVisible(false); navigate('/homepage'); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  My Diagrams
                </li>
                <li onClick={() => { setDropdownVisible(false); navigate('/homepage/templates/'); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  Template Gallery
                </li>
                <li className="logout-option" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Log out
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
      >
        <div className="sidebar-header">
          <div className="user-avatar-large" style={{ backgroundColor: '#2563EB' }}>
            {user?.username ? user.username.charAt(0).toUpperCase() : 'G'}
          </div>
          <div className="sidebar_user_info" onClick={() => { navigate('/homepage'); setSidebarOpen(false); }}>
            <p className="profile-name">{user?.username || 'Guest'}</p>
            <p className="profile-email">{user?.email || 'example@gmail.com'}</p>
          </div>
        </div>
        <ul className="sidebar-options">
          <li onClick={() => { navigate('/homepage'); setSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </li>
          <li onClick={() => { navigate('/homepage/templates/'); setSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            Templates
          </li>
          <li onClick={() => { navigate('/image-to-bpmn'); setSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Image To BPMN
          </li>
          <li onClick={() => { navigate('/faq'); setSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            FAQ
          </li>
          <li className="sidebar-logout-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Log out
          </li>
        </ul>
      </div>
    </>
  );
};

export default NavigationBar;
