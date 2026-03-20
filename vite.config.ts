import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Set base path for GitHub Pages
  base: mode === 'production' ? '/slime-rhythm-forge/' : '/',
  
  // 2. Configure build output to use the 'docs' folder for GitHub Pages
  build: {
    outDir: "docs",
    emptyOutDir: true, // Cleans the folder before building
  },

  server: {
    host: "::",
    // Use a non-conflicting dev port; 8080 is taken by Postgres on your machine.
    port: 5173,
    hmr: {
      overlay: false,
    },
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
}));