import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: true, // Otomatis expose ke local network / IP Wi-Fi
    port: 5173,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})

