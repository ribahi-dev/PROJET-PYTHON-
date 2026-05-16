import api from './axios'

export const getIdeas = (params) => api.get('/ideas/', { params })
export const getIdea = (id) => api.get(`/ideas/${id}/`)
export const createIdea = (data) => api.post('/ideas/', data)
export const updateIdea = (id, data) => api.put(`/ideas/${id}/`, data)
export const deleteIdea = (id) => api.delete(`/ideas/${id}/`)
export const getVersions = (id) => api.get(`/ideas/${id}/versions/`)
export const getTrending = () => api.get('/ideas/trending/')
export const getRecommended = () => api.get('/ideas/recommended/')
export const getReviewQueue = () => api.get('/ideas/review-queue/')
export const getCategories = () => api.get('/ideas/categories/')
export const getTags = (search = '') => api.get('/ideas/tags/', { params: { search } })
export const changeIdeaStatus = (id, status, rejection_reason = '') => api.patch(`/ideas/${id}/status/`, { status, rejection_reason })
