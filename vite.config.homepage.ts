import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import removeConsole from 'vite-plugin-remove-console';

// Cloudflare Pages optimized config for static homepage
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    removeConsole() // Always remove console in homepage build
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist/homepage',
    sourcemap: false, // No sourcemaps for static homepage
    cssCodeSplit: false, // Single CSS file for faster FCP
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index-homepage.html')
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name) {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
          }
          return `assets/[name]-[hash][extname]`;
        },
        manualChunks: {
          // Single vendor chunk for homepage
          'vendor': ['react', 'react-dom'],
          'i18n': ['i18next', 'react-i18next'],
        }
      }
    }
  }
}));
