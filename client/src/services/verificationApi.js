import API from "../utils/api";

const BASE = "/verification";

export const generateTest = (data) =>
  API.post(`${BASE}/generate-test`, data).then((r) => r.data);

export const submitTest = (data) =>
  API.post(`${BASE}/submit`, data).then((r) => r.data);

export const getTestHistory = () =>
  API.get(`${BASE}/history`).then((r) => r.data);

export const getLeaderboard = (skill = "") =>
  API.get(`${BASE}/leaderboard`, { params: { skill } }).then((r) => r.data);

export const getVerifiedStats = () =>
  API.get(`${BASE}/stats/me`).then((r) => r.data);
