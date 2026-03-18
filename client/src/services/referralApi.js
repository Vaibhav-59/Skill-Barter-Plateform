import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getReferralLink = async () => {
  const response = await axios.get(`${API_URL}/referral/link`, getAuthHeaders());
  return response.data;
};

export const getReferralStats = async () => {
  const response = await axios.get(`${API_URL}/referral/stats`, getAuthHeaders());
  return response.data;
};

export const getReferralList = async () => {
  const response = await axios.get(`${API_URL}/referral/list`, getAuthHeaders());
  return response.data;
};

export const rewardReferralCredits = async (referralId, action) => {
  const response = await axios.post(`${API_URL}/referral/reward`, { referralId, action }, getAuthHeaders());
  return response.data;
};
