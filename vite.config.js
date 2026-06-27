import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,      // 👈 Forces Vite to use port 3000
    strictPort: true // 👈 Optional: Prevents Vite from automatically switching to 3001 if 3000 is busy
  }
})
