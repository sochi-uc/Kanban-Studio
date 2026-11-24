import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev: Vite serves the SPA and proxies /api to the ASP.NET Core API (same-origin from the browser's view,
// so the SameSite=Strict session cookie and CSRF origin check work unchanged).
// Build: output goes straight into the API's wwwroot, which serves it with the strict CSP.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:5080', changeOrigin: false },
      '/healthz': { target: 'http://localhost:5080' },
    },
  },
  build: {
    outDir: '../server/src/Kanban.Api/wwwroot',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
    // No inline <script>/<style> so the API's CSP (script-src 'self'; style-src 'self') holds.
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
  },
})
