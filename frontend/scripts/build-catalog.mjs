// Copies course metadata (no lesson bodies) from backend/content into src/data/catalog.json.
// The frontend uses it for instant course pages and for pre-rendered SEO HTML. If the backend
// folder is not available (e.g. a build that only checks out frontend/), the committed
// catalog.json is used as-is.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const contentDir = path.resolve(here, '../../backend/content/courses')
const outFile = path.resolve(here, '../src/data/catalog.json')

if (!fs.existsSync(contentDir)) {
  console.log('[catalog] backend content not found, keeping committed catalog.json')
  process.exit(0)
}

const courses = fs.readdirSync(contentDir)
  .filter(slug => fs.existsSync(path.join(contentDir, slug, 'course.json')))
  .map(slug => {
    const course = JSON.parse(fs.readFileSync(path.join(contentDir, slug, 'course.json'), 'utf8'))
    const lessons = course.modules.flatMap(m => m.lessons)
    return {
      ...course,
      lesson_count: lessons.length,
      modules: course.modules.map(m => ({
        title: m.title,
        lessons: m.lessons.map(({ title, minutes, preview, summary }) => ({ title, minutes, preview, summary })),
      })),
    }
  })
  .filter(c => c.published !== false)
  .sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99))

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(courses, null, 1) + '\n')
console.log(`[catalog] wrote ${courses.length} courses`)
