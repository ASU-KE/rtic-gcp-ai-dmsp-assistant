import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        define: {
          'process.env.API_BACKEND_URL': JSON.stringify(env.API_BACKEND_URL),
        },
        plugins: [react()],
        server: {
          host: true,
          port: 3000,
          strictPort: true,
        },
    };
});
