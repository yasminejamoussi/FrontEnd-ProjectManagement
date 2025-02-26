import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Port par défaut de Vite
    host: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },

});