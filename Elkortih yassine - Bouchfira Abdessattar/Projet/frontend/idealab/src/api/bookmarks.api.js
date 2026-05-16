import api from './axios'

export const getBookmarks = () => api.get('/bookmarks/')
export const toggleBookmark = (ideaId) => api.post('/bookmarks/', { idea: ideaId })
export const checkBookmark = (ideaId) => api.get('/bookmarks/check/', { params: { idea_id: ideaId } })
