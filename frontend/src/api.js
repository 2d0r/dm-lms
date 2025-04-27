// Set up an interceptor using Axios
// Intercepts any sent requests and adds correct headers
import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

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

            try {
                const res = await axios.post(import.meta.env.VITE_API_URL + '/token/refresh/', {
                    refresh: refreshToken,
                });

                const newAccessToken = res.data.access;
                localStorage.setItem(ACCESS_TOKEN, newAccessToken);

                // Update the failed request with the new token
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return api(originalRequest); // Retry original request
            } catch (refreshError) {
                console.error('Token refresh failed', refreshError);
                // Optionally: logout user or redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;