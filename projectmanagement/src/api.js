import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL , // Défaut local
  // withCredentials: true,
});

// Authentification Google
export const googleAuth = (code) => api.get(`/google?code=${code}`);