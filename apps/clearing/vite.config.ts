import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@posttrade/platform/theme': path.resolve(__dirname, '../../packages/platform/src/theme'),
      '@posttrade/platform/notification': path.resolve(__dirname, '../../packages/platform/src/notification'),
      '@posttrade/platform/permission': path.resolve(__dirname, '../../packages/platform/src/permission'),
      '@posttrade/platform/error-boundary': path.resolve(__dirname, '../../packages/platform/src/error-boundary'),
      '@posttrade/platform/state': path.resolve(__dirname, '../../packages/platform/src/state'),
      '@posttrade/platform/auth': path.resolve(__dirname, '../../packages/platform/src/auth'),
      '@posttrade/platform/config': path.resolve(__dirname, '../../packages/platform/src/config'),
      '@posttrade/platform/logging': path.resolve(__dirname, '../../packages/platform/src/logging'),
      '@posttrade/platform/layout': path.resolve(__dirname, '../../packages/platform/src/layout'),
      '@posttrade/platform/hooks': path.resolve(__dirname, '../../packages/platform/src/hooks'),
      '@posttrade/platform/router': path.resolve(__dirname, '../../packages/platform/src/router'),
      '@posttrade/platform/types': path.resolve(__dirname, '../../packages/platform/src/types'),
      '@posttrade/platform/api': path.resolve(__dirname, '../../packages/platform/src/api'),
      '@posttrade/platform/i18n': path.resolve(__dirname, '../../packages/platform/src/i18n'),
      '@posttrade/platform/feature-flags': path.resolve(__dirname, '../../packages/platform/src/feature-flags'),
      '@posttrade/platform/plugin': path.resolve(__dirname, '../../packages/platform/src/plugin'),
      '@posttrade/platform/monitoring': path.resolve(__dirname, '../../packages/platform/src/monitoring'),
      '@posttrade/platform/utils': path.resolve(__dirname, '../../packages/platform/src/utils'),
      '@posttrade/platform/components': path.resolve(__dirname, '../../packages/platform/src/components'),
      '@posttrade/platform/loading': path.resolve(__dirname, '../../packages/platform/src/loading'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
});