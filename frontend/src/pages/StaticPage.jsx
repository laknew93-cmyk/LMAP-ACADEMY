import React from 'react'
import { Navigate } from 'react-router-dom'
import { PAGES } from '../lib/content'
import { renderMarkdown } from '../lib/markdown'
import { useSeo } from '../lib/seo'
import LeadForm from '../components/LeadForm'
import { SITE } from '../site'

export default function StaticPage({ name }) {
  const page = PAGES[name]
  useSeo({ title: page?.title, description: page?.description, path: `/${name}` })
  if (!page) return <Navigate to="/" replace />
  return (
    <div className="section">
      <div className="container-sm">
        <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 40px)', fontWeight: 800, marginBottom: 28 }}>{page.title}</h1>
        {name === 'contact' && (
          <div className="card" style={{ padding: 24, marginBottom: 28, boxShadow: 'none', background: 'var(--primary-light)', borderColor: '#DDD6FE' }}>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{SITE.legalName}</p>
            <div className="stack" style={{ gap: 6, fontSize: 16 }}>
              <span>Email: <a href={`mailto:${SITE.email}`} style={{ color: 'var(--primary)' }}>{SITE.email}</a></span>
              {SITE.phone && <span>Phone: <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} style={{ color: 'var(--primary)' }}>{SITE.phone}</a></span>}
              {SITE.whatsapp && <span>WhatsApp: <a href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, '')}`} style={{ color: 'var(--primary)' }}>{SITE.whatsapp}</a></span>}
              {SITE.address && <span>Address: {SITE.address}</span>}
              {SITE.gstin && <span>GSTIN: {SITE.gstin}</span>}
            </div>
          </div>
        )}
        <article className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }} />
        {name === 'contact' && <div style={{ marginTop: 36 }}><LeadForm title="Send us a message" subtitle="Leave your details and we'll get back to you within one working day." /></div>}
      </div>
    </div>
  )
}
