import axios from 'axios';
import config from '../config';
// Create axios instance
const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
});

// Refresh Access Token
export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) {
      throw new Error('No refresh token available');
    }
    const response = await axios.post(
      config.apiBaseUrl + '/authentication/api/token/refresh/',
      { refresh }
    );
    localStorage.setItem('access', response.data.access);
    return response.data.access;
  } catch (error) {
    console.error('Refresh token expired. Redirecting to login.', error);
    localStorage.clear();
    window.location.href = '/login';
    return null;
  }
};

export const refreshAccessToken = refreshToken;

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    let access = localStorage.getItem('access');
    const isExpired = checkTokenExpiry(access);

    if (isExpired) {
      access = await refreshToken(); // Get a new access token
    }

    config.headers.Authorization = `Bearer ${access}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token Expiry Checker
const checkTokenExpiry = (token) => {
  if (!token) return true;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const expiry = payload.exp;
    if (!expiry) return false;
    const now = Math.floor(Date.now() / 1000);
    return expiry < now;
  } catch (e) {
    console.error('Error decoding token:', e);
    return true;
  }
};

export default axiosInstance;

export const sendRequest = async (url, method = 'GET', data = null) => {
  try {
    // Ensure access token is valid or refresh it
    let access = localStorage.getItem('access');
    const isExpired = checkTokenExpiry(access);

    if (isExpired) {
      access = await refreshToken();
    }

    // Send request
    const response = await axiosInstance({
      url,
      method,
      data,
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};
