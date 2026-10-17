import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { GraduationCap, Menu, X, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <GraduationCap size={28} />
          <span>LMAP <strong>Academy</strong></span>
        </Link>

        <div className={`navbar-links ${open ? 'open' : ''}`}>
          <Link to="/courses/" onClick={() => setOpen(false)}>Courses</Link>
          <Link to="/all-access/" onClick={() => setOpen(false)}>All-Access</Link>
          <Link to="/blog/" onClick={() => setOpen(false)}>Blog</Link>
          {user && <Link to="/dashboard" onClick={() => setOpen(false)}>My Learning</Link>}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
          {user
            ? <button className="mobile-only btn btn-ghost btn-sm" style={{ padding: 0 }} onClick={() => { setOpen(false); handleLogout() }}>Logout</button>
            : <Link className="mobile-only" to="/login" onClick={() => setOpen(false)}>Login</Link>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <span className="navbar-user-name">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-ghost btn-sm desktop-only" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm desktop-only">Login</Link>
              <Link to="/courses/ai-in-60-minutes/" className="btn btn-primary btn-sm">Start free</Link>
            </>
          )}
          <button className="navbar-toggle" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
