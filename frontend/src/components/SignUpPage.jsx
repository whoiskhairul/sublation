import React, { useState } from 'react'; // Added useState for form handling
import axios from 'axios'; // Added axios for API requests
import './SignUpPage.css';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import config from '../config';
import Header from './Header';

const SignUpPage = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook

  // Added state for form fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '', // Added confirm password field
  });

  // Added function to handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Updated function to handle form submission
  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent page reload
  
    // Validate if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return; // Stop form submission
    }
  
    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_@]+$/; // Letters, numbers, and underscores only
    if (!usernameRegex.test(formData.name)) {
      alert('Username can only contain letters, numbers, and underscores!');
      return; // Stop form submission
    }
  
    try {
      // API call to register the user
      const url = config.apiBaseUrl + '/authentication/dj-rest-auth/registration/';
      const response = await axios.post(url, {
        username: formData.username.trim(), // Trim spaces from username
        email: formData.email,
        password1: formData.password,
        password2: formData.confirmPassword,
      });
  
      // Notify user and redirect to login
      //alert('Registration successful! Please log in.');
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Sign-up error:', error.response?.data); // Log error
  
      // Show backend error messages
      if (error.response?.data?.username) {
        alert('Username error: ' + error.response.data.username[0]);
      } else {
        alert('Sign-up failed. Please check your details and try again.');
      }
    }
  };
  

  return (
    <div className="signup-container">
      <Header />
      <div className="signup-card">
        <h1 className="signup-title">Create an account</h1>

        <form className="signup-form" onSubmit={handleSignUp}>
          {/* Name Field */}
          <div className="input-group">
            <label htmlFor="username">Userame</label>
            <input
              type="text"
              id="username"
              placeholder="ex. JohnDoe12"
              required
              value={formData.username} // Controlled input
              onChange={handleInputChange} // Handle change
            />
          </div>

          {/* Email Field */}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="example@xyz.com"
              required
              value={formData.email} // Controlled input
              onChange={handleInputChange} // Handle change
            />
          </div>

          {/* Phone Number Field */}
          {/* <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              placeholder="+49 xxxxxxxxxxx"
              required
              value={formData.phone} // Controlled input
              onChange={handleInputChange} // Handle change
            />
          </div> */}

          {/* Password Field */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                type="password"
                id="password"
                placeholder="Password"
                required
                value={formData.password} // Controlled input
                onChange={handleInputChange} // Handle change
              />
              
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-container">
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm Password"
                required
                value={formData.confirmPassword} // Controlled input
                onChange={handleInputChange} // Handle change
              />
              
            </div>
          </div>

          {/* Sign-Up Button */}
          <button type="submit" className="signup-button">Sign Up</button>
        </form>

        {/* Redirect to Login */}
        <div className="bottom-text">
          Already have an account? <Link to="/login" style={{textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
