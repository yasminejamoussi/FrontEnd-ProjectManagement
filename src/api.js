import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:4000/api/auth",
  // withCredentials: true,
});

// Authentification Google
export const googleAuth = (code) => api.get(`/google?code=${code}`);

// Authentification Facebook
export const facebookAuth = (accessToken) => api.post('/facebook', { access_token: accessToken });

// Authentification GitHub
export const githubAuth = (code) => api.get(`/github?code=${code}`);
