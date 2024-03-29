import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    react(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      path: 'path-browserify',
    },
  },
  define: {
    global: 'window',
    process: {
      env: {},
      version: 'v20.10.0',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/styles/global/_global.scss";`,
      },
    },
  },
});
