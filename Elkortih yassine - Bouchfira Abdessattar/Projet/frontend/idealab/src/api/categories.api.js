import api from './axios'

export const getCategoriesList = (params) => api.get('/ideas/categories/', { params })
export const createCategory = (data) => api.post('/ideas/categories/', data)
export const updateCategory = (id, data) => api.put(`/ideas/categories/${id}/`, data)
export const deleteCategory = (id) => api.delete(`/ideas/categories/${id}/`)
