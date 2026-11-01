import React, { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LearnPage from './pages/LearnPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AdminConsole from './admin/AdminConsole'
import AllAccessPage from './pages/AllAccessPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import StaticPage from './pages/StaticPage'
import CertificatePage from './pages/CertificatePage'
import VerifyPage from './pages/VerifyPage'
import api from './api/client'
import { applyLive } from './lib/content'
import { SITE } from './site'

export const AuthContext = createContext(null)

export function useAuth() { return useContext(AuthContext) }

function RequireAuth({ children }) {
  const { user } = useAuth()
  const { pathname, search } = useLocation()
  return user ? children : <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} replace />
}


function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const host = window.location.hostname
const IS_ADMIN_HOST = host === SITE.adminHost || host.startsWith('admin.')
const IS_PUBLIC_PROD = host === new URL(SITE.url).hostname || host === 'www.' + new URL(SITE.url).hostname

// lmapacademy.org/admin → admin.lmapacademy.org (keeps the sub-path, e.g. /admin/leads → /leads)
function AdminRedirect() {
  const { pathname } = useLocation()
  useEffect(() => { window.location.replace(`https://${SITE.adminHost}${pathname.replace(/^\/admin/, '') || '/'}`) }, [])
  return null
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lmap_user')) } catch { return null }
  })

  // Pull live prices and business details set in the admin panel, then re-render once.
  const [, setLiveVersion] = useState(0)
  useEffect(() => {
    Promise.allSettled([api.get('/courses/'), api.get('/site/settings')]).then(([c, s]) => {
      applyLive(c.value?.data, s.value?.data, SITE)
      setLiveVersion(v => v + 1)
    })
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('lmap_token', token)
    localStorage.setItem('lmap_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('lmap_token')
    localStorage.removeItem('lmap_user')
    setUser(null)
  }

  const { pathname } = useLocation()
  const inConsole = IS_ADMIN_HOST || pathname.startsWith('/admin')

  if (IS_ADMIN_HOST) {
    return (
      <AuthContext.Provider value={{ user, login, logout }}>
        <Routes><Route path="/*" element={<AdminConsole base="" />} /></Routes>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <ScrollToTop />
      {!inConsole && SITE.announcement && <div style={{ background: 'var(--accent)', color: 'var(--dark)', textAlign: 'center', padding: '8px 16px', fontSize: 14, fontWeight: 600 }}>{SITE.announcement}</div>}
      {!inConsole && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/learn/:slug" element={<LearnPage />} />
        <Route path="/all-access" element={<AllAccessPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/certificate/:slug" element={<RequireAuth><CertificatePage /></RequireAuth>} />
        <Route path="/verify/:code" element={<VerifyPage />} />
        {['about', 'contact', 'terms', 'privacy-policy', 'refund-policy'].map(p => (
          <Route key={p} path={`/${p}`} element={<StaticPage name={p} />} />
        ))}
        <Route path="/admin/*" element={IS_PUBLIC_PROD ? <AdminRedirect /> : <AdminConsole base="/admin" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!inConsole && <Footer />}
    </AuthContext.Provider>
  )
}
