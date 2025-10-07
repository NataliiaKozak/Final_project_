

//чат после всех пакетов. без socketURL
// import axios from 'axios';

// export const $api = axios.create({
//   baseURL: 'http://localhost:3000/api',
//   headers: { 'Content-Type': 'application/json' },
// });

// $api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
import axios from 'axios';

const base_url = 'http://localhost:3000/api';

export const $api = axios.create({ baseURL: base_url });

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const socketURL = 'http://localhost:3000';
