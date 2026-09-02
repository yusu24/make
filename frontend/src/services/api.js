import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
    return `http://${host}:8000/api`;
};

/**
 * API Service Client
 * Centralized axios instance for all API calls to Laravel backend.
 */
const apiClient = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Attach Token to every request
apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('umkm_token') || localStorage.getItem('umkm_token');
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
            const hasToken = sessionStorage.getItem('umkm_token') || localStorage.getItem('umkm_token');
            if (hasToken && !isRedirecting && window.location.pathname !== '/login') {
                isRedirecting = true;
                sessionStorage.removeItem('umkm_token');
                sessionStorage.removeItem('umkm_user');
                localStorage.removeItem('umkm_token');
                localStorage.removeItem('umkm_user');
                // Small delay so any in-flight state updates settle first
                setTimeout(() => {
                    window.location.href = '/login';
                    isRedirecting = false;
                }, 100);
            }
        } else if (error.response?.status === 402) {
            // Fire global event so SubscriptionLock can overlay the screen
            window.dispatchEvent(new CustomEvent('subscription_expired'));
        }
        return Promise.reject(error);
    }
);

export default apiClient;
