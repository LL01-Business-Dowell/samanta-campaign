
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8005,
  },
  plugins: [react()],
  base: '/samantacampaign/'
})