import React, { useEffect, useMemo, useState } from 'react'
import { Users, IndianRupee, ShoppingBag, PhoneCall, Award, Download, RefreshCw } from 'lucide-react'
import api from '../api/client'
import { formatINR } from '../lib/content'
import { useSeo } from '../lib/seo'

const TABS = ['overview', 'students', 'sales', 'leads', 'courses', 'coupons', 'settings']
const date = iso => (iso ? new Date(iso + (iso.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '')
const errText = e => e.response?.data?.detail || e.message || 'Something went wrong'

function Stat({ icon: Icon, label, value, color = 'var(--primary)' }) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'none' }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div><div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div><div className="muted" style={{ fontSize: 13 }}>{label}</div></div>
    </div>
  )
}

function Table({ cols, rows, empty = 'Nothing here yet.' }) {
  if (!rows.length) return <p className="muted" style={{ padding: 24 }}>{empty}</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="admin-table">
        <thead><tr>{cols.map(c => <th key={c.label}>{c.label}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={r.id ?? i}>{cols.map(c => <td key={c.label}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

async function download(kind) {
  const res = await api.get(`/admin/export/${kind}`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = Object.assign(document.createElement('a'), { href: url, download: `lmap-${kind}-${new Date().toISOString().slice(0, 10)}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}

function Toolbar({ children, exportKind, onRefresh }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
      <div className="row">{children}</div>
      <div className="row">
        {onRefresh && <button className="btn btn-ghost btn-sm" onClick={onRefresh}><RefreshCw size={14} /> Refresh</button>}
        {exportKind && <button className="btn btn-outline btn-sm" onClick={() => download(exportKind)}><Download size={14} /> Export to Excel</button>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- tabs

function Overview() {
  const [d, setD] = useState(null)
  useEffect(() => { api.get('/admin/overview').then(r => setD(r.data)) }, [])
  if (!d) return <div className="spinner" />
  return (
    <div className="stack" style={{ gap: 28 }}>
      <div className="grid-3" style={{ gap: 16 }}>
        <Stat icon={IndianRupee} label="Total revenue" value={formatINR(d.revenue)} />
        <Stat icon={IndianRupee} label="Revenue, last 30 days" value={formatINR(d.revenue_30d)} />
        <Stat icon={ShoppingBag} label="Paid orders" value={d.orders} />
        <Stat icon={Users} label={`Registered users · ${d.paying_students} paying`} value={d.users} />
        <Stat icon={PhoneCall} label="New leads to call" value={d.new_leads} color="#D97706" />
        <Stat icon={Award} label="Certificates issued" value={d.certificates} color="#059669" />
      </div>
      <div className="grid-2" style={{ gap: 24 }}>
        <div className="card" style={{ boxShadow: 'none' }}>
          <h3 style={{ padding: '16px 18px 0', fontSize: 17 }}>Enrolments by course</h3>
          <Table cols={[{ label: 'Course', key: 'course' }, { label: 'Students', key: 'students' }, { label: 'Revenue', render: r => formatINR(r.revenue) }]} rows={d.by_course} />
        </div>
        <div className="card" style={{ boxShadow: 'none' }}>
          <h3 style={{ padding: '16px 18px 0', fontSize: 17 }}>Recent sales</h3>
          <Table cols={[{ label: 'Date', render: r => date(r.date) }, { label: 'Student', key: 'student' }, { label: 'Amount', render: r => formatINR(r.amount) }]} rows={d.recent_sales} empty="No sales yet." />
        </div>
      </div>
    </div>
  )
}

function Students({ courses, notify }) {
  const [rows, setRows] = useState(null)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [grant, setGrant] = useState({ email: '', course_slug: '', amount: '', note: '' })
  const load = () => api.get('/admin/students').then(r => setRows(r.data))
  useEffect(() => { load() }, [])
  const filtered = useMemo(() => (rows || []).filter(s => `${s.name} ${s.email} ${s.phone}`.toLowerCase().includes(q.toLowerCase())), [rows, q])

  const enroll = async e => {
    e.preventDefault()
    try {
      const bundle = grant.course_slug === 'all-access'
      const r = await api.post('/admin/enroll', { email: grant.email, bundle, course_slug: bundle ? null : grant.course_slug, amount: Number(grant.amount || 0), note: grant.note })
      notify(`Enrolled ${r.data.student} in ${r.data.enrolled.length} course(s)`)
      setGrant({ email: '', course_slug: '', amount: '', note: '' }); load()
    } catch (err) { notify(errText(err), 'error') }
  }
  const revoke = async (email, slug) => {
    if (!window.confirm('Remove this student\'s access to the course (e.g. after a refund)?')) return
    try { await api.post('/admin/revoke', { email, course_slug: slug }); notify('Access removed'); load() } catch (err) { notify(errText(err), 'error') }
  }

  if (!rows) return <div className="spinner" />
  return (
    <div className="stack" style={{ gap: 24 }}>
      <form onSubmit={enroll} className="card" style={{ padding: 18, boxShadow: 'none', background: '#FAFAFA' }}>
        <strong>Enrol a student manually</strong> <span className="muted" style={{ fontSize: 13 }}>— after a UPI / bank transfer, or as a gift. The student must have registered first.</span>
        <div className="row" style={{ marginTop: 12 }}>
          <input className="form-input" style={{ flex: '2 1 200px' }} type="email" placeholder="Student email" required value={grant.email} onChange={e => setGrant(g => ({ ...g, email: e.target.value }))} />
          <select className="form-input" style={{ flex: '2 1 200px' }} required value={grant.course_slug} onChange={e => setGrant(g => ({ ...g, course_slug: e.target.value }))}>
            <option value="">Choose course…</option>
            {courses.map(c => <option key={c.slug} value={c.slug}>{c.title.split(':')[0]}</option>)}
            <option value="all-access">All-Access (every paid course)</option>
          </select>
          <input className="form-input" style={{ flex: '1 1 110px' }} type="number" min="0" placeholder="Amount ₹" value={grant.amount} onChange={e => setGrant(g => ({ ...g, amount: e.target.value }))} />
          <input className="form-input" style={{ flex: '2 1 160px' }} placeholder="Note (e.g. UPI ref)" value={grant.note} onChange={e => setGrant(g => ({ ...g, note: e.target.value }))} />
          <button className="btn btn-primary btn-sm">Enrol</button>
        </div>
      </form>

      <Toolbar exportKind="students" onRefresh={load}>
        <input className="form-input" style={{ minWidth: 260 }} placeholder="Search name, email or phone" value={q} onChange={e => setQ(e.target.value)} />
        <span className="muted" style={{ fontSize: 14 }}>{filtered.length} students</span>
      </Toolbar>
      <div className="card" style={{ boxShadow: 'none' }}>
        <Table rows={filtered} cols={[
          { label: 'Name', render: s => <button onClick={() => setOpen(open === s.id ? null : s.id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, padding: 0, textAlign: 'left' }}>{s.name}{s.role === 'admin' ? ' (admin)' : ''}</button> },
          { label: 'Email', key: 'email' },
          { label: 'Phone', render: s => s.phone ? <a href={`tel:${s.phone}`}>{s.phone}</a> : '—' },
          { label: 'Joined', render: s => date(s.joined) },
          { label: 'Courses', render: s => open === s.id
            ? <div className="stack" style={{ gap: 6 }}>{s.courses.map(c => (
                <div key={c.slug} style={{ fontSize: 13 }}>
                  <strong>{c.title.split(':')[0]}</strong> · {c.percent}% · {c.source}{c.amount ? ` · ${formatINR(c.amount)}` : ''}{c.certificate ? ` · cert ${c.certificate}` : ''}{' '}
                  <button onClick={() => revoke(s.email, c.slug)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: 12, padding: 0 }}>remove</button>
                </div>))}{!s.courses.length && <span className="muted">None</span>}</div>
            : `${s.courses.length} ${s.courses.length === 1 ? 'course' : 'courses'}` },
          { label: 'Paid', render: s => formatINR(s.total_paid) },
        ]} empty="No students yet." />
      </div>
    </div>
  )
}

function Sales() {
  const [rows, setRows] = useState(null)
  const load = () => api.get('/admin/sales').then(r => setRows(r.data))
  useEffect(() => { load() }, [])
  if (!rows) return <div className="spinner" />
  const paid = rows.filter(r => r.amount > 0)
  return (
    <>
      <Toolbar exportKind="sales" onRefresh={load}>
        <span className="muted" style={{ fontSize: 14 }}>{paid.length} paid orders · {formatINR(paid.reduce((s, r) => s + r.amount, 0))} · plus {rows.length - paid.length} free enrolments</span>
      </Toolbar>
      <div className="card" style={{ boxShadow: 'none' }}>
        <Table rows={rows} cols={[
          { label: 'Date', render: r => date(r.date) },
          { label: 'Student', render: r => <>{r.student}<div className="muted" style={{ fontSize: 12 }}>{r.email}{r.phone ? ` · ${r.phone}` : ''}</div></> },
          { label: 'Courses', key: 'courses' },
          { label: 'Type', key: 'type' },
          { label: 'Amount', render: r => r.amount ? formatINR(r.amount) : 'Free' },
          { label: 'Coupon', key: 'coupon' },
          { label: 'Payment ID', render: r => <code style={{ fontSize: 12 }}>{r.payment_id || r.note || '—'}</code> },
        ]} empty="No sales yet." />
      </div>
    </>
  )
}

const LEAD_STATUSES = ['new', 'contacted', 'converted', 'closed']
function Leads({ notify }) {
  const [rows, setRows] = useState(null)
  const [filter, setFilter] = useState('all')
  const load = () => api.get('/admin/leads').then(r => setRows(r.data))
  useEffect(() => { load() }, [])
  const update = async (id, patch) => {
    try { await api.patch(`/admin/leads/${id}`, patch); setRows(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r)) } catch (err) { notify(errText(err), 'error') }
  }
  const remove = async id => {
    if (!window.confirm('Delete this lead permanently?')) return
    await api.delete(`/admin/leads/${id}`); setRows(rs => rs.filter(r => r.id !== id))
  }
  if (!rows) return <div className="spinner" />
  const shown = rows.filter(r => filter === 'all' || r.status === filter)
  return (
    <>
      <Toolbar exportKind="leads" onRefresh={load}>
        <div className="tabs">{['all', ...LEAD_STATUSES].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }} onClick={() => setFilter(s)}>
            {s} ({s === 'all' ? rows.length : rows.filter(r => r.status === s).length})
          </button>))}</div>
      </Toolbar>
      <div className="card" style={{ boxShadow: 'none' }}>
        <Table rows={shown} cols={[
          { label: 'Date', render: r => date(r.created_at) },
          { label: 'Name', key: 'name' },
          { label: 'Contact', render: r => <>{r.phone && <a href={`tel:${r.phone}`}>{r.phone}</a>}{r.phone && <> · <a href={`https://wa.me/${(r.phone.replace(/\D/g, '').length === 10 ? '91' : '') + r.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp</a></>}<div className="muted" style={{ fontSize: 12 }}>{r.email}</div></> },
          { label: 'Interest', render: r => <>{r.interest}{r.message && <div className="muted" style={{ fontSize: 12, maxWidth: 260 }}>{r.message}</div>}</> },
          { label: 'Status', render: r => (
            <select className="form-input" style={{ padding: '6px 8px', fontSize: 13 }} value={r.status} onChange={e => update(r.id, { status: e.target.value })}>
              {LEAD_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>) },
          { label: 'Notes', render: r => <input className="form-input" style={{ padding: '6px 8px', fontSize: 13, minWidth: 160 }} defaultValue={r.notes} placeholder="Add a note"
              onBlur={e => e.target.value !== r.notes && update(r.id, { notes: e.target.value })} /> },
          { label: '', render: r => <button onClick={() => remove(r.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: 13 }}>Delete</button> },
        ]} empty="No enquiries yet. They arrive from the callback form on the home and contact pages." />
      </div>
    </>
  )
}

function Courses({ notify, reload }) {
  const [rows, setRows] = useState(null)
  const [edit, setEdit] = useState({})
  const load = () => api.get('/admin/courses').then(r => setRows(r.data))
  useEffect(() => { load() }, [])
  const save = async slug => {
    const e = edit[slug]
    try {
      await api.patch(`/admin/courses/${slug}`, { title: e.title, subtitle: e.subtitle, price: Number(e.price), mrp: e.mrp === '' ? null : Number(e.mrp) })
      notify('Course updated — live on the site now'); setEdit(x => ({ ...x, [slug]: undefined })); load(); reload()
    } catch (err) { notify(errText(err), 'error') }
  }
  const toggle = async c => {
    await api.patch(`/admin/courses/${c.slug}`, { is_published: !c.is_published })
    notify(c.is_published ? 'Course hidden from the site' : 'Course published'); load(); reload()
  }
  if (!rows) return <div className="spinner" />
  return (
    <div className="stack">
      <p className="muted" style={{ fontSize: 14 }}>Edits here go live immediately and survive redeploys. Lesson content is managed in the course files.</p>
      {rows.map(c => {
        const e = edit[c.slug]
        return (
          <div key={c.slug} className="card" style={{ padding: 18, boxShadow: 'none', opacity: c.is_published ? 1 : 0.6 }}>
            {e ? (
              <div className="stack">
                <input className="form-input" value={e.title} onChange={ev => setEdit(x => ({ ...x, [c.slug]: { ...e, title: ev.target.value } }))} aria-label="Title" />
                <textarea className="form-input" rows={2} value={e.subtitle} onChange={ev => setEdit(x => ({ ...x, [c.slug]: { ...e, subtitle: ev.target.value } }))} aria-label="Subtitle" />
                <div className="row">
                  <label className="row" style={{ gap: 6 }}>Price ₹ <input className="form-input" type="number" min="0" style={{ width: 120 }} value={e.price} onChange={ev => setEdit(x => ({ ...x, [c.slug]: { ...e, price: ev.target.value } }))} /></label>
                  <label className="row" style={{ gap: 6 }}>MRP ₹ <input className="form-input" type="number" min="0" style={{ width: 120 }} value={e.mrp ?? ''} onChange={ev => setEdit(x => ({ ...x, [c.slug]: { ...e, mrp: ev.target.value } }))} /></label>
                  <button className="btn btn-primary btn-sm" onClick={() => save(c.slug)}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEdit(x => ({ ...x, [c.slug]: undefined }))}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{c.title}</strong> {!c.is_published && <span className="pill">Hidden</span>} {c.edited && <span className="pill" style={{ background: 'var(--accent-light)', color: '#92400E' }}>Edited</span>}
                  <div className="muted" style={{ fontSize: 14 }}>{c.category} · {c.lessons} lessons · {c.students} students · {formatINR(c.revenue)} revenue</div>
                </div>
                <div className="row">
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{c.price ? formatINR(c.price) : 'Free'}</span>
                  {c.mrp ? <span className="mrp" style={{ fontSize: 13 }}>{formatINR(c.mrp)}</span> : null}
                  <button className="btn btn-outline btn-sm" onClick={() => setEdit(x => ({ ...x, [c.slug]: { title: c.title, subtitle: c.subtitle, price: c.price, mrp: c.mrp } }))}>Edit</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggle(c)}>{c.is_published ? 'Hide' : 'Publish'}</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Coupons({ courses, notify }) {
  const [rows, setRows] = useState(null)
  const blank = { code: '', type: 'percent', value: '', course_slug: '', max_uses: '', expires_at: '' }
  const [f, setF] = useState(blank)
  const load = () => api.get('/admin/coupons').then(r => setRows(r.data))
  useEffect(() => { load() }, [])
  const create = async e => {
    e.preventDefault()
    try {
      await api.post('/admin/coupons', {
        code: f.code, course_slug: f.course_slug || null,
        percent_off: f.type === 'percent' ? Number(f.value) : null, amount_off: f.type === 'amount' ? Number(f.value) : null,
        max_uses: f.max_uses ? Number(f.max_uses) : null, expires_at: f.expires_at ? `${f.expires_at}T23:59:59` : null,
      })
      notify(`Coupon ${f.code.toUpperCase()} created`); setF(blank); load()
    } catch (err) { notify(errText(err), 'error') }
  }
  const toggle = async c => { await api.patch(`/admin/coupons/${c.id}`, { is_active: !c.is_active }); load() }
  const remove = async c => { if (window.confirm(`Delete coupon ${c.code}?`)) { await api.delete(`/admin/coupons/${c.id}`); load() } }
  const target = slug => slug === 'all-access' ? 'All-Access' : slug ? (courses.find(c => c.slug === slug)?.title.split(':')[0] || slug) : 'Any course'
  if (!rows) return <div className="spinner" />
  return (
    <div className="stack" style={{ gap: 24 }}>
      <form onSubmit={create} className="card" style={{ padding: 18, boxShadow: 'none', background: '#FAFAFA' }}>
        <strong>New coupon</strong>
        <div className="row" style={{ marginTop: 12 }}>
          <input className="form-input" style={{ flex: '1 1 140px', textTransform: 'uppercase' }} placeholder="Code e.g. DIWALI30" required value={f.code} onChange={e => setF({ ...f, code: e.target.value })} />
          <select className="form-input" style={{ flex: '0 1 130px' }} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
            <option value="percent">% off</option><option value="amount">₹ off</option>
          </select>
          <input className="form-input" style={{ flex: '0 1 110px' }} type="number" min="1" placeholder={f.type === 'percent' ? '30' : '500'} required value={f.value} onChange={e => setF({ ...f, value: e.target.value })} />
          <select className="form-input" style={{ flex: '1 1 180px' }} value={f.course_slug} onChange={e => setF({ ...f, course_slug: e.target.value })}>
            <option value="">Any course</option>
            {courses.filter(c => c.price > 0).map(c => <option key={c.slug} value={c.slug}>{c.title.split(':')[0]}</option>)}
            <option value="all-access">All-Access Pass</option>
          </select>
          <input className="form-input" style={{ flex: '0 1 120px' }} type="number" min="1" placeholder="Max uses" value={f.max_uses} onChange={e => setF({ ...f, max_uses: e.target.value })} />
          <label className="row muted" style={{ gap: 6, fontSize: 13 }}>Expires <input className="form-input" type="date" value={f.expires_at} onChange={e => setF({ ...f, expires_at: e.target.value })} /></label>
          <button className="btn btn-primary btn-sm">Create</button>
        </div>
      </form>
      <div className="card" style={{ boxShadow: 'none' }}>
        <Table rows={rows} cols={[
          { label: 'Code', render: c => <code style={{ fontWeight: 700 }}>{c.code}</code> },
          { label: 'Discount', render: c => c.percent_off ? `${c.percent_off}% off` : `${formatINR(c.amount_off)} off` },
          { label: 'Applies to', render: c => target(c.course_slug) },
          { label: 'Used', render: c => `${c.used_count}${c.max_uses ? ` / ${c.max_uses}` : ''}` },
          { label: 'Expires', render: c => date(c.expires_at) || 'Never' },
          { label: 'Status', render: c => <button className={`btn btn-sm ${c.is_active ? 'btn-outline' : 'btn-ghost'}`} onClick={() => toggle(c)}>{c.is_active ? 'Active' : 'Paused'}</button> },
          { label: '', render: c => <button onClick={() => remove(c)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: 13 }}>Delete</button> },
        ]} empty="No coupons yet." />
      </div>
    </div>
  )
}

const SETTING_FIELDS = [
  ['brand_name', 'Brand name'], ['legal_name', 'Registered company name'], ['support_email', 'Support email'],
  ['phone', 'Phone'], ['whatsapp', 'WhatsApp number'], ['address', 'Registered office address', 'textarea'],
  ['gstin', 'GSTIN'], ['bundle_price', 'All-Access Pass price (₹)', 'number'], ['refund_days', 'Refund window (days)', 'number'],
  ['announcement', 'Announcement bar (leave empty to hide), e.g. "Diwali offer: 30% off with code DIWALI30"', 'textarea'],
]
function Settings({ notify, reload }) {
  const [s, setS] = useState(null)
  useEffect(() => { api.get('/admin/settings').then(r => setS(r.data)) }, [])
  const save = async e => {
    e.preventDefault()
    try { setS((await api.put('/admin/settings', s)).data); notify('Settings saved — live on the site now'); reload() } catch (err) { notify(errText(err), 'error') }
  }
  if (!s) return <div className="spinner" />
  return (
    <form onSubmit={save} className="card" style={{ padding: 24, boxShadow: 'none', maxWidth: 720 }}>
      <div className="stack" style={{ gap: 16 }}>
        {SETTING_FIELDS.map(([key, label, type]) => (
          <div key={key} className="form-group">
            <label className="form-label">{label}</label>
            {type === 'textarea'
              ? <textarea className="form-input" rows={2} value={s[key] ?? ''} onChange={e => setS({ ...s, [key]: e.target.value })} />
              : <input className="form-input" type={type || 'text'} value={s[key] ?? ''} onChange={e => setS({ ...s, [key]: e.target.value })} />}
          </div>
        ))}
        <div><button className="btn btn-primary">Save settings</button></div>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------- page

export default function AdminPage() {
  useSeo({ title: 'Admin', path: '/admin', noindex: true })
  const [tab, setTab] = useState(() => (TABS.includes(window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'overview'))
  const [courses, setCourses] = useState([])
  const [toast, setToast] = useState(null)
  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }
  const loadCourses = () => api.get('/admin/courses').then(r => setCourses(r.data))
  useEffect(() => { loadCourses() }, [])
  const go = t => { setTab(t); window.history.replaceState(null, '', `#${t}`) }
  const props = { courses, notify, reload: loadCourses }

  return (
    <div className="section" style={{ paddingTop: 36 }}>
      <div className="container">
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 18 }}>Admin panel</h1>
        <div className="tabs" style={{ marginBottom: 24, background: 'var(--border)', padding: 4, borderRadius: 10, display: 'inline-flex' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => go(t)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, textTransform: 'capitalize', background: tab === t ? '#fff' : 'transparent', color: tab === t ? 'var(--primary)' : 'var(--text-muted)' }}>{t}</button>
          ))}
        </div>
        {tab === 'overview' && <Overview />}
        {tab === 'students' && <Students {...props} />}
        {tab === 'sales' && <Sales />}
        {tab === 'leads' && <Leads {...props} />}
        {tab === 'courses' && <Courses {...props} />}
        {tab === 'coupons' && <Coupons {...props} />}
        {tab === 'settings' && <Settings {...props} />}
      </div>
      {toast && <div className={`toast toast-${toast.type}`} role="status">{toast.msg}</div>}
    </div>
  )
}
