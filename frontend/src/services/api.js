import axios from 'axios';

/**
 * API Service Client
 * Centralized axios instance for all API calls to Laravel backend.
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Attach Token to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('umkm_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Guard: prevent multiple simultaneous 401s from each triggering a redirect
let isRedirecting = false;

// Global Error Handling (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only act if token exists (avoid loop) and not already redirecting
            const hasToken = localStorage.getItem('umkm_token');
            if (hasToken && !isRedirecting && window.location.pathname !== '/login') {
                isRedirecting = true;
                localStorage.removeItem('umkm_token');
                localStorage.removeItem('umkm_user');
                // Small delay so any in-flight state updates settle first
                setTimeout(() => {
                    window.location.href = '/login';
                    isRedirecting = false;
                }, 100);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
