import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const dataPlugin = () => {
  return {
    name: 'data-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/data') {
          const dataPath = path.resolve(__dirname, 'src/data.json')
          
          // Ensure file exists
          if (!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, JSON.stringify({ teams: [], matches: [] }, null, 2))
          }

          if (req.method === 'GET') {
            const data = fs.readFileSync(dataPath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(data)
            return
          }
          
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk.toString() })
            req.on('end', () => {
              fs.writeFileSync(dataPath, body)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            })
            return
          }
        }
        next()
      })
    }
  }
}

import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(), 
    dataPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
      manifest: {
        name: 'Botola PES-B-OR',
        short_name: 'PES-B-OR',
        description: 'Manage your PES-B-OR tournament bracket and standings',
        theme_color: '#0a0c10',
        background_color: '#0a0c10',
        display: 'standalone',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
