import axios from "axios";

const getBaseURL = () => {
  const host = window.location.hostname;

  // Phone / devtunnel / network access
  if (host !== "localhost" && host !== "127.0.0.1") {
    return "http://192.168.28.65:5000/api/v1";
  }

  // Laptop local
  return "http://localhost:5000/api/v1";
};

export const api = axios.create({
  baseURL: getBaseURL(),
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !config.url.includes("/auth/login")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
