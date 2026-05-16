import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access')
  if (access) config.headers.Authorization = `Bearer ${access}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error?.response?.status === 401 && !original?._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh')
      if (refresh) {
        try {
          const res = await axios.post('/api/accounts/token/refresh/', { refresh })
          const access = res?.data?.access
          localStorage.setItem('access', access)
          original.headers.Authorization = `Bearer ${access}`
          return api(original)
        } catch {
          // refresh failed — clear storage but don't redirect
          localStorage.clear()
        }
      } else {
        localStorage.clear()
      }
    }
    return Promise.reject(error)
  },
)

export default api
