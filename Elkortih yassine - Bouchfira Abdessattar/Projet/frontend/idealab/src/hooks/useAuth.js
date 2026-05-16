import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login as loginApi, logout as logoutApi, register as registerApi } from '../api/auth.api'
import useAuthStore from '../store/authStore'

export const useLogin = () => {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: loginApi,
    onSuccess: ({ data }) => {
      const user = data?.user
      login(user, data?.access, data?.refresh)
      if (user?.role === 'entrepreneur') navigate('/dashboard')
      else if (user?.role === 'reviewer') navigate('/reviewer')
      else if (user?.role === 'admin') navigate('/admin')
      else navigate('/')
    },
  })
}

export const useRegister = () => {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: registerApi,
    onSuccess: ({ data }) => {
      const user = data?.user
      login(user, data?.access, data?.refresh)
      if (user?.role === 'entrepreneur') navigate('/dashboard')
      else if (user?.role === 'reviewer') navigate('/reviewer')
      else if (user?.role === 'admin') navigate('/admin')
      else navigate('/')
    },
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const logoutStore = useAuthStore((s) => s.logout)
  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      logoutStore()
      navigate('/login')
    },
  })
}
