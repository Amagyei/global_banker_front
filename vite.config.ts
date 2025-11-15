import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Base path for production - use root path when served from Nginx
  base: mode === "production" ? "/" : "/",
  server: {
    host: "::",
    port: 8080,
    // Proxy API requests to backend in development
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure assets are referenced correctly
    assetsDir: "assets",
    // Generate relative paths for assets
    rollupOptions: {
      output: {
        // Use relative paths for assets
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
}));
