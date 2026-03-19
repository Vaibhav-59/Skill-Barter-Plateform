import API from "../utils/api";
const BASE = "/group-sessions";

export const getMyStats = () =>
  API.get(`${BASE}/stats/me`).then((r) => r.data);

export const getMySessions = () =>
  API.get(`${BASE}/my-sessions`).then((r) => r.data);

export const getJoinedSessions = () =>
  API.get(`${BASE}/joined-sessions`).then((r) => r.data);

export const getAllSessions = (params = {}) =>
  API.get(BASE, { params }).then((r) => r.data);

export const getSession = (id) =>
  API.get(`${BASE}/${id}`).then((r) => r.data);

export const createSession = (data) =>
  API.post(`${BASE}/create`, data).then((r) => r.data);

export const joinSession = (id) =>
  API.post(`${BASE}/join/${id}`).then((r) => r.data);

export const leaveSession = (id) =>
  API.post(`${BASE}/leave/${id}`).then((r) => r.data);

export const updateSession = (id, data) =>
  API.put(`${BASE}/update/${id}`, data).then((r) => r.data);

export const deleteSession = (id) =>
  API.delete(`${BASE}/${id}`).then((r) => r.data);

export const sendChatMessage = (id, message) =>
  API.post(`${BASE}/${id}/chat`, { message }).then((r) => r.data);
