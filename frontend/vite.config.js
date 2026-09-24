import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // ── Dev server proxy ────────────────────────────────────────────────────────
  // Forwards /api/* to the Express backend so the frontend makes same-origin
  // requests in development (no CORS issues, no hardcoded localhost URLs).
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // ── Vitest ──────────────────────────────────────────────────────────────────
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
