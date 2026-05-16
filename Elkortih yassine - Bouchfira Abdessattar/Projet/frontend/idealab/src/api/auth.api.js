import api from './axios'

export const register = (data) => api.post('/accounts/register/', data)
export const login = (data) => api.post('/accounts/login/', data)
export const logout = (data) => api.post('/accounts/logout/', data)
export const refresh = (data) => api.post('/accounts/token/refresh/', data)
export const resetPassword = (data) => api.post('/accounts/password-reset/', data)
export const confirmPassword = (data) => api.post('/accounts/password-confirm/', data)
