import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Link previews need an ABSOLUTE image URL inside index.html (crawlers don't run JavaScript).
// Uses VITE_SITE_URL if set (e.g. your custom domain), otherwise Vercel's built-in system variables.
const siteUrl = () => {
  const e = process.env
  const u = e.VITE_SITE_URL || (e.VERCEL_PROJECT_PRODUCTION_URL && 'https://' + e.VERCEL_PROJECT_PRODUCTION_URL) || (e.VERCEL_URL && 'https://' + e.VERCEL_URL) || ''
  return u.replace(/\/$/, '')
}
export default defineConfig({
  plugins: [react(), { name: 'site-url', transformIndexHtml: (html: string) => html.split('__SITE_URL__').join(siteUrl()) }],
})
