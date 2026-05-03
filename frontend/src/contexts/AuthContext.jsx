import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * Authentication Provider
 * Manages login state, user info, and tenant context.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMe = async () => {
            const token = localStorage.getItem('umkm_token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    const userData = res.data.data;
                    setUser(userData);
                    localStorage.setItem('umkm_user', JSON.stringify(userData));
                } catch (err) {
                    console.error('Failed to fetch user:', err);
                    // If token is invalid, clear storage
                    if (err.response?.status === 401) {
                        localStorage.removeItem('umkm_token');
                        localStorage.removeItem('umkm_user');
                        setUser(null);
                    }
                }
            } else {
                const savedUser = localStorage.getItem('umkm_user');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            }
            setLoading(false);
        };
        fetchMe();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user: userData } = res.data.data;
        
        localStorage.setItem('umkm_token', token);
        localStorage.setItem('umkm_user', JSON.stringify(userData));
        
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
        localStorage.removeItem('umkm_token');
        localStorage.removeItem('umkm_user');
        setUser(null);
    };

    const impersonate = async (tenantId) => {
        const res = await api.post(`/admin/tenants/${tenantId}/impersonate`);
        const { token, user: userData, redirect } = res.data.data;
        
        // Save current admin session to impersonator storage
        const currentAdmin = {
            token: localStorage.getItem('umkm_token'),
            user: user
        };
        localStorage.setItem('umkm_impersonator', JSON.stringify(currentAdmin));
        
        // Switch to tenant session
        localStorage.setItem('umkm_token', token);
        localStorage.setItem('umkm_user', JSON.stringify(userData));
        setUser(userData);
        
        return redirect;
    };

    const isSuperAdmin = () => user?.role === 'super_admin';

    const isImpersonating = () => !!localStorage.getItem('umkm_impersonator');

    const exitImpersonate = () => {
        const impersonator = localStorage.getItem('umkm_impersonator');
        if (impersonator) {
            const adminData = JSON.parse(impersonator);
            setUser(adminData.user);
            localStorage.setItem('umkm_token', adminData.token);
            localStorage.setItem('umkm_user', JSON.stringify(adminData.user));
            localStorage.removeItem('umkm_impersonator');
            return '/tenants';
        }
        return '/dashboard';
    };

    const updateUser = (userData) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);
        localStorage.setItem('umkm_user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ 
            user, login, logout, register, loading, updateUser,
            impersonate, isSuperAdmin, isImpersonating, exitImpersonate 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
