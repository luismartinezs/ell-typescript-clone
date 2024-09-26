import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@f': path.resolve(__dirname, './src-functional'),
      '@e': path.resolve(__dirname, './examples'),
    }
  },
  // ... other configurations ...
})