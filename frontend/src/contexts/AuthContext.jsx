import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('umkm_token')
    const savedUser = localStorage.getItem('umkm_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user: userData } = res.data.data
    localStorage.setItem('umkm_token', token)
    localStorage.setItem('umkm_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    return userData
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const { token, user: userData } = res.data.data
    localStorage.setItem('umkm_token', token)
    localStorage.setItem('umkm_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('umkm_token')
    localStorage.removeItem('umkm_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const isSuperAdmin = () => user?.role === 'super_admin'
  const isAdmin = () => user?.role === 'admin' || user?.role === 'super_admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isSuperAdmin, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
