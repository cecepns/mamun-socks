import axios from "axios";

// Determine the API base URL dynamically based on the current hostname
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Check if we are running locally on localhost/127.0.0.1
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168."))
  ) {
    return "http://localhost:5001/api";
  }
  return "https://api.kingcreativestudio.my.id/mamun-socks/api";
};

// Helper to resolve asset URLs dynamically for local vs production backend
export const getAssetURL = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  
  // Clean potential duplicate slash at path beginning
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168."));

  const host = isLocal ? "http://localhost:5001" : "https://api.kingcreativestudio.my.id/mamun-socks";
  return `${host}${cleanPath}`;
};

export const api = axios.create({
  baseURL: getBaseURL(),
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

