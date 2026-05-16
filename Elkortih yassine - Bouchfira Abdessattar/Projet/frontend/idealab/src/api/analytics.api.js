import api from './axios'

export const getDashboard        = () => api.get('/analytics/entrepreneur/')
export const getReviewerStats    = () => api.get('/analytics/reviewer/')
export const getAdminStats       = () => api.get('/analytics/admin/')
export const getIdeaSGV          = (id) => api.get(`/analytics/ideas/${id}/`)
