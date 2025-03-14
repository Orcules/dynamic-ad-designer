
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: "::",
    port: 8080,
    // Add error handling for the server
    hmr: {
      timeout: 5000, // Increase timeout for HMR connections
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add optimizations for faster startup
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['puppeteer'],
  },
  // Improve error handling
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
}));
