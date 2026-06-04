import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin to inject build timestamp into the service worker in the dist folder
const updateServiceWorkerPlugin = () => {
  return {
    name: 'update-service-worker',
    closeBundle() {
      try {
        const swPath = path.resolve(__dirname, 'dist/sw.js');
        if (fs.existsSync(swPath)) {
          let swContent = fs.readFileSync(swPath, 'utf8');
          const timestamp = Date.now();
          // Replace dynamic Date.now() with static build timestamp
          swContent = swContent.replace(
            /const CACHE_NAME = 'mamun-socks-' \+ Date\.now\(\);/,
            `const CACHE_NAME = 'mamun-socks-${timestamp}';`
          );
          // Prepend build timestamp comment to ensure byte-by-byte difference
          swContent = `// Build Timestamp: ${timestamp}\n` + swContent;
          fs.writeFileSync(swPath, swContent, 'utf8');
          console.log(`Service Worker cache name updated to: mamun-socks-${timestamp}`);
        }
      } catch (err) {
        console.error('Failed to update service worker build timestamp:', err);
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), updateServiceWorkerPlugin()],
})

