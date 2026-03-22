// services/challengeApi.js
import API from "../utils/api";

const BASE = "/challenges";

export const getAllChallenges = (params = {}) =>
  API.get(BASE, { params }).then((r) => r.data);

export const getChallengeById = (id) =>
  API.get(`${BASE}/${id}`).then((r) => r.data);

export const startChallenge = (id) =>
  API.post(`${BASE}/start/${id}`).then((r) => r.data);

export const submitChallenge = (data) =>
  API.post(`${BASE}/submit`, data).then((r) => r.data);

export const getUserHistory = () =>
  API.get(`${BASE}/history`).then((r) => r.data);

export const getLeaderboard = () =>
  API.get(`${BASE}/leaderboard`).then((r) => r.data);

export const getUserStats = () =>
  API.get(`${BASE}/stats`).then((r) => r.data);

export const generateAIChallenge = (data) =>
  API.post(`${BASE}/generate-ai`, data).then((r) => r.data);

export const seedChallenges = () =>
  API.post(`${BASE}/seed`).then((r) => r.data);

export const createChallenge = (data) =>
  API.post(BASE, data).then((r) => r.data);

export const getDailyChallenge = () =>
  API.get(`${BASE}/daily`).then((r) => r.data);

export const getMyCreatedChallenges = () =>
  API.get(`${BASE}/my-created`).then((r) => r.data);

export const getChallengeSubmissions = (id) =>
  API.get(`${BASE}/${id}/submissions`).then((r) => r.data);

export const reviewSubmission = (id, data) =>
  API.put(`${BASE}/submission/${id}/review`, data).then((r) => r.data);
