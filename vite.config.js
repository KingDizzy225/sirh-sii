import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB to allow large bundles
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'SIRH-SII Mobile',
        short_name: 'SIRH-SII',
        description: 'Système d\'Information Ressources Humaines SII',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        /**
         * Découpage des bibliothèques.
         *
         * Tout node_modules partait dans un seul fragment `vendor` de 2,1 Mo,
         * chargé avant le premier affichage — y compris les graphiques, la
         * cartographie et la génération de PDF, qui ne servent qu'à une
         * poignée d'écrans.
         *
         * Seules des bibliothèques *feuilles* sont détachées : rien d'autre
         * dans node_modules ne dépend d'elles, donc aucun cycle entre
         * fragments — c'est ce qui avait provoqué une page blanche lors d'une
         * tentative précédente. React et ses satellites restent groupés.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts') || id.includes('d3-')) return 'graphiques';
          if (id.includes('leaflet')) return 'cartographie';
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'documents';
          return 'vendor';
        }
      }
    },
    minify: 'esbuild',
    sourcemap: false
  },
})