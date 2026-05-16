import api from './axios'

export const getUserProfile = (username) => api.get(`/accounts/users/${username}/`)
export const updateMyProfile = (data) => api.patch('/accounts/me/update/', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const getUsers = (params) => api.get('/accounts/users/', { params })
export const updateUserRole = (id, role) => api.patch(`/accounts/users/${id}/manage/`, { role })
export const toggleUserStatus = (id, is_active) => api.patch(`/accounts/users/${id}/manage/`, { is_active })
export const deleteUser = (id) => api.delete(`/accounts/users/${id}/delete/`)
