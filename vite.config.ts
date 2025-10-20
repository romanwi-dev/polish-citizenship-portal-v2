import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI component library
          'radix-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-accordion', '@radix-ui/react-select'],
          // Form and validation
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Separate Three.js into its own chunk
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // Separate framer-motion
          'motion-vendor': ['framer-motion'],
          // Supabase and API
          'supabase-vendor': ['@supabase/supabase-js', '@tanstack/react-query'],
          // Utilities
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        }
      }
    }
  }
}));
