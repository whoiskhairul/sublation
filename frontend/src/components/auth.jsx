import axios from "axios";
import config from "../config";

export const refreshAccessToken = async () => {
  try {
    const url = config.apiBaseUrl + "/authentication/api/token/refresh/";
    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await axios.post(
      url,
      { refresh: refreshToken }
    );

    // Update the access token
    localStorage.setItem("access", response.data.access);
    return response.data.access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.clear();
    window.location.href = "/login"; // Redirect to login
    throw error;
  }
};
