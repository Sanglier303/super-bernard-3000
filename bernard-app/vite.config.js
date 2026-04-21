import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20000,
          maxSize: 220000,
          groups: [
            { test: /node_modules\/react-player/, name: 'media', priority: 60 },
            { test: /node_modules\/(react-dom|react)\//, name: 'react-vendor', priority: 55 },
            { test: /\/src\/components\/mobile\/(MobileArtistSection|MobileArtistPanels)\.jsx$/, name: 'mobile-artists', priority: 50 },
            { test: /\/src\/components\/mobile\/(MobileProjectSection|MobileProjectPanels)\.jsx$/, name: 'mobile-projects', priority: 48 },
            { test: /\/src\/components\/mobile\/(MobileCollectifSection|MobileCollectifPanels|MobileLieuSection|MobileLieuPanels|MobileFestivalSection|MobileFestivalPanels)\.jsx$/, name: 'mobile-network', priority: 46 },
            { test: /\/src\/components\/mobile\/(MobileToolsSection|MobileToolsEditors)\.jsx$/, name: 'mobile-tools', priority: 44 },
            { test: /\/src\/components\/mobile\/(MobileArtistApp|MobilePrimitives|MobileDataUtils|MobileShell)\.jsx$|\/src\/components\/mobile\/MobileDataUtils\.js$/, name: 'mobile-core', priority: 42 },
            { test: /\/src\/components\/win95\/(Desktop|DraggableWindow|StartMenu|Mascot|StickyNotes)\.jsx$|\/src\/constants\/wallpapers\.js$/, name: 'desktop-core', priority: 40 },
            { test: /\/src\/components\/win95\/(DatabaseWindow|DatabaseArtistUtils|DatabaseSidebar|DatabaseArtistTable|ArtistSubWindows|ArtistDetailView|ArtistEditView|ArtistQuickEditView|ArtistWindowCommon)\.jsx$/, name: 'desktop-artists', priority: 38 },
            { test: /\/src\/components\/win95\/(CollectifsWindow|LieuxWindow|FestivalsWindow)\.jsx$/, name: 'desktop-network', priority: 36 },
            { test: /\/src\/components\/win95\/(ProjectManager|CalendarWindow|NotePadWindow|DesktopSettings|UniversalSearch|StickyManager|TodoWindow|TrashWindow|ManualWindow|RadioWindow)\.jsx$/, name: 'desktop-tools', priority: 34 },
            { test: /node_modules\//, name: 'vendor', priority: 10 },
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
