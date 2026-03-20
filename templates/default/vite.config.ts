import { defineConfig } from 'vite'
import { resolve } from 'path'
import adonisjs from '@adonisjs/vite/client'
import inertia from '@adonisjs/inertia/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    allowedHosts: true,
    host: 'localhost',
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      clientPort: 5173,
      timeout: 30000,
      overlay: true,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  plugins: [
    {
      name: 'hmr-error-handler',
      configureServer(server) {
        server.httpServer?.on('error', (err: any) => {
          if (err?.code === 'ERR_IPC_CHANNEL_CLOSED') {
            console.warn('HMR: IPC channel closed (this is normal during file changes)')
            return
          }
        })
      },
    },
    adonisjs({
      entrypoints: ['inertia/app/app.tsx', 'inertia/css/app.css'],
      reload: ['resources/views/**/*.edge'],
    }),
    inertia({ ssr: { enabled: false } }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './inertia'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
