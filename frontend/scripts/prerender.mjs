// Runs after `vite build`. Writes a static HTML file for every public route with its own
// <title>, meta description, canonical URL, Open Graph tags, JSON-LD structured data and
// crawlable body content, plus sitemap.xml and robots.txt. React replaces the static body
// when it boots, so visitors get the full app and crawlers get real HTML.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const dist = path.join(root, 'dist')

const SITE = {
  name: 'LMAP Academy',
  url: 'https://lmapacademy.org',
  tagline: 'Practical AI courses for India',
  description: 'Learn ChatGPT, prompt engineering, AI automation, data analysis and generative AI with practical, India-focused online courses. Certificate included.',
  email: 'support@lmapacademy.org',
  bundlePrice: 6999,
}
const TODAY = new Date().toISOString().slice(0, 10)

const courses = JSON.parse(fs.readFileSync(path.join(root, 'src/data/catalog.json'), 'utf8'))
const paid = courses.filter(c => c.price > 0)

function readMd(dir) {
  const full = path.join(root, dir)
  if (!fs.existsSync(full)) return []
  return fs.readdirSync(full).filter(f => f.endsWith('.md')).map(f => {
    const raw = fs.readFileSync(path.join(full, f), 'utf8')
    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
    const meta = {}
    if (m) for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(':')
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }
    return { slug: f.replace(/\.md$/, ''), ...meta, body: m ? raw.slice(m[0].length) : raw }
  })
}
const posts = readMd('content/blog').sort((a, b) => (b.date || '').localeCompare(a.date || ''))
const pages = readMd('content/pages')

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const inr = n => '₹' + Number(n).toLocaleString('en-IN')

const ORG = {
  '@type': 'EducationalOrganization',
  '@id': `${SITE.url}/#org`,
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/favicon.svg`,
  email: SITE.email,
  telephone: '+91-8111055661',
  legalName: 'LMAP Academy Pvt. Ltd.',
  description: SITE.description,
}

const faqLd = faqs => faqs?.length ? {
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
} : null

const crumbs = items => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE.url + p })),
})

const courseLink = c => `<li><a href="/courses/${c.slug}">${esc(c.title)}</a> — ${c.price ? inr(c.price) : 'Free'}. ${esc(c.subtitle)}</li>`

const routes = []

routes.push({
  path: '/',
  title: `${SITE.name} — AI Courses Online in India: ChatGPT, Prompt Engineering & GenAI`,
  description: SITE.description,
  ld: [ORG, { '@type': 'WebSite', name: SITE.name, url: SITE.url }, faqLd([
    { q: 'Do I need a technical background?', a: 'No. Six of our seven paid courses are designed for non-technical learners. Only Generative AI Mastery expects basic Python.' },
    { q: 'Do I get a certificate?', a: 'Yes. Complete every lesson to download a certificate with a unique, verifiable ID.' },
    { q: 'What is the refund policy?', a: 'Full refund within 7 days of purchase if you have completed less than 30% of the course.' },
  ])],
  body: `<h1>Learn the AI skills that get you hired, paid and promoted</h1>
<p>${esc(SITE.description)}</p>
<h2>Our AI courses</h2><ul>${courses.map(courseLink).join('')}</ul>
<p><a href="/all-access">All-Access Pass: every course for ${inr(SITE.bundlePrice)}</a></p>
<h2>Free AI guides</h2><ul>${posts.map(p => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a></li>`).join('')}</ul>`,
})

routes.push({
  path: '/courses',
  title: `All AI Courses — ChatGPT, Prompt Engineering, Automation & GenAI | ${SITE.name}`,
  description: 'Browse practical AI courses for Indian learners: ChatGPT, prompt engineering, AI freelancing, content, data analysis, no-code agents and Python GenAI.',
  ld: [{
    '@type': 'ItemList',
    itemListElement: courses.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.url}/courses/${c.slug}` })),
  }],
  body: `<h1>AI courses</h1><ul>${courses.map(courseLink).join('')}</ul>`,
})

for (const c of courses) {
  const p = `/courses/${c.slug}`
  routes.push({
    path: p,
    title: `${c.seo?.title || c.title} | ${SITE.name}`,
    description: c.seo?.description || c.subtitle,
    keywords: c.seo?.keywords,
    ld: [
      {
        '@type': 'Course',
        name: c.title,
        description: c.seo?.description || c.subtitle,
        url: SITE.url + p,
        provider: { '@id': `${SITE.url}/#org`, '@type': 'EducationalOrganization', name: SITE.name, sameAs: SITE.url },
        educationalLevel: c.level,
        inLanguage: 'en-IN',
        teaches: c.outcomes,
        coursePrerequisites: c.prerequisites,
        isAccessibleForFree: c.price === 0,
        offers: {
          '@type': 'Offer', category: c.price ? 'Paid' : 'Free', price: c.price, priceCurrency: 'INR',
          availability: 'https://schema.org/InStock', url: SITE.url + p,
        },
        hasCourseInstance: {
          '@type': 'CourseInstance', courseMode: 'Online',
          courseWorkload: `PT${Math.round(c.duration_hours * 60)}M`,
        },
      },
      crumbs([['Courses', '/courses'], [c.title, p]]),
      faqLd(c.faqs),
    ],
    body: `<nav><a href="/courses">Courses</a> / ${esc(c.category)}</nav>
<h1>${esc(c.title)}</h1><p>${esc(c.subtitle)}</p>
<p>${c.price ? `Price: ${inr(c.price)}${c.mrp ? ` (MRP ${inr(c.mrp)})` : ''}` : 'Free course'} · ${c.level} · ${c.duration_hours} hours · ${c.lesson_count} lessons · certificate included</p>
<h2>What you'll learn</h2><ul>${(c.outcomes || []).map(o => `<li>${esc(o)}</li>`).join('')}</ul>
<h2>Curriculum</h2>${c.modules.map((m, i) => `<h3>Module ${i + 1}: ${esc(m.title)}</h3><ul>${m.lessons.map(l => `<li>${esc(l.title)} — ${esc(l.summary)}</li>`).join('')}</ul>`).join('')}
<h2>Projects</h2><ul>${(c.projects || []).map(o => `<li>${esc(o)}</li>`).join('')}</ul>
<h2>Who this course is for</h2><ul>${(c.audience || []).map(o => `<li>${esc(o)}</li>`).join('')}</ul>
<h2>About this course</h2>${c.description.split(/\n\n+/).map(t => `<p>${esc(t)}</p>`).join('')}
<h2>FAQs</h2>${(c.faqs || []).map(f => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`,
  })
}

