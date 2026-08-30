import axios from 'axios';

const getBaseURL = () => {
  let url = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
  
  // Remove trailing slashes
  while (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  // Remove any duplicate /api endings if accidentally present
  while (url.endsWith('/api')) {
    url = url.slice(0, -4);
  }
  
  // Return clean URL with exactly one /api suffix
  return `${url}/api`;
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
