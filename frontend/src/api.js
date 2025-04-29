// Set up an interceptor using Axios
// Intercepts any sent requests and adds correct headers
import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

const baseURL = import.meta.env.VITE_API_URL;

console.log('[🔗 VITE_API_URL]', baseURL);

const api = axios.create({ baseURL });

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            // Pass JWT access token
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (!refreshToken) {
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(baseURL + '/api/token/refresh/', {
                    refresh: refreshToken,
                });

                const newAccessToken = res.data.access;
                localStorage.setItem(ACCESS_TOKEN, newAccessToken);

                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return api(originalRequest); // Retry original request
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                // 🔥 Important: Clear everything and logout
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;