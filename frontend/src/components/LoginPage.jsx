import React, { useState, useEffect } from 'react'; // Added useEffect
import axios from 'axios'; // Kept axios for login API
import './LoginPage.css'; 
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; 
import axiosInstance, { sendRequest } from '../utils/axiosConfig'; // Import sendRequest
import config from '../config';
const LoginPage = () => {
  const navigate = useNavigate(); 
  const { setUser } = useUser(); 

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Login Function
  const handleLogin = async (e) => {
    e.preventDefault(); 

    try {
      // Login API call
      const url = config.apiBaseUrl + '/authentication/api/token/';
      const response = await axios.post(url, {
        username: username, 
        password: password,
      });

      // Store tokens in localStorage
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);

      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      // Fetch User Data
      await fetchUserData(); // Replace axios call with centralized function

      // Redirect
      navigate('/homepage'); 
    } catch (error) {
      console.error('Login error:', error.response?.data); 
      setErrorMessage('Username and password do not match. Please try again.'); 
    }
  };

  // Forgot Password Functionality
  const handleForgotPassword = async () => {
    try {
      const url = config.apiBaseUrl + '/authentication/dj-rest-auth/password/reset/';
      await axios.post(url, {
        email: forgotEmail,
      });
      alert('Password reset link has been sent to your email.');
      setShowForgotPasswordModal(false); 
    } catch (error) {
      console.error('Forgot Password error:', error.response?.data);
      alert('Error sending password reset email. Please try again.');
    }
  };

  // Fetch User Data Function
  const fetchUserData = async () => {
    try {
      const data = await sendRequest('/authentication/dj-rest-auth/user/', 'GET'); // Centralized call
      setUser(data); 
      console.log(data);
      localStorage.setItem('user', JSON.stringify(data)); // Store user globally
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  // Update User Data Function
  const updateUserData = async () => {
    const userData = { name: 'John Doe', email: 'john.doe@example.com' };
    try {
      const response = await sendRequest('/user/update/', 'POST', userData);
      console.log('Update Successful:', response);
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
  };

  // Remembered Username Loader
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h1 className="welcome-text">Hi, Welcome Back!</h1>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                type="password"
                id="password"
                placeholder="Enter Your Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>

        <div className="signup-link">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>

      {showForgotPasswordModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Forgot Password</h2>
            <p>Enter your email to receive a password reset link:</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button onClick={handleForgotPassword}>Send Email</button>
            <button onClick={() => setShowForgotPasswordModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
