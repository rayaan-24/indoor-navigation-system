import axios from 'axios';

const getBaseURL = () => {
  // If running in browser and hostname is localhost or 127.0.0.1, always use local backend
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }

  // Otherwise check environment variable
  let rawUrl = (import.meta.env.VITE_API_URL || '').trim();
  
  // Strip inline comments if someone wrote `#comment` in .env
  if (rawUrl.includes('#')) {
    rawUrl = rawUrl.split('#')[0].trim();
  }

  let url = rawUrl || 'http://localhost:5000/api';

  // Remove trailing slashes
  while (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  // Ensure clean single /api suffix
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }

  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token into authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
