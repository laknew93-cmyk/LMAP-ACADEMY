import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { COURSES } from '../lib/content'
import { SITE } from '../site'

const col = { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }
const head = { color: '#fff', fontWeight: 600, marginBottom: 12 }

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark)', color: '#9CA3AF', padding: '56px 0 24px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 36, marginBottom: 40 }}>
          <div>
            <div className="row" style={{ gap: 10, color: '#fff', marginBottom: 12 }}>
              <GraduationCap size={24} /><span style={{ fontSize: 20, fontWeight: 700 }}>{SITE.name}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>Practical AI courses for professionals, students, career returners, freelancers and developers in India.</p>
            <p style={{ fontSize: 14, marginTop: 12 }}><a href={`mailto:${SITE.email}`} style={{ color: '#C4B5FD' }}>{SITE.email}</a></p>
          </div>
          <div style={col}>
            <p style={head}>Courses</p>
            {COURSES.slice(0, 7).map(c => <Link key={c.slug} to={`/courses/${c.slug}/`}>{c.title.split(':')[0]}</Link>)}
            <Link to="/all-access/">All-Access Pass</Link>
          </div>
          <div style={col}>
            <p style={head}>Learn</p>
            <Link to="/blog/">Blog</Link>
            <Link to="/courses/">All courses</Link>
            <Link to="/dashboard">My learning</Link>
          </div>
          <div style={col}>
            <p style={head}>Company</p>
            <Link to="/about/">About us</Link>
            <Link to="/contact/">Contact us</Link>
            <Link to="/terms/">Terms & conditions</Link>
            <Link to="/privacy-policy/">Privacy policy</Link>
            <Link to="/refund-policy/">Refund & cancellation</Link>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #374151', paddingTop: 24, textAlign: 'center', fontSize: 13 }}>
          © {new Date().getFullYear()} {SITE.legalName}. All prices in INR and inclusive of applicable taxes. Payments secured by Razorpay.
        </div>
      </div>
    </footer>
  )
}
