import axios from 'axios';
import config from '../config';
// Create axios instance
const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
});

// Refresh Access Token
const refreshToken = async () => {
  try {
    const response = await axiosInstance.post(
      '/authentication/api/token/refresh/'
    );
    localStorage.setItem('access', response.data.access);
    return response.data.access;
  } catch (error) {
    console.error('Refresh token expired. Redirecting to login.');
    localStorage.clear();
    window.location.href = '/login';
  }
};

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

  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiry = payload.exp;
  const now = Math.floor(Date.now() / 1000);
  return expiry < now;
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
