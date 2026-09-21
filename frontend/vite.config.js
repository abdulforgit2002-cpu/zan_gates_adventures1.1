import fs from 'node:fs'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import HOTELS from './src/data/hotels.js'

/*
 * Emits /seo-data.json — the static-page SEO metadata plus the hotel
 * catalog. The backend renderer (backend/src/Seo) reads it over the
 * internal network so titles/descriptions/hotels live in exactly one place
 * (this frontend) instead of being duplicated in PHP.
 */
function seoDataPlugin() {
  const pages = JSON.parse(
    fs.readFileSync(new URL('./src/seo/pages.json', import.meta.url), 'utf8'),
  )

  const payload = () =>
    JSON.stringify({
      pages,
      hotels: HOTELS.map((hotel) => ({
        slug: hotel.slug,
        name: hotel.name,
        location: hotel.location,
        tagline: hotel.tagline,
        description: hotel.description,
        highlights: hotel.highlights || [],
        images: (hotel.images || []).slice(0, 8),
      })),
    })

  return {
    name: 'zan-seo-data',

    configureServer(server) {
      server.middlewares.use('/seo-data.json', (_request, response) => {
        response.setHeader('Content-Type', 'application/json')
        response.end(payload())
      })
    },

    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'seo-data.json',
        source: payload(),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoDataPlugin()],
})
