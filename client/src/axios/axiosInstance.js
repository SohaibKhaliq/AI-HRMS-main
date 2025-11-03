import axios from "axios";
import { getToken } from "../utils";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_URL || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message?.toLowerCase() || "";
    
    // Only logout on authentication errors (401) or specific JWT errors
    if (
      status === 401 ||
      (status === 403 && (msg.includes("jwt") || msg.includes("token"))) ||
      msg.includes("jwt expired") ||
      msg.includes("jwt malformed") ||
      msg.includes("invalid token")
    ) {
      sessionStorage.clear();
      localStorage.clear();

      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
