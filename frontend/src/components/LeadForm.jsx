import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/client'
import { COURSES } from '../lib/content'

export default function LeadForm({ title = 'Request a free callback', subtitle = 'Not sure which course is right for you? Leave your number and our team will call you.' }) {
  const { pathname } = useLocation()
  const [form, setForm] = useState({ name: '', phone: '', email: '', interest: '', message: '', website: '' })
  const [state, setState] = useState('idle') // idle | sending | sent
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setState('sending'); setError('')
    try {
      await api.post('/site/leads', { ...form, source: pathname })
      setState('sent')
      window.gtag?.('event', 'generate_lead', { interest: form.interest })
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not send. Please try again.')
      setState('idle')
    }
  }

  if (state === 'sent') return (
    <div className="card" style={{ padding: 28, textAlign: 'center', boxShadow: 'none' }}>
      <h3 style={{ fontSize: 22, marginBottom: 8 }}>Thank you, {form.name.split(' ')[0]}!</h3>
      <p className="muted">We've received your request and will get back to you within one working day.</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="card" style={{ padding: 28, boxShadow: 'none' }}>
      <h3 style={{ fontSize: 22, marginBottom: 6 }}>{title}</h3>
      <p className="muted" style={{ marginBottom: 20, fontSize: 15 }}>{subtitle}</p>
      <div className="grid-2" style={{ gap: 14 }}>
        <input className="form-input" placeholder="Your name *" value={form.name} onChange={set('name')} required minLength={2} aria-label="Name" />
        <input className="form-input" placeholder="Phone (WhatsApp) *" value={form.phone} onChange={set('phone')} required inputMode="tel" aria-label="Phone" />
        <input className="form-input" type="email" placeholder="Email (optional)" value={form.email} onChange={set('email')} aria-label="Email" />
        <select className="form-input" value={form.interest} onChange={set('interest')} aria-label="Interested in">
          <option value="">Interested in…</option>
          {COURSES.map(c => <option key={c.slug} value={c.title.split(':')[0]}>{c.title.split(':')[0]}</option>)}
          <option>All-Access Pass</option>
          <option>Corporate / college training</option>
          <option>Not sure yet</option>
        </select>
      </div>
      <textarea className="form-input" placeholder="Anything you'd like us to know? (optional)" value={form.message} onChange={set('message')}
        rows={3} style={{ width: '100%', marginTop: 14, resize: 'vertical' }} aria-label="Message" />
      {/* Hidden from people; bots fill it in. */}
      <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} style={{ position: 'absolute', left: -9999 }} aria-hidden="true" />
      {error && <p className="form-error" style={{ marginTop: 10 }}>{error}</p>}
      <button className="btn btn-primary" disabled={state === 'sending'} style={{ marginTop: 16 }}>
        {state === 'sending' ? 'Sending…' : 'Request a callback'}
      </button>
    </form>
  )
}
