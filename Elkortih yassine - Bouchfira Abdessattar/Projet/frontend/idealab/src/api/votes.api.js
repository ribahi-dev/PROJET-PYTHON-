import api from './axios'

export const castVote = (data) => api.post('/votes/', data)
// data = { target_type: 'idea'|'feedback'|'comment', target_id: id, value: 1|-1 }

export const getVoteStats = (target_type, target_id) =>
  api.get('/votes/stats/', { params: { target_type, target_id } })
