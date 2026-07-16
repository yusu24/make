import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Request interceptor to attach token dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('umkm_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Guard: prevent multiple simultaneous 401s from each triggering a redirect
let isRedirecting = false;

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hasToken = localStorage.getItem('umkm_token')
      if (hasToken && !isRedirecting && window.location.pathname !== '/login') {
        isRedirecting = true
        localStorage.removeItem('umkm_token')
        localStorage.removeItem('umkm_user')
        setTimeout(() => {
          window.location.href = '/login'
          isRedirecting = false
        }, 100)
      }
    }
    return Promise.reject(error)
  }
)
