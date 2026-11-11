import axios from "axios";
import { purgeBrowserStorageCredentials } from "../utils/cookies";

const defaultApiUrl =
  typeof window === "undefined"
    ? "http://127.0.0.1:8000"
    : window.location.origin;

const configuredApiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;
const normalizedApiUrl = configuredApiUrl.endsWith("/") ? configuredApiUrl.slice(0, -1) : configuredApiUrl;

const api = axios.create({
  baseURL: normalizedApiUrl,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
// Response interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      purgeBrowserStorageCredentials();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;