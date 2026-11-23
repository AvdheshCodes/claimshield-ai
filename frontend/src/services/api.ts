import axios from 'axios';

// Support explicit environment variable for remote backend (e.g. Render),
// with fallback to relative '/api/v1' for reverse proxies or local dev.
const envApiUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();
const baseURL = envApiUrl ? `${envApiUrl.replace(/\/+$/, '')}/api/v1` : '/api/v1';

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('insureguard_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('insureguard_token');
      localStorage.removeItem('insureguard_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
