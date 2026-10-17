import { useEffect } from 'react'
import { SITE } from '../site'

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

// Keeps <title>, description, canonical and social tags in step with client-side navigation.
// The pre-rendered HTML (scripts/prerender.mjs) sets the same tags for crawlers.
export function useSeo({ title, description, path, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`
    const desc = description || SITE.description
    const url = SITE.url + (path ?? window.location.pathname)
    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
    if (window.gtag) window.gtag('event', 'page_view', { page_location: url, page_title: fullTitle })
  }, [title, description, path, noindex])
}
