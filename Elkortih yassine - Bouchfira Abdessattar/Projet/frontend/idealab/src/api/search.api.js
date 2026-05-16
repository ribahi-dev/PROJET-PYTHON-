import api from './axios'

export const globalSearch = (q, filter = 'all') =>
  api.get('/search/', { params: { q, filter } })
