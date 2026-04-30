import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // Saves the admin's original token when impersonating
  const [adminSnapshot, setAdminSnapshot] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('umkm_token')
    const savedUser = localStorage.getItem('umkm_user')
    const savedSnapshot = localStorage.getItem('umkm_admin_snapshot')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch {}
    }
    if (savedSnapshot) {
      try { setAdminSnapshot(JSON.parse(savedSnapshot)) } catch {}
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
    localStorage.removeItem('umkm_admin_snapshot')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setAdminSnapshot(null)
  }

  /**
   * Impersonate a tenant. Saves the admin's token/user so they can exit later.
   * Returns the redirect path returned by the server.
   */
  const impersonate = async (tenantId) => {
    const res = await api.post(`/admin/tenants/${tenantId}/impersonate`)
    const { token, user: tenantUser, redirect } = res.data.data

    // Snapshot current admin session
    const snapshot = {
      token: localStorage.getItem('umkm_token'),
      user: localStorage.getItem('umkm_user'),
    }
    localStorage.setItem('umkm_admin_snapshot', JSON.stringify(snapshot))
    setAdminSnapshot(snapshot)

    // Switch to tenant session
    localStorage.setItem('umkm_token', token)
    localStorage.setItem('umkm_user', JSON.stringify(tenantUser))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(tenantUser)

    return redirect
  }

  /**
   * Exit impersonation and restore the admin's original session.
   */
  const exitImpersonate = () => {
    if (!adminSnapshot) return
    const { token, user: adminUser } = adminSnapshot
    localStorage.setItem('umkm_token', token)
    localStorage.setItem('umkm_user', adminUser)
    localStorage.removeItem('umkm_admin_snapshot')
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(JSON.parse(adminUser))
    setAdminSnapshot(null)
    return '/tenants' // back to admin tenant list
  }

  const isSuperAdmin = () => user?.role === 'super_admin'
  const isAdmin = () => user?.role === 'admin' || user?.role === 'super_admin'
  const isImpersonating = () => !!adminSnapshot

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isSuperAdmin, isAdmin, impersonate, exitImpersonate, isImpersonating }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
