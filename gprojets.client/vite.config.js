/* eslint-env node */
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [plugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    https: false, // Explicitly disable HTTPS
    proxy: {
      '^/weatherforecast': {
        target: 'http://localhost:5035/', // Make sure backend also runs over HTTP
        secure: false
      }
    }
  }
});
