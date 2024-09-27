import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost", // Set your server host
    // port: 3000, // Set your server port
    open: true, // Automatically open the browser
  },
  build: {
    outDir: "dist", // Customize output directory
    assetsDir: "assets", // Customize assets directory
  },
  resolve: {
    alias: {
      "@": "/src", // Add alias for easier imports
    },
  },
});
