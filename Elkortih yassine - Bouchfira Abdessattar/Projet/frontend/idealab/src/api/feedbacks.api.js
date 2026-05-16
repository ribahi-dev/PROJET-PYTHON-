import api from './axios'

export const getFeedbacks    = (ideaId) => api.get('/feedbacks/', { params: { idea: ideaId } })
export const submitFeedback  = (data)   => api.post('/feedbacks/', data)
export const editFeedback    = (id, data) => api.put(`/feedbacks/${id}/`, data)
export const deleteFeedback  = (id)     => api.delete(`/feedbacks/${id}/`)
export const markHelpful     = (id)     => api.post(`/feedbacks/${id}/helpful/`)
export const getMyReviews    = ()       => api.get('/feedbacks/', { params: { reviewer: 'me' } })
