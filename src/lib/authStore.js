import { create } from 'zustand'
import api from '../lib/api'

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, isAuthenticated: false })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, isAuthenticated: true })
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }
}))

export default useAuthStore
