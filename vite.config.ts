
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
    hmr: {
      timeout: 5000, // Increase timeout for HMR connections
      overlay: true, // Show errors as overlay
    },
    watch: {
      usePolling: true, // Help with file system issues
    },
  },
  plugins: [
    react({
      tsDecorators: true, // Improved TypeScript support
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['puppeteer'],
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  // Add better error handling
  logLevel: 'info',
}));
