import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token")?.trim();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && window.location.pathname !== "/") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.replace("/");
        }
        return Promise.reject(error);
    },
);

export default api;
