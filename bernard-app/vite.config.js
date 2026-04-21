import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-player')) return 'media'
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor'
            return 'vendor'
          }

          if (id.includes('/src/components/mobile/')) {
            if (id.includes('MobileArtist')) return 'mobile-artists'
            if (id.includes('MobileProject')) return 'mobile-projects'
            if (id.includes('MobileCollectif') || id.includes('MobileLieu') || id.includes('MobileFestival')) return 'mobile-network'
            if (id.includes('MobileTools')) return 'mobile-tools'
            return 'mobile-core'
          }
          if (id.includes('/src/components/win95/')) return 'desktop'
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
