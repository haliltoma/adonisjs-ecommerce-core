import { defineConfig } from 'vite'
import { resolve } from 'path'
import adonisjs from '@adonisjs/vite/client'
import inertia from '@adonisjs/inertia/client'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    allowedHosts: true,
  },
  plugins: [
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
