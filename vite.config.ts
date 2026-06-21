import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GH_PAGES ? '/HPDC-AI-monotor/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
})
