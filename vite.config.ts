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
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') && !id.includes('react-hook-form') && !id.includes('react-i18next')) {
            return 'react-vendor';
          }
          // UI component library
          if (id.includes('@radix-ui')) {
            return 'radix-vendor';
          }
          // Form and validation
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'form-vendor';
          }
          // Three.js separate chunk (loaded on demand)
          if (id.includes('three') || id.includes('@react-three')) {
            return 'three-vendor';
          }
          // Supabase and API
          if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
            return 'supabase-vendor';
          }
          // Utilities
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'utils-vendor';
          }
          // Admin-only heavy dependencies (PDF, AI, Dropbox)
          if (id.includes('pdf-lib') || id.includes('@huggingface') || id.includes('react-pdf')) {
            return 'admin-heavy';
          }
          // i18n core (small)
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n-core';
          }
          // Lazy-loaded language files (separate chunks per language)
          if (id.includes('src/i18n/locales/en.ts')) {
            return 'i18n-en';
          }
          if (id.includes('src/i18n/locales/es.ts')) {
            return 'i18n-es';
          }
          if (id.includes('src/i18n/locales/pt.ts')) {
            return 'i18n-pt';
          }
          if (id.includes('src/i18n/locales/de.ts')) {
            return 'i18n-de';
          }
          if (id.includes('src/i18n/locales/fr.ts')) {
            return 'i18n-fr';
          }
          if (id.includes('src/i18n/locales/he.ts')) {
            return 'i18n-he';
          }
          if (id.includes('src/i18n/locales/ru.ts')) {
            return 'i18n-ru';
          }
          if (id.includes('src/i18n/locales/uk.ts')) {
            return 'i18n-uk';
          }
        }
      }
    }
  }
}));
