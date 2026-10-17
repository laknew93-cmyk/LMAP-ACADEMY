import { marked } from 'marked'

marked.setOptions({ gfm: true })

// Internal links get a trailing slash so they hit the pre-rendered pages directly.
export function renderMarkdown(md) {
  return marked.parse(md || '').replace(/href="(\/[^"#?]*[^/"#?])"/g, 'href="$1/"')
}

// Parses the simple `key: value` front matter used in content/*.md files.
export function parseFrontMatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { meta: {}, body: raw }
  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  for (const key of ['keywords', 'courses']) {
    meta[key] = meta[key] ? meta[key].split(',').map(s => s.trim()).filter(Boolean) : []
  }
  return { meta, body: raw.slice(match[0].length) }
}

export function readingMinutes(md) {
  return Math.max(1, Math.round((md || '').split(/\s+/).length / 200))
}
