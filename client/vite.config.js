import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isVercel = Boolean(process.env.VERCEL);
const isGitHubPages = Boolean(process.env.GITHUB_ACTIONS || process.env.IS_GH_PAGES);
const base = isVercel ? '/' : (isGitHubPages ? '/WORLD_Tourism/' : '/');

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-globe.gl') || id.includes('three')) {
              return 'vendor-globe';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            return 'vendor-common';
          }
        }
      }
    }
  }
});
