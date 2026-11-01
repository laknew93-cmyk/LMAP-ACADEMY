import catalog from '../data/catalog.json'
import { parseFrontMatter } from './markdown'

export const COURSES = catalog
export const findCourse = slug => COURSES.find(c => c.slug === slug)
export const paidCourses = () => COURSES.filter(c => c.price > 0)

const blogFiles = import.meta.glob('../../content/blog/*.md', { query: '?raw', import: 'default', eager: true })
export const POSTS = Object.entries(blogFiles)
  .map(([file, raw]) => {
    const { meta, body } = parseFrontMatter(raw)
    return { slug: file.split('/').pop().replace(/\.md$/, ''), ...meta, body }
  })
  .sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title))
export const findPost = slug => POSTS.find(p => p.slug === slug)

const pageFiles = import.meta.glob('../../content/pages/*.md', { query: '?raw', import: 'default', eager: true })
export const PAGES = Object.fromEntries(
  Object.entries(pageFiles).map(([file, raw]) => {
    const { meta, body } = parseFrontMatter(raw)
    return [file.split('/').pop().replace(/\.md$/, ''), { ...meta, body }]
  })
)

export const formatINR = n => '₹' + Number(n || 0).toLocaleString('en-IN')
export const discountPct = c => (c.mrp && c.mrp > c.price ? Math.round((1 - c.price / c.mrp) * 100) : 0)

// Admin-panel edits (prices, titles, publish state, business details) live in the database.
// The catalog above is baked in at build time for speed and SEO; this patches it with live values.
export function applyLive(liveCourses, settings, SITE) {
  if (Array.isArray(liveCourses) && liveCourses.length) {
    const bySlug = Object.fromEntries(liveCourses.map(c => [c.slug, c]))
    for (let i = COURSES.length - 1; i >= 0; i--) {
      const live = bySlug[COURSES[i].slug]
      if (!live) { COURSES.splice(i, 1); continue } // unpublished in the admin panel
      Object.assign(COURSES[i], { title: live.title, subtitle: live.short_description || COURSES[i].subtitle, price: live.price, mrp: live.mrp })
    }
  }
  if (settings && SITE) {
    if (settings.bundle_price) SITE.bundle.price = settings.bundle_price
    if (settings.phone !== undefined) SITE.phone = settings.phone
    if (settings.support_email) SITE.email = settings.support_email
    if (settings.legal_name) SITE.legalName = settings.legal_name
    if (settings.address !== undefined) SITE.address = settings.address
    if (settings.gstin !== undefined) SITE.gstin = settings.gstin
    if (settings.refund_days) SITE.refundDays = settings.refund_days
    SITE.whatsapp = settings.whatsapp || ''
    SITE.announcement = settings.announcement || ''
  }
}
