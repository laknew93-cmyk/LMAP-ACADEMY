import React from 'react'
import { Link } from 'react-router-dom'
import { POSTS } from '../lib/content'
import { readingMinutes } from '../lib/markdown'
import { useSeo } from '../lib/seo'

export default function BlogPage() {
  useSeo({ title: 'AI Learning Blog — Guides, Roadmaps & Career Tips', description: 'Free practical guides on learning AI in India: prompt engineering, AI skills for jobs, freelancing with AI, AI agents, AI in Excel and more.', path: '/blog' })
  return (
    <div>
      <div className="hero-dark" style={{ padding: '56px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 800, marginBottom: 12 }}>The LMAP AI blog</h1>
          <p style={{ fontSize: 18, color: '#9CA3AF' }}>Practical guides to learning and using AI</p>
        </div>
      </div>
      <div className="section">
        <div className="container grid-3">
          {POSTS.map(p => (
            <Link key={p.slug} to={`/blog/${p.slug}/`} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
              <span className="muted" style={{ fontSize: 13 }}>{readingMinutes(p.body)} min read</span>
              <h2 style={{ fontSize: 19, margin: '8px 0', lineHeight: 1.4 }}>{p.title}</h2>
              <p className="muted" style={{ fontSize: 15, flex: 1 }}>{p.description}</p>
              <span style={{ color: 'var(--primary)', fontWeight: 600, marginTop: 14, fontSize: 14 }}>Read guide →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
