import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// 🔑 attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
