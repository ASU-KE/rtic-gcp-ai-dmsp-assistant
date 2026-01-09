import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts: ['dmsp.local.asu.edu', 'dmsp.dev.rtd.asu.edu', 'dmsp.ai.rto.asu.edu'],
  },
});
