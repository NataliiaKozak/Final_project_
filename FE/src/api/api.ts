import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:3000/api';

export const $api = axios.create({
  baseURL,
  withCredentials: false,
});

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// export const socketURL = 'http://ichgram:3000';

