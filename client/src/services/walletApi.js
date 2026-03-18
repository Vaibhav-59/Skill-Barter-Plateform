import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// GET /api/wallet
export const getWallet = async () => {
  const { data } = await axios.get(`${API_URL}/wallet`, getAuthHeaders());
  return data;
};

// GET /api/wallet/transactions?type=all|earned|spent
export const getTransactions = async (type = "all", page = 1, limit = 50) => {
  const { data } = await axios.get(
    `${API_URL}/wallet/transactions?type=${type}&page=${page}&limit=${limit}`,
    getAuthHeaders()
  );
  return data;
};

// POST /api/wallet/transaction
export const createTransaction = async (payload) => {
  const { data } = await axios.post(
    `${API_URL}/wallet/transaction`,
    payload,
    getAuthHeaders()
  );
  return data;
};

// PUT /api/wallet/update
export const updateWallet = async (payload) => {
  const { data } = await axios.put(
    `${API_URL}/wallet/update`,
    payload,
    getAuthHeaders()
  );
  return data;
};

// GET /api/wallet/stats
export const getWalletStats = async () => {
  const { data } = await axios.get(`${API_URL}/wallet/stats`, getAuthHeaders());
  return data;
};

// POST /api/wallet/request-credit
export const requestCredit = async (payload) => {
  const { data } = await axios.post(
    `${API_URL}/wallet/request-credit`,
    payload,
    getAuthHeaders()
  );
  return data;
};
