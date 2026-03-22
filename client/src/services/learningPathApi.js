import API from "../utils/api";

const BASE = "/learning-path";

export const generatePath = (goal) =>
  API.post(`${BASE}/generate`, { goal }).then((r) => r.data);

export const getUserPaths = () =>
  API.get(BASE).then((r) => r.data);

export const getSinglePath = (id) =>
  API.get(`${BASE}/${id}`).then((r) => r.data);

export const updateProgress = (pathId, stepNumber, completed) =>
  API.put(`${BASE}/progress`, { pathId, stepNumber, completed }).then((r) => r.data);

export const savePath = (pathId) =>
  API.put(`${BASE}/save`, { pathId }).then((r) => r.data);

export const deletePath = (id) =>
  API.delete(`${BASE}/${id}`).then((r) => r.data);

export const adaptPath = (pathId) =>
  API.post(`${BASE}/adapt`, { pathId }).then((r) => r.data);

export const getSkillExchange = (skills) =>
  API.get(`${BASE}/skill-exchange/suggest`, { params: { skills: skills.join(",") } }).then(
    (r) => r.data
  );

export const markDailyTask = (pathId, taskIndex, done) =>
  API.put(`${BASE}/daily-task`, { pathId, taskIndex, done }).then((r) => r.data);
