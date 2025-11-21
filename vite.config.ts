import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import removeConsole from 'vite-plugin-remove-console';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    mode === 'production' && removeConsole()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: mode === 'production' ? 'hidden' : true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name) {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
          }
          return `assets/[name]-[hash][extname]`;
        },
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI component library
          'radix-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-accordion', '@radix-ui/react-select'],
          // Form and validation
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Three.js separate chunk (loaded on demand)
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // Supabase and API
          'supabase-vendor': ['@supabase/supabase-js', '@tanstack/react-query'],
          // Utilities
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          // Admin-only heavy dependencies (PDF, AI, Dropbox)
          'admin-heavy': ['pdf-lib', '@huggingface/transformers', 'react-pdf'],
          // Translation and i18n
          'i18n-vendor': ['i18next', 'react-i18next'],
        }
      }
    }
  }
}));
