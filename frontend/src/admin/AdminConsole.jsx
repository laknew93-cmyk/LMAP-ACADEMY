import React, { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Receipt, PhoneCall, BookOpen, TicketPercent, Settings as SettingsIcon, LogOut, ExternalLink, ShieldCheck, Menu } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../App'
import { useSeo } from '../lib/seo'
import { SITE } from '../site'
import { Overview, Students, Sales, Leads, Courses, Coupons, Settings } from '../pages/AdminSections'
import './admin.css'

const SECTIONS = [
  { path: 'overview', label: 'Dashboard', icon: LayoutDashboard, el: Overview, desc: 'Revenue, orders and activity at a glance' },
  { path: 'students', label: 'Students', icon: Users, el: Students, desc: 'Accounts, enrolments, progress and manual access' },
  { path: 'sales', label: 'Sales', icon: Receipt, el: Sales, desc: 'Orders, payments and coupon usage' },
  { path: 'leads', label: 'Leads', icon: PhoneCall, el: Leads, desc: 'Callback requests and enquiries' },
  { path: 'courses', label: 'Courses', icon: BookOpen, el: Courses, desc: 'Titles, pricing and visibility' },
  { path: 'coupons', label: 'Coupons', icon: TicketPercent, el: Coupons, desc: 'Discount codes and usage limits' },
  { path: 'settings', label: 'Settings', icon: SettingsIcon, el: Settings, desc: 'Company details and site-wide options' },
]

function AdminLogin({ base }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      if (data.user.role !== 'admin') { setError('This account does not have admin access.'); return }
      login(data.user, data.token)
      navigate(`${base}/overview`, { replace: true })
    } catch (err) {
      setError(err.response?.status === 401 ? 'Incorrect email or password.' : 'Sign-in failed. Please try again.')
    } finally { setBusy(false) }
  }

  return (
    <div className="ac-login">
      <form onSubmit={submit} className="ac-login-card">
        <div className="ac-brand" style={{ color: 'var(--ac-text)', marginBottom: 24 }}>
          <ShieldCheck size={22} color="var(--ac-accent)" />
          <div><div className="ac-brand-name">{SITE.name}</div><div className="ac-brand-sub" style={{ color: 'var(--ac-muted)' }}>Admin Console</div></div>
        </div>
        <h1>Sign in</h1>
        <p className="ac-muted" style={{ marginBottom: 20 }}>Restricted to authorised administrators.</p>
        <label className="ac-label">Email</label>
        <input className="ac-input" type="email" autoComplete="username" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <label className="ac-label">Password</label>
        <input className="ac-input" type="password" autoComplete="current-password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        {error && <p className="ac-error">{error}</p>}
        <button className="ac-btn ac-btn-primary" disabled={busy} style={{ width: '100%', marginTop: 8 }}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="ac-muted" style={{ fontSize: 12, marginTop: 20, textAlign: 'center' }}>© {new Date().getFullYear()} {SITE.legalName}</p>
      </form>
    </div>
  )
}

export default function AdminConsole({ base = '' }) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [courses, setCourses] = useState([])
  const [toast, setToast] = useState(null)
  const [navOpen, setNavOpen] = useState(false)
  const isAdmin = user?.role === 'admin'
  const current = SECTIONS.find(s => pathname.startsWith(`${base}/${s.path}`)) || SECTIONS[0]
  useSeo({ title: `${current.label} · Admin Console`, noindex: true })

  useEffect(() => {
    document.body.classList.add('ac-body')
    return () => document.body.classList.remove('ac-body')
  }, [])
  useEffect(() => { if (isAdmin) api.get('/admin/courses').then(r => setCourses(r.data)).catch(() => {}) }, [isAdmin])
  useEffect(() => setNavOpen(false), [pathname])

  if (!isAdmin) return <AdminLogin base={base} />

  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }
  const reload = () => api.get('/admin/courses').then(r => setCourses(r.data))
  const props = { courses, notify, reload }
  const siteUrl = window.location.hostname.startsWith('admin.') ? SITE.url : '/'

  return (
    <div className={`ac-shell ${navOpen ? 'ac-nav-open' : ''}`}>
      <aside className="ac-sidebar">
        <div className="ac-brand">
          <ShieldCheck size={20} color="#93C5FD" />
          <div><div className="ac-brand-name">{SITE.name}</div><div className="ac-brand-sub">Admin Console</div></div>
        </div>
        <nav className="ac-nav">
          <div className="ac-nav-heading">Management</div>
          {SECTIONS.map(s => (
            <NavLink key={s.path} to={`${base}/${s.path}`} className={({ isActive }) => `ac-nav-item ${isActive ? 'active' : ''}`}>
              <s.icon size={16} /> {s.label}
            </NavLink>
          ))}
        </nav>
        <div className="ac-sidebar-foot">
          <a href={siteUrl} target="_blank" rel="noreferrer" className="ac-nav-item"><ExternalLink size={16} /> View website</a>
        </div>
      </aside>

      <div className="ac-main">
        <header className="ac-topbar">
          <button className="ac-icon-btn ac-menu-btn" onClick={() => setNavOpen(o => !o)} aria-label="Menu"><Menu size={18} /></button>
          <div className="ac-crumbs"><span className="ac-muted">Admin</span><span className="ac-muted">/</span><strong>{current.label}</strong></div>
          <div className="ac-topbar-right">
            <span className="ac-env">Production</span>
            <span className="ac-user">{user.email}</span>
            <button className="ac-btn ac-btn-ghost" onClick={logout}><LogOut size={14} /> Sign out</button>
          </div>
        </header>

        <main className="ac-content">
          <div className="ac-page-head">
            <h1>{current.label}</h1>
            <p className="ac-muted">{current.desc}</p>
          </div>
          <Routes>
            {SECTIONS.map(s => <Route key={s.path} path={`${s.path}/*`} element={<s.el {...props} />} />)}
            <Route path="*" element={<Navigate to={`${base}/overview`} replace />} />
          </Routes>
        </main>
      </div>
      {toast && <div className={`ac-toast ac-toast-${toast.type}`} role="status">{toast.msg}</div>}
    </div>
  )
}
