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

export default defineConfig({
  plugins: [react(), dataPlugin()],
})
