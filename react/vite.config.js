import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts: ['dmsp.local.asu.edu', 'dmsp.dev.rtd.asu.edu', 'dmsp.local.rtd.asu.edu', 'dmsp.ai.rto.asu.edu'],
  },
});
