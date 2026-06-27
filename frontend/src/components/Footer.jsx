import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark)', color: '#9CA3AF', padding: '48px 0 24px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', marginBottom: 12 }}>
              <GraduationCap size={24} />
              <span style={{ fontSize: 20, fontWeight: 700 }}>LMAP Academy</span>
            </div>
            <p style={{ maxWidth: 300, fontSize: 14, lineHeight: 1.7 }}>
              Empowering women and professionals to build AI-powered careers with practical, industry-ready skills.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>Courses</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <Link to="/courses" style={{ color: '#9CA3AF' }}>All Courses</Link>
                <Link to="/courses" style={{ color: '#9CA3AF' }}>AI Foundations</Link>
                <Link to="/courses" style={{ color: '#9CA3AF' }}>No-Code Building</Link>
              </div>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>Company</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <a href="#" style={{ color: '#9CA3AF' }}>About Us</a>
                <a href="#" style={{ color: '#9CA3AF' }}>Contact</a>
                <a href="#" style={{ color: '#9CA3AF' }}>Refund Policy</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #374151', paddingTop: 24, textAlign: 'center', fontSize: 13 }}>
          © {new Date().getFullYear()} LMAP Academy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
