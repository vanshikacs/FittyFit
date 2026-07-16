import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

if (!BACKEND_URL) {
  // Fail fast with a clear message instead of calling `undefined/api/...`.
  throw new Error(
    "Missing REACT_APP_BACKEND_URL. Set it to your backend origin (e.g. http://127.0.0.1:8001) in the frontend environment."
  );
}

export const API = `${BACKEND_URL.replace(/\/+$/, "")}/api`;

export const api = axios.create({ baseURL: API });


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fittyfit_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("fittyfit_token");
    }
    return Promise.reject(err);
  }
);
