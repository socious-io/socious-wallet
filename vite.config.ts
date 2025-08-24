import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true,
    strictPort: true,    
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), 
      '~': resolve(__dirname, './public')
    }
  },
  build: {
    outDir: 'build', 
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html') 
      }
    }
  },
  
  publicDir: 'public',
  optimizeDeps: {
    include: ['@capacitor/core']
  }
});