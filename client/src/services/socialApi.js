import axios from "axios";

// Setup axios instance based on environment
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getSocialData = async () => {
  const response = await axios.get(`${API_URL}/social`, getAuthHeaders());
  return response.data;
};

export const connectSocial = async (platform, url) => {
  const response = await axios.post(`${API_URL}/social/connect`, { platform, url }, getAuthHeaders());
  return response.data;
};

export const updateSocial = async (platform, url) => {
  const response = await axios.put(`${API_URL}/social/update`, { platform, url }, getAuthHeaders());
  return response.data;
};

export const removeSocial = async (platform) => {
  const response = await axios.delete(`${API_URL}/social/remove/${platform}`, getAuthHeaders());
  return response.data;
};

export const fetchGithubData = async () => {
  const response = await axios.get(`${API_URL}/social/github`, getAuthHeaders());
  return response.data;
};
