import API from "../utils/api";

const BASE = "/resources";

export const getResources    = (params)  => API.get(BASE, { params }).then(r => r.data);
export const getResource     = (id)      => API.get(`${BASE}/${id}`).then(r => r.data);
export const createResource  = (data)    => API.post(BASE, data).then(r => r.data);
export const updateResource  = (id, data)=> API.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteResource  = (id)      => API.delete(`${BASE}/${id}`).then(r => r.data);
export const toggleLike      = (id)      => API.post(`${BASE}/${id}/like`).then(r => r.data);
export const toggleBookmark  = (id)      => API.post(`${BASE}/${id}/bookmark`).then(r => r.data);
export const addReview       = (id, data)=> API.post(`${BASE}/${id}/review`, data).then(r => r.data);
export const getBookmarked   = ()        => API.get(`${BASE}/bookmarked`).then(r => r.data);
export const getTrending     = ()        => API.get(`${BASE}/trending`).then(r => r.data);
export const getRecommended  = ()        => API.get(`${BASE}/recommended`).then(r => r.data);
