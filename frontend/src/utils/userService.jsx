import { sendRequest } from './axiosConfig'; // Import the axios instance
import config
 from '../config';
// Fetch User Data Function
export const fetchUserData = async () => {
  try {
    const url = config.apiBaseUrl + '/authentication/dj-rest-auth/user/';
    // Send GET request to fetch user data
    const data = await sendRequest(url, 'GET'); 
    localStorage.setItem('user', JSON.stringify(data)); // Save user data locally
    return data; // Return data to caller
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error; // Handle error at the component level
  }
};

// Update User Data Function
export const updateUserData = async (userData) => {
  try {
    const url = config.apiBaseUrl + '/authentication/dj-rest-auth/user/';
    // Send POST request to update user data
    const response = await sendRequest(url, 'POST', userData);
    console.log('Update Successful:', response);
    return response;
  } catch (error) {
    console.error('Failed to update user data:', error);
    throw error;
  }
};
