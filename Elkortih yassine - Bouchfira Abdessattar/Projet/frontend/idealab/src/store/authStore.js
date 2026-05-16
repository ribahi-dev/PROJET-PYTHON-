import { create } from 'zustand'

function loadUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

const useAuthStore = create((set) => ({
  user:  loadUser(),
  token: localStorage.getItem('access') || null,
  login: (user, access, refresh) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('access', access)
    localStorage.setItem('refresh', refresh)
    set({ user, token: access })
  },
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  logout: () => {
    localStorage.clear()
    set({ user: null, token: null })
  },
  clearAuth: () => {
    set({ user: null, token: null })
  },
}))

export default useAuthStore
