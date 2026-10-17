import React from 'react'
import { Navigate } from 'react-router-dom'
import { PAGES } from '../lib/content'
import { renderMarkdown } from '../lib/markdown'
import { useSeo } from '../lib/seo'

export default function StaticPage({ name }) {
  const page = PAGES[name]
  useSeo({ title: page?.title, description: page?.description, path: `/${name}` })
  if (!page) return <Navigate to="/" replace />
  return (
    <div className="section">
      <div className="container-sm">
        <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 40px)', fontWeight: 800, marginBottom: 28 }}>{page.title}</h1>
        <article className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }} />
      </div>
    </div>
  )
}
