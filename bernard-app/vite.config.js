import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { test: /node_modules\/react-player/, name: 'media' },
            { test: /node_modules\/(react-dom|react)\//, name: 'react-vendor' },
            { test: /\/src\/components\/mobile\/(MobileArtistSection|MobileArtistPanels)\.jsx$/, name: 'mobile-artists' },
            { test: /\/src\/components\/mobile\/(MobileProjectSection|MobileProjectPanels)\.jsx$/, name: 'mobile-projects' },
            { test: /\/src\/components\/mobile\/(MobileCollectifSection|MobileCollectifPanels|MobileLieuSection|MobileLieuPanels|MobileFestivalSection|MobileFestivalPanels)\.jsx$/, name: 'mobile-network' },
            { test: /\/src\/components\/mobile\/(MobileToolsSection|MobileToolsEditors)\.jsx$/, name: 'mobile-tools' },
            { test: /\/src\/components\/mobile\/(MobileArtistApp|MobilePrimitives|MobileDataUtils|MobileShell)\.jsx$|\/src\/components\/mobile\/MobileDataUtils\.js$/, name: 'mobile-core' },
            { test: /\/src\/components\/win95\//, name: 'desktop' },
            { test: /node_modules\//, name: 'vendor' },
          ],
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
