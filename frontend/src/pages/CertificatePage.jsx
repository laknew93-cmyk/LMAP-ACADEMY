import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer, GraduationCap } from 'lucide-react'
import api from '../api/client'
import { useSeo } from '../lib/seo'
import { SITE } from '../site'

export function CertificateView({ cert }) {
  const date = new Date(cert.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="certificate">
      <div className="row" style={{ justifyContent: 'center', gap: 10, color: 'var(--primary)', fontSize: 22, fontWeight: 800 }}><GraduationCap size={32} /> {SITE.name}</div>
      <p style={{ marginTop: 28, letterSpacing: '.2em', fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>CERTIFICATE OF COMPLETION</p>
      <p style={{ marginTop: 24, color: 'var(--text-muted)' }}>This certifies that</p>
      <p style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, margin: '8px 0', fontFamily: 'Georgia, serif' }}>{cert.name}</p>
      <p style={{ color: 'var(--text-muted)' }}>has successfully completed</p>
      <p style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, margin: '8px 0', color: 'var(--primary-dark)' }}>{cert.course_title}</p>
      <p style={{ color: 'var(--text-muted)' }}>{cert.duration_hours} hours of self-paced learning · {date}</p>
      <p style={{ marginTop: 36, fontSize: 13, color: 'var(--text-muted)' }}>
        Certificate ID <strong>{cert.code}</strong> · verify at {SITE.url.replace('https://', '')}/verify/{cert.code}
      </p>
    </div>
  )
}

export default function CertificatePage() {
  const { slug } = useParams()
  const [cert, setCert] = useState(null)
  const [error, setError] = useState('')
  useSeo({ title: 'Your certificate', path: `/certificate/${slug}`, noindex: true })

  useEffect(() => {
    api.post(`/certificates/${slug}`).then(r => setCert(r.data)).catch(e => setError(e.response?.data?.detail || 'Could not load certificate'))
  }, [slug])

  if (error) return (
    <div className="section container-sm" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: 26, marginBottom: 12 }}>Certificate not ready yet</h1>
      <p className="muted" style={{ marginBottom: 20 }}>{error}</p>
      <Link to={`/learn/${slug}`} className="btn btn-primary">Back to the course</Link>
    </div>
  )
  if (!cert) return <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}><div className="spinner" /></div>

  const verifyUrl = `${SITE.url}/verify/${cert.code}`
  return (
    <div className="section" style={{ background: '#F3F4F6' }}>
      <div className="container">
        <div className="row no-print" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <button className="btn btn-primary" onClick={() => window.print()}><Printer size={16} /> Download / print PDF</button>
          <a className="btn btn-outline" target="_blank" rel="noreferrer"
            href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.course_title)}&organizationName=${encodeURIComponent(SITE.name)}&certId=${cert.code}&certUrl=${encodeURIComponent(verifyUrl)}`}>
            Add to LinkedIn
          </a>
        </div>
        <CertificateView cert={cert} />
      </div>
    </div>
  )
}
