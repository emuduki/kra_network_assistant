import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    timeout: 30000, // 30s — AI calls can be slow
});

// Attach JWT token to every request if available
api.interceptors.request.use(config => {
    const token = localStorage.getItem('kra_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//Global response error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Token expired or invalid -> force logout
        if (error.response?.status === 401) {
            localStorage.removeItem('kra_token');
            localStorage.removeItem('kra_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;