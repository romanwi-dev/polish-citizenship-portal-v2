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
    chunkSizeWarningLimit: 1000, // Increased to reduce warnings for large chunks
    reportCompressedSize: true,
    minify: 'esbuild',
    target: 'esnext', // Use modern JS for better tree-shaking
    rollupOptions: {
      output: {
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name) {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
          }
          return `assets/[name]-[hash][extname]`;
        },
        manualChunks: (id) => {
          // Node modules chunking strategy
          if (id.includes('node_modules')) {
            // Core React - critical, load first
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // Three.js - very heavy, separate chunk
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            
            // HuggingFace transformers - extremely heavy ML library, separate chunk
            if (id.includes('@huggingface/transformers')) {
              return 'ml-vendor';
            }
            
            // PDF libraries - heavy, separate chunk
            if (id.includes('pdf-lib') || id.includes('react-pdf') || id.includes('pdfjs-dist')) {
              return 'pdf-vendor';
            }
            
            // Radix UI - split into smaller chunks
            if (id.includes('@radix-ui')) {
              // Group by usage frequency
              const common = ['dialog', 'dropdown-menu', 'slot', 'tabs', 'toast', 'accordion', 'select', 'popover', 'tooltip'];
              const isCommon = common.some(component => id.includes(component));
              return isCommon ? 'radix-common' : 'radix-other';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            
            // Supabase and query
            if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
              return 'api-vendor';
            }
            
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            
            // Animation libraries
            if (id.includes('framer-motion') || id.includes('canvas-confetti')) {
              return 'animation-vendor';
            }
            
            // Chart libraries
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            
            // Other large vendors
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            
            // Everything else from node_modules
            return 'vendor';
          }
          
          // Split large local modules
          if (id.includes('/src/components/heroes/')) {
            return 'hero-components';
          }
          
          if (id.includes('/src/pages/admin/')) {
            return 'admin-pages';
          }
          
          if (id.includes('/src/i18n/locales/')) {
            return 'i18n-locales';
          }
        }
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
    exclude: [
      '@huggingface/transformers', // Exclude heavy ML library from pre-bundling
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
  },
}));
