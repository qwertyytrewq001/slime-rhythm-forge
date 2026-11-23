import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const BUILD_ID = Date.now().toString(36);

// a tiny file with this build's id, so an open or cached tab can notice a newer version exists
const versionFile: Plugin = {
  name: 'version-file',
  generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ id: BUILD_ID }) }); },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use relative paths for GitHub Pages to avoid CSP issues
  base: mode === 'production' || mode === 'poki' || mode === 'crazygames' ? './' : '/',
  
  // 2. Configure build output to use the 'docs' folder for GitHub Pages
  build: {
    // GitHub Pages serves docs/; the portal builds go to their own folders so they never touch the live site
    outDir: mode === 'poki' ? 'dist-poki' : mode === 'crazygames' ? 'dist-crazygames' : 'docs',
    emptyOutDir: true, // Cleans the folder before building
  },

  // A new id every build, added to slime picture links so a returning player never sees a stale cached sprite
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID), 'import.meta.env.VITE_PORTAL': JSON.stringify(mode === 'poki' ? 'poki' : mode === 'crazygames' ? 'crazygames' : 'none') },

  // Strip debug console.log from production builds (errors/warnings are kept)
  esbuild: {
    pure: mode === 'development' ? [] : ['console.log', 'console.debug'],
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
    versionFile,
    mode === "development" && componentTagger()
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));