const bundleValue = paid.reduce((s, c) => s + c.price, 0)
routes.push({
  path: '/all-access',
  title: `All-Access Pass — Every AI Course in One Bundle | ${SITE.name}`,
  description: `Get all ${paid.length} LMAP Academy AI courses for ${inr(SITE.bundlePrice)} instead of ${inr(bundleValue)}. ChatGPT, prompt engineering, automation, data and GenAI. Lifetime access.`,
  ld: [{
    '@type': 'Product', name: 'LMAP Academy All-Access Pass', brand: { '@type': 'Brand', name: SITE.name },
    description: `All ${paid.length} paid AI courses with lifetime access.`,
    offers: { '@type': 'Offer', price: SITE.bundlePrice, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: `${SITE.url}/all-access` },
  }],
  body: `<h1>All-Access Pass</h1><p>Every paid course for ${inr(SITE.bundlePrice)} (worth ${inr(bundleValue)}).</p><ul>${paid.map(courseLink).join('')}</ul>`,
})

routes.push({
  path: '/blog',
  title: `AI Learning Blog — Guides, Roadmaps & Career Tips | ${SITE.name}`,
  description: 'Free practical guides on learning AI in India: prompt engineering, AI skills for jobs, freelancing with AI, AI agents, AI in Excel and more.',
  ld: [],
  body: `<h1>The LMAP AI blog</h1><ul>${posts.map(p => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a> — ${esc(p.description)}</li>`).join('')}</ul>`,
})

for (const p of posts) {
  const url = `/blog/${p.slug}`
  routes.push({
    path: url,
    title: `${p.title} | ${SITE.name}`,
    description: p.description,
    keywords: (p.keywords || '').split(',').map(s => s.trim()).filter(Boolean),
    type: 'article',
    lastmod: p.date,
    ld: [
      {
        '@type': 'BlogPosting', headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date,
        mainEntityOfPage: SITE.url + url, author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
        publisher: { '@id': `${SITE.url}/#org`, '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/favicon.svg` } },
        image: `${SITE.url}/og-image.png`,
      },
      crumbs([['Blog', '/blog'], [p.title, url]]),
    ],
    body: `<nav><a href="/blog">Blog</a></nav><article><h1>${esc(p.title)}</h1>${marked.parse(p.body)}</article>`,
  })
}

for (const p of pages) {
  routes.push({
    path: `/${p.slug}`,
    title: `${p.title} | ${SITE.name}`,
    description: p.description,
    ld: [],
    priority: '0.3',
    body: `<h1>${esc(p.title)}</h1>${marked.parse(p.body)}`,
  })
}

// ---------- write files ----------
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

function head(r) {
  const url = SITE.url + (r.path === '/' ? '/' : r.path)
  const ld = r.ld.filter(Boolean)
  return [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    r.keywords?.length ? `<meta name="keywords" content="${esc(r.keywords.join(', '))}" />` : '',
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${r.type || 'website'}" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE.url}/og-image.png" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(r.title)}" />`,
    `<meta name="twitter:description" content="${esc(r.description)}" />`,
    `<meta name="twitter:image" content="${SITE.url}/og-image.png" />`,
    ld.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': ld }).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n    ')
}

for (const r of routes) {
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, head(r))
    .replace('<div id="root"></div>', `<div id="root"><main class="prerendered" style="max-width:860px;margin:0 auto;padding:24px">${r.body}</main></div>`)
  const file = r.path === '/' ? path.join(dist, 'index.html') : path.join(dist, r.path, 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
}

// SPA fallback for app-only routes (login, dashboard, learn…) keeps the generic template.
fs.writeFileSync(path.join(dist, '200.html'), template)

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url><loc>${SITE.url}${r.path === '/' ? '/' : r.path}</loc><lastmod>${r.lastmod || TODAY}</lastmod><priority>${r.priority || (r.path === '/' ? '1.0' : r.path.startsWith('/courses') || r.path === '/all-access' ? '0.9' : '0.7')}</priority></url>`).join('\n')}
</urlset>
`
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)

fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /learn/
Disallow: /dashboard
Disallow: /admin
Disallow: /certificate/
Disallow: /login
Disallow: /register

Sitemap: ${SITE.url}/sitemap.xml
`)

console.log(`[prerender] wrote ${routes.length} pages, sitemap.xml and robots.txt`)
