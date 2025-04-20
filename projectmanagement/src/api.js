import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:4000/api/auth",
  // withCredentials: true,
});

// Authentification Google
export const googleAuth = (code) => api.get(`/google?code=${code}`);


