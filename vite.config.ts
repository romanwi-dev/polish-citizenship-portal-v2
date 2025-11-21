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
          // Homepage chunk - completely independent
          if (id.includes('/pages/Index.tsx') || id.includes('components/TimelineProcessEnhanced') || id.includes('components/ClientOnboardingSection')) {
            return 'homepage';
          }
          
          // Client portal chunk - separate from homepage
          if (id.includes('/pages/ClientDashboard') || id.includes('/pages/ClientLogin') || id.includes('/pages/ClientIntakeWizard') || id.includes('/pages/PortalIndex') || id.includes('components/client/')) {
            return 'client-portal';
          }
          
          // Admin chunks - completely separate
          if (id.includes('/pages/admin/')) {
            return 'admin-portal';
          }
          
          // Core React libraries
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          
          // UI component library
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-vendor';
          }
          
          // Form and validation (admin/portal only)
          if (id.includes('node_modules/react-hook-form/') || id.includes('node_modules/@hookform/') || id.includes('node_modules/zod/')) {
            return 'form-vendor';
          }
          
          // Three.js separate chunk (loaded on demand)
          if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/')) {
            return 'three-vendor';
          }
          
          // Supabase and API (portal/admin only, NOT homepage)
          if (id.includes('node_modules/@supabase/') || id.includes('node_modules/@tanstack/react-query/')) {
            return 'supabase-vendor';
          }
          
          // Utilities
          if (id.includes('node_modules/date-fns/') || id.includes('node_modules/clsx/') || id.includes('node_modules/tailwind-merge/') || id.includes('node_modules/class-variance-authority/')) {
            return 'utils-vendor';
          }
          
          // Admin-only heavy dependencies (PDF, AI, Dropbox)
          if (id.includes('node_modules/pdf-lib/') || id.includes('node_modules/@huggingface/') || id.includes('node_modules/react-pdf/')) {
            return 'admin-heavy';
          }
          
          // Translation and i18n
          if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) {
            return 'i18n-vendor';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-slot',
      'clsx',
      'tailwind-merge',
      'i18next',
      'react-i18next'
    ],
    exclude: [
      '@supabase/supabase-js',
      'pdf-lib',
      '@huggingface/transformers',
      'three',
      '@react-three/fiber',
      '@react-three/drei'
    ]
  }
}));
