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
import AdminPage from './pages/AdminPage'
import AllAccessPage from './pages/AllAccessPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import StaticPage from './pages/StaticPage'
import CertificatePage from './pages/CertificatePage'
import VerifyPage from './pages/VerifyPage'

export const AuthContext = createContext(null)

export function useAuth() { return useContext(AuthContext) }

function RequireAuth({ children }) {
  const { user } = useAuth()
  const { pathname, search } = useLocation()
  return user ? children : <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} replace />
}

function RequireAdmin({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lmap_user')) } catch { return null }
  })

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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <ScrollToTop />
      <Navbar />
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
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </AuthContext.Provider>
  )
}
