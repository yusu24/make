import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * Authentication Provider
 * Manages login state, user info, and tenant context.
 */
export const AuthProvider = ({ children }) => {
    // Optimistic init: load from storage immediately to avoid waterfall
    const [user, setUser] = useState(() => {
        const token = sessionStorage.getItem('umkm_token') || localStorage.getItem('umkm_token');
        const saved = sessionStorage.getItem('umkm_user') || localStorage.getItem('umkm_user');
        return (token && saved) ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(() => !!(sessionStorage.getItem('umkm_token') || localStorage.getItem('umkm_token')));

    useEffect(() => {
        const fetchMe = async () => {
            const token = sessionStorage.getItem('umkm_token') || localStorage.getItem('umkm_token');
            if (!token) return;

            try {
                const res = await api.get('/auth/me');
                const userData = res.data.data;
                setUser(userData);
                if (sessionStorage.getItem('umkm_token')) {
                    sessionStorage.setItem('umkm_user', JSON.stringify(userData));
                } else {
                    localStorage.setItem('umkm_user', JSON.stringify(userData));
                }
            } catch (err) {
                // Only clear session if the server explicitly rejects the token (401)
                // Network errors (err.code === 'ERR_NETWORK') or 5xx should NOT log user out
                if (err.response?.status === 401) {
                    console.warn('Token invalid — logging out');
                    sessionStorage.removeItem('umkm_token');
                    sessionStorage.removeItem('umkm_user');
                    localStorage.removeItem('umkm_token');
                    localStorage.removeItem('umkm_user');
                    setUser(null);
                } else {
                    console.warn('Could not verify token (network/server error), keeping session:', err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, []);

    // Demo sandbox accounts (tenant_id starting with TN-DS-/TN-DK-) are
    // auto-deleted once their heartbeat goes stale for 5 minutes (see
    // AuthController::cleanupOldDemoSandboxes) — this is what keeps sending
    // that heartbeat while the tab stays open, so closing the tab is what
    // actually stops it and triggers cleanup, not a fixed 2-hour timer.
    useEffect(() => {
        const tenantId = user?.tenant_id || '';
        const isDemoSandbox = tenantId.startsWith('TN-DS-') || tenantId.startsWith('TN-DK-');
        if (!isDemoSandbox) return;

        const ping = () => { api.post('/auth/heartbeat').catch(() => {}); };
        ping();
        const interval = setInterval(ping, 60000);
        return () => clearInterval(interval);
    }, [user?.tenant_id]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user: userData } = res.data.data;
        
        localStorage.setItem('umkm_token', token);
        localStorage.setItem('umkm_user', JSON.stringify(userData));
        
        setUser(userData);
        return userData;
    };

    const loginDemoSandbox = async (category) => {
        const res = await api.post('/auth/demo-sandbox', { category });
        const { token, user: userData } = res.data.data;
        
        sessionStorage.setItem('umkm_token', token);
        sessionStorage.setItem('umkm_user', JSON.stringify(userData));
        
        setUser(userData);
        return userData;
    };

    const register = async (formData) => {
        const res = await api.post('/auth/register', formData);
        const { token, user: userData } = res.data.data;
        
        localStorage.setItem('umkm_token', token);
        localStorage.setItem('umkm_user', JSON.stringify(userData));
        
        setUser(userData);
        return userData;
    };

    const logout = () => {
        sessionStorage.removeItem('umkm_token');
        sessionStorage.removeItem('umkm_user');
        localStorage.removeItem('umkm_token');
        localStorage.removeItem('umkm_user');
        setUser(null);
    };

    const impersonate = async (tenantId) => {
        const res = await api.post(`/admin/tenants/${tenantId}/impersonate`);
        const { token, user: userData, redirect } = res.data.data;
        
        // Save current admin session to impersonator storage
        const currentAdmin = {
            token: sessionStorage.getItem('umkm_token') || localStorage.getItem('umkm_token'),
            user: user,
            returnUrl: window.location.pathname + window.location.search,
            isSession: !!sessionStorage.getItem('umkm_token')
        };
        sessionStorage.setItem('umkm_impersonator', JSON.stringify(currentAdmin));
        
        // Switch to tenant session (force sessionStorage so it doesn't affect other tabs)
        sessionStorage.setItem('umkm_token', token);
        sessionStorage.setItem('umkm_user', JSON.stringify(userData));
        setUser(userData);
        
        return redirect;
    };

    const impersonateUser = async (userId) => {
        const res = await api.post(`/auth/impersonate/${userId}`);
        const { token, user: userData, redirect } = res.data.data;
        
        // Save current admin session to impersonator storage
        const currentAdmin = {
            token: sessionStorage.getItem('umkm_token') || localStorage.getItem('umkm_token'),
            user: user,
            returnUrl: window.location.pathname + window.location.search,
            isSession: !!sessionStorage.getItem('umkm_token')
        };
        sessionStorage.setItem('umkm_impersonator', JSON.stringify(currentAdmin));
        
        // Switch to target user session
        sessionStorage.setItem('umkm_token', token);
        sessionStorage.setItem('umkm_user', JSON.stringify(userData));
        setUser(userData);
        
        return redirect;
    };

    const impersonateDemoSandbox = async (categorySlug) => {
        const res = await api.post('/auth/demo-sandbox', { category: categorySlug });
        const { token, user: userData } = res.data.data;
        
        // Save current admin session to impersonator storage
        const currentAdmin = {
            token: sessionStorage.getItem('umkm_token') || localStorage.getItem('umkm_token'),
            user: user,
            returnUrl: '/categories',
            isSession: !!sessionStorage.getItem('umkm_token')
        };
        sessionStorage.setItem('umkm_impersonator', JSON.stringify(currentAdmin));
        
        // Switch to target user session
        sessionStorage.setItem('umkm_token', token);
        sessionStorage.setItem('umkm_user', JSON.stringify(userData));
        setUser(userData);
        
        const SLUG_ROUTES = {
            'toko-retail': '/retail/dashboard',
            'budidaya-hewan': '/budidaya/dashboard',
            'budidaya-tanaman': '/budidaya/dashboard',
            'kuliner': '/kuliner/admin',
        };
        
        return SLUG_ROUTES[categorySlug] || '/coming-soon';
    };

    const isSuperAdmin = () => user?.role === 'super_admin';

    const isImpersonating = () => !!(sessionStorage.getItem('umkm_impersonator') || localStorage.getItem('umkm_impersonator'));

    const exitImpersonate = () => {
        const impersonator = sessionStorage.getItem('umkm_impersonator') || localStorage.getItem('umkm_impersonator');
        if (impersonator) {
            const adminData = JSON.parse(impersonator);
            setUser(adminData.user);
            
            // Restore token to its original place
            if (adminData.isSession) {
                sessionStorage.setItem('umkm_token', adminData.token);
                sessionStorage.setItem('umkm_user', JSON.stringify(adminData.user));
            } else {
                localStorage.setItem('umkm_token', adminData.token);
                localStorage.setItem('umkm_user', JSON.stringify(adminData.user));
                sessionStorage.removeItem('umkm_token');
                sessionStorage.removeItem('umkm_user');
            }
            
            sessionStorage.removeItem('umkm_impersonator');
            localStorage.removeItem('umkm_impersonator');
            return adminData.returnUrl || '/tenants';
        }
        return '/dashboard';
    };

    const updateUser = (userData) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);
        if (sessionStorage.getItem('umkm_token')) {
            sessionStorage.setItem('umkm_user', JSON.stringify(newUser));
        } else {
            localStorage.setItem('umkm_user', JSON.stringify(newUser));
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, login, loginDemoSandbox, logout, register, loading, updateUser,
            impersonate, impersonateUser, impersonateDemoSandbox, isSuperAdmin, isImpersonating, exitImpersonate 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
