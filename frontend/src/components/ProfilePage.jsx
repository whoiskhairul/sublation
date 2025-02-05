import React, { useState, useEffect } from 'react';
import './ProfilePage.css'; // Import the CSS for styling
import NavigationBar from './NavigationBar';
import axios from 'axios';
import { useUser } from './UserContext'; // Import useUser hook
import config from '../config';

const ProfilePage = () => {
  const { user, setUser } = useUser(); // Use UserContext
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    //phone: '',
    //address: '',
    //profession: '',
    //company: '',
  });

  const [avatar, setAvatar] = useState(null); // State for profile picture
   

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const url = config.apiBaseUrl + 'authentication/dj-rest-auth/user/';
        const accessToken = localStorage.getItem('access'); // Fetch access token
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const userData = response.data;
        

        // Update UserContext and local profile data
        setUser(userData); // Save data to UserContext
        setProfileData({
          name: `${userData.first_name || ''} ${userData.last_name || ''}`,
          email: userData.email || '',
          //phone: userData.phone || '',
          //address: userData.address || '',
          //profession: userData.profession || '',
          //company: userData.company || '',
        });
        setAvatar(userData.avatar || null); // Set profile picture
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to load profile data.');
      }
      
    };

    fetchUserData();
  }, [setUser]); // Dependency includes setUser

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission (Save)
  const handleSave = async () => {
    try {
      const accessToken = localStorage.getItem('access');
      const updatedData = {
        username:user.username,
        first_name: profileData.name.split(' ')[0] || '',
        last_name: profileData.name.split(' ')[1] || '',
        email: profileData.email,
        //phone: profileData.phone,
       // address: profileData.address,
        //profession: profileData.profession,
        //company: profileData.company,
      };

      await axios.put(
        'http://127.0.0.1:8000/authentication/dj-rest-auth/user/',
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(updatedData);
      // Update context with the latest changes
      setUser(updatedData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile data:', error.response?.data || error.message);
      alert('Failed to save profile data.');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    alert('Changes discarded!');
    setProfileData({
      name: `${user.first_name || ''} ${user.last_name || ''}`,
      email: user.email || '',
     // phone: user.phone || '',
     // address: user.address || '',
     // profession: user.profession || '',
      //company: user.company || '',
    });
  };

  return (
    <div>
      <NavigationBar />
      <div className="profile-container">
        <h1 className="profile-title">Profile</h1>

        {/* Profile Picture
        <div className="profile-avatar-section">
          <img
            src={avatar || 'https://via.placeholder.com/100'} // Default placeholder
            alt="Profile"
            className="profile-avatar"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="avatar-upload-input"
          />
        </div> */}

        {/* Form Fields */}
        <div className="profile-form">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={user.username}
            //value={profileData.name}
            //readOnly
            // onChange={handleChange}
            disabled
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            disabled
            //readOnly
            //value={profileData.email}
            //onChange={handleChange}
          />

          {/* <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={profileData.phone}
            onChange={handleChange}
          />

          <label>Address</label>
          <input
            type="text"
            name="address"
            value={profileData.address}
            onChange={handleChange}
          />

          <label>Profession</label>
          <input
            type="text"
            name="profession"
            value={profileData.profession}
            onChange={handleChange}
          />

          <label>Company</label>
          <input
            type="text"
            name="company"
            value={profileData.company}
            onChange={handleChange}
          /> */}
        </div>

        {/* Buttons */}
        {/* <div className="profile-buttons">
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ProfilePage;
