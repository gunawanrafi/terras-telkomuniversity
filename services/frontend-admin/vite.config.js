import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ui': resolve(__dirname, 'packages/ui'),
      '@core': resolve(__dirname, 'packages/core'),
    },
  },
})
