import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { useAuth } from '../App'
import { paidCourses, formatINR } from '../lib/content'
import { checkout } from '../lib/checkout'
import { useSeo } from '../lib/seo'
import { SITE } from '../site'

export default function AllAccessPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paying, setPaying] = useState(false)
  const [toast, setToast] = useState(null)
  const courses = paidCourses()
  const value = courses.reduce((s, c) => s + c.price, 0)
  const hours = courses.reduce((s, c) => s + c.duration_hours, 0)
  const lessons = courses.reduce((s, c) => s + c.lesson_count, 0)
  const save = Math.round((1 - SITE.bundle.price / value) * 100)

  useSeo({
    title: 'All-Access Pass — Every AI Course in One Bundle',
    description: `Get all ${courses.length} LMAP Academy AI courses — ChatGPT, prompt engineering, automation, data and GenAI — for ${formatINR(SITE.bundle.price)}. Save ${save}%. Lifetime access.`,
    path: '/all-access',
  })

  const buy = async () => {
    if (!user) { navigate('/register?next=/all-access'); return }
    setPaying(true)
    try {
      const slugs = await checkout({ bundle: true })
      if (slugs) {
        window.gtag?.('event', 'purchase', { currency: 'INR', value: SITE.bundle.price, items: [{ item_id: 'all-access', item_name: 'All-Access Pass' }] })
        navigate('/dashboard')
      }
    } catch (e) {
      setToast(e.response?.data?.detail || e.message || 'Something went wrong')
      setTimeout(() => setToast(null), 5000)
    } finally { setPaying(false) }
  }

  const cta = (
    <button className="btn btn-accent btn-lg" onClick={buy} disabled={paying}>
      <ShoppingCart size={18} /> {paying ? 'Processing…' : `Get All-Access for ${formatINR(SITE.bundle.price)}`}
    </button>
  )

  return (
    <div>
      <section className="hero-dark" style={{ padding: '72px 0', textAlign: 'center' }}>
        <div className="container-sm">
          <span className="eyebrow">Save {save}%</span>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, margin: '18px 0 14px' }}>All-Access Pass</h1>
          <p style={{ fontSize: 18, color: '#D1D5DB', lineHeight: 1.7, marginBottom: 28 }}>
            Every paid LMAP Academy course — {courses.length} courses, {lessons} lessons, about {Math.round(hours)} hours of
            practical AI training — plus all future updates, for one payment.
          </p>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 52, fontWeight: 800 }}>{formatINR(SITE.bundle.price)}</span>{' '}
            <span className="mrp" style={{ fontSize: 22, color: '#9CA3AF' }}>{formatINR(value)}</span>
          </div>
          {cta}
          <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 14 }}>One-time payment · inclusive of taxes · lifetime access · {SITE.refundDays}-day refund policy</p>
        </div>
      </section>

      <section className="section">
        <div className="container-sm">
          <h2 className="section-title" style={{ marginBottom: 24 }}>What's included</h2>
          <div className="stack">
            {courses.map(c => (
              <Link key={c.slug} to={`/courses/${c.slug}`} className="card row" style={{ padding: '16px 20px', justifyContent: 'space-between', boxShadow: 'none' }}>
                <span>
                  <strong style={{ display: 'block' }}>{c.title}</strong>
                  <span className="muted" style={{ fontSize: 14 }}>{c.category} · {c.lesson_count} lessons · {c.duration_hours} hours</span>
                </span>
                <span className="mrp">{formatINR(c.price)}</span>
              </Link>
            ))}
            <div className="row" style={{ justifyContent: 'space-between', padding: '8px 20px', fontWeight: 700 }}>
              <span>Total if bought separately</span><span>{formatINR(value)}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', padding: '0 20px', fontWeight: 800, color: 'var(--primary)', fontSize: 20 }}>
              <span>All-Access price</span><span>{formatINR(SITE.bundle.price)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>{cta}</div>
          <p className="muted" style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
            Not sure yet? <Link to="/courses/ai-in-60-minutes" style={{ color: 'var(--primary)' }}>Try the free course first <ArrowRight size={12} /></Link>
          </p>
        </div>
      </section>
      {toast && <div className="toast toast-error" role="status">{toast}</div>}
    </div>
  )
}
