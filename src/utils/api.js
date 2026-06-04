import axios from "axios";

// Fallback to local port if VITE_API_URL is not set
// const baseURL = import.meta.env.VITE_API_URL || "https://api.kingcreativestudio.my.id/mamun-socks/api";
const baseURL = import.meta.env.VITE_API_URL || "https://api.kingcreativestudio.my.id/mamun-socks/api";

export const api = axios.create({
  baseURL,
});

// Interceptor to inject JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
