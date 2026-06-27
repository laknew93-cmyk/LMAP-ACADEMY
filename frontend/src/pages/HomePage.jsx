import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Clock, Users, Star, ArrowRight, CheckCircle, Zap, Brain, TrendingUp, Code2 } from 'lucide-react'
import api from '../api/client'
import CourseCard from '../components/CourseCard'

const STATS = [
  { label: 'Women Enrolled', value: '2,400+' },
  { label: 'Hours of Content', value: '120+' },
  { label: 'AI Tools Covered', value: '40+' },
  { label: 'Success Rate', value: '94%' },
]

const WHY = [
  { icon: Brain, title: 'AI-First Curriculum', desc: 'Every course is built around the latest AI tools that employers and clients actually want in 2025.' },
  { icon: Zap, title: 'Career-Ready Skills', desc: 'Not theory. Real projects, real tools, real outcomes — freelancing, jobs, or your own business.' },
  { icon: TrendingUp, title: 'Designed for Re-entry', desc: 'Structured for women returning after a career gap. Pace yourself, learn on your schedule.' },
  { icon: Code2, title: 'No Coding Required', desc: 'All courses are designed for non-technical learners. If you can use a phone, you can do this.' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'MBA grad, now AI Freelancer', text: 'LMAP helped me go from "what is ChatGPT?" to landing my first ₹80k/month freelance client in 3 months.', rating: 5 },
  { name: 'Anita Verma', role: 'Former Teacher, now Content Strategist', text: 'I had a 6-year career gap. This course gave me the confidence and skills to re-enter the workforce with AI skills no one else had.', rating: 5 },
  { name: 'Deepika Nair', role: 'BCom Graduate', text: 'The no-code AI building course is incredible. I built my first product and sold it — all within 4 months of enrollment.', rating: 5 },
]

export default function HomePage() {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    api.get('/courses/').then(r => setCourses(r.data.slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)', color: '#fff', padding: '100px 0 80px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div className="badge badge-purple" style={{ marginBottom: 20 }}>
              <Sparkles size={14} style={{ marginRight: 6 }} /> AI-Powered Learning Platform
            </div>
            <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
              Your Degree +<br />
              <span style={{ color: '#A78BFA' }}>AI Skills</span> =<br />
              Unstoppable Career
            </h1>
            <p style={{ fontSize: 18, color: '#D1D5DB', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Built for women who have the education but need the current skills.
              Master AI tools that companies are hiring for right now.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/courses" className="btn btn-primary btn-lg">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                Start Free Today
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
              {['Lifetime Access', 'Certificate Included', '30-Day Refund'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#9CA3AF' }}>
                  <CheckCircle size={16} color="#10B981" /> {f}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#A78BFA' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why LMAP */}
      <section className="section" style={{ background: '#FAFAFA' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="section-title">Why LMAP Academy?</h2>
            <p className="section-subtitle">Not just courses — a complete career transformation system</p>
          </div>
          <div className="grid-2">
            {WHY.map(w => (
              <div key={w.title} style={{ display: 'flex', gap: 20, padding: 28, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <w.icon size={24} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{w.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6 }}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <div>
                <h2 className="section-title">Featured Courses</h2>
                <p className="section-subtitle" style={{ marginTop: 8 }}>Start your AI journey today</p>
              </div>
              <Link to="/courses" className="btn btn-outline">View All <ArrowRight size={16} /></Link>
            </div>
            <div className="grid-3">
              {courses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="section" style={{ background: 'var(--dark)', color: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="section-title">Real Women, Real Results</h2>
            <p style={{ color: '#9CA3AF', marginTop: 12, fontSize: 18 }}>Join thousands who transformed their careers with LMAP</p>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {Array(t.rating).fill(0).map((_, i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ color: '#E5E7EB', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: '80px 0', textAlign: 'center', color: '#fff' }}>
        <div className="container">
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Ready to Start Your AI Career?</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 36 }}>Join 2,400+ learners already transforming their futures</p>
          <Link to="/register" className="btn btn-accent btn-lg">
            Enroll Now — ₹10,000 per course <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
