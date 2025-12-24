import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- ADICIONA ISTO AQUI EMBAIXO ---
  server: {
    host: '127.0.0.1', // Força IPv4
    port: 5173,        // Força a porta fixa
  }
})