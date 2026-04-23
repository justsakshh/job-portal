import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  // Use relative path in production, or the env variable if provided (stripping localhost if in production)
  baseURL: import.meta.env.VITE_API_URL?.includes('localhost') && import.meta.env.PROD 
    ? '/api/v1' 
    : (import.meta.env.VITE_API_URL || '/api/v1'),
});

// Interceptor to add Firebase Auth Token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
