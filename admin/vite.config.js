import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: '../js/admin',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'TrustAdminBundle',
        inlineDynamicImports: true,
        entryFileNames: 'admin.bundle.js',
        assetFileNames: 'admin.[ext]'
      }
    }
  }
});
