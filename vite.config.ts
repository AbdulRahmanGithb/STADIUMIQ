import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest configuration (NFR-6)
    environment: 'node',
    globals: true,
  },
});
