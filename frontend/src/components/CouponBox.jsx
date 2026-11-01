import React, { useState } from 'react'
import api from '../api/client'
import { formatINR } from '../lib/content'

// "Have a coupon?" field. Calls onChange({ code, final }) when a code is applied, or null when removed.
export default function CouponBox({ courseSlug, bundle = false, applied, onChange, dark = false }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const color = dark ? '#C4B5FD' : 'var(--primary)'

  const apply = async e => {
    e.preventDefault()
    if (!code.trim()) return
    setBusy(true); setError('')
    try {
      const params = bundle ? { code, bundle: true } : { code, course_slug: courseSlug }
      const { data } = await api.get('/site/coupon', { params })
      onChange({ code: data.code, final: data.final, saved: data.saved })
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not check this code')
    } finally { setBusy(false) }
  }

  if (applied) return (
    <p style={{ fontSize: 14, marginTop: 12, color: dark ? '#A7F3D0' : 'var(--success)', fontWeight: 600 }}>
      Coupon {applied.code} applied — you save {formatINR(applied.saved)}.{' '}
      <button onClick={() => { onChange(null); setCode('') }} style={{ background: 'none', border: 'none', color, textDecoration: 'underline', fontSize: 13 }}>Remove</button>
    </p>
  )
  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color, fontSize: 14, fontWeight: 600, marginTop: 12, padding: 0 }}>
      Have a coupon code?
    </button>
  )
  return (
    <form onSubmit={apply} style={{ marginTop: 12 }}>
      <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
        <input className="form-input" style={{ flex: 1, minWidth: 0, padding: '9px 12px', textTransform: 'uppercase' }} placeholder="Coupon code"
          value={code} onChange={e => setCode(e.target.value)} aria-label="Coupon code" autoFocus />
        <button className="btn btn-outline btn-sm" disabled={busy} style={dark ? { color: '#fff', borderColor: 'rgba(255,255,255,.4)' } : {}}>{busy ? '…' : 'Apply'}</button>
      </div>
      {error && <p className="form-error" style={{ marginTop: 6 }}>{error}</p>}
    </form>
  )
}
