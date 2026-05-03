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

// Global Error Handling (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('umkm_token');
            localStorage.removeItem('umkm_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
