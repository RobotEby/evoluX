import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,  // Porta padrão Vite (back-end usa 8080)
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});