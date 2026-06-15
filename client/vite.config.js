import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:4173",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // Ensure Authorization header is forwarded
            if (req.headers.authorization) {
              proxyReq.setHeader("authorization", req.headers.authorization);
            }
          });
        },
      },
    },
  },
})
