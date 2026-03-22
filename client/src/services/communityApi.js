import API from "../utils/api";

const B = "/community";

export const getPosts        = (params)                => API.get(B, { params }).then(r => r.data);
export const getPost         = (id)                    => API.get(`${B}/${id}`).then(r => r.data);
export const createPost      = (data)                  => API.post(B, data).then(r => r.data);
export const deletePost      = (id)                    => API.delete(`${B}/${id}`).then(r => r.data);
export const toggleLike      = (id)                    => API.post(`${B}/${id}/like`).then(r => r.data);
export const toggleSave      = (id)                    => API.post(`${B}/${id}/save`).then(r => r.data);
export const addComment      = (id, content)           => API.post(`${B}/${id}/comment`, { content }).then(r => r.data);
export const deleteComment   = (id, commentId)         => API.delete(`${B}/${id}/comment/${commentId}`).then(r => r.data);
export const likeComment     = (id, commentId)         => API.post(`${B}/${id}/comment/${commentId}/like`).then(r => r.data);
export const addReply        = (id, commentId, content)=> API.post(`${B}/${id}/comment/${commentId}/reply`, { content }).then(r => r.data);
export const addAnswer       = (id, content)           => API.post(`${B}/${id}/answer`, { content }).then(r => r.data);
export const upvoteAnswer    = (id, answerId)          => API.post(`${B}/${id}/answer/${answerId}/upvote`).then(r => r.data);
export const acceptAnswer    = (id, answerId)          => API.put(`${B}/${id}/answer/${answerId}/accept`).then(r => r.data);
export const getTrendingTags = ()                      => API.get(`${B}/trending-tags`).then(r => r.data);
export const getRecommended  = ()                      => API.get(`${B}/recommended`).then(r => r.data);
