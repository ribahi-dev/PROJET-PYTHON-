import api from './axios'

export const getComments = (ideaId) => api.get('/comments/', { params: { idea_id: ideaId } })
export const postComment = (data) => api.post('/comments/', data)
// data = { idea: ideaId, content, parent (optional) }
export const editComment = (id, data) => api.patch(`/comments/${id}/`, data)
export const deleteComment = (id) => api.delete(`/comments/${id}/`)
