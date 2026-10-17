import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Injects Google Search Console verification and GA4 when the env vars are set at build time.
function analytics(env) {
  return {
    name: 'lmap-analytics',
    transformIndexHtml(html) {
      const tags = []
      if (env.VITE_GSC_VERIFICATION) tags.push(`<meta name="google-site-verification" content="${env.VITE_GSC_VERIFICATION}" />`)
      if (env.VITE_GA_ID) tags.push(
        `<script async src="https://www.googletagmanager.com/gtag/js?id=${env.VITE_GA_ID}"></script>`,
        `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${env.VITE_GA_ID}',{send_page_view:false});</script>`,
      )
      return html.replace('<!--%ANALYTICS%-->', tags.join('\n    '))
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), analytics(env)],
    server: {
      port: 5174,
      proxy: {
        '/api': { target: 'http://localhost:8001', rewrite: p => p.replace(/^\/api/, '') }
      }
    }
  }
})
