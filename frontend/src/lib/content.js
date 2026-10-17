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
