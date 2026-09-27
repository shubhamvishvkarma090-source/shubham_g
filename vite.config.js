import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The VELOOP API only allows CORS from its own client, so /api is proxied
// same-origin: by Vite in development and by vercel.json rewrites in production.
const API_TARGET = 'https://veloop-5zm4.onrender.com';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true, secure: true },
    },
  },
  preview: {
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true, secure: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
