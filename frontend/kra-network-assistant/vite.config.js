import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            // During development, proxy API requests to the backend server
            '/api': {
                target: 'http://localhost:4000', // Adjust the backend server URL and port as needed
                changeOrigin: true,
            },
        },
    },
});