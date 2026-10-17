import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import CourseCard from '../components/CourseCard'
import { COURSES, formatINR } from '../lib/content'
import { useSeo } from '../lib/seo'
import { SITE } from '../site'

export default function CoursesPage() {
  useSeo({
    title: 'All AI Courses — ChatGPT, Prompt Engineering, Automation & GenAI',
    description: 'Browse practical AI courses for Indian learners: ChatGPT, prompt engineering, AI freelancing, content, data analysis, no-code agents and Python GenAI.',
    path: '/courses',
  })
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')

  const filtered = useMemo(() => COURSES.filter(c =>
    (level === 'all' || c.level === level) &&
    (!search || `${c.title} ${c.subtitle} ${c.category} ${(c.tools || []).join(' ')}`.toLowerCase().includes(search.toLowerCase()))
  ), [search, level])

  return (
    <div>
      <div className="hero-dark" style={{ padding: '56px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 800, marginBottom: 12 }}>AI courses</h1>
          <p style={{ fontSize: 18, color: '#9CA3AF' }}>Practical, self-paced and built for Indian learners</p>
        </div>
      </div>

      <div className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="row" style={{ gap: 14, marginBottom: 32 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: 42, width: '100%' }} aria-label="Search courses"
                placeholder="Search courses or tools, e.g. Excel, n8n" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="tabs">
              {['all', 'beginner', 'intermediate', 'advanced'].map(l => (
                <button key={l} onClick={() => setLevel(l)} className={`btn btn-sm ${level === l ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>
                  {l === 'all' ? 'All levels' : l}
                </button>
              ))}
            </div>
          </div>

          <Link to="/all-access/" className="card row" style={{ padding: '16px 20px', marginBottom: 28, justifyContent: 'space-between', background: 'var(--primary-light)', borderColor: '#DDD6FE', boxShadow: 'none' }}>
            <span><strong>All-Access Pass:</strong> every paid course for {formatINR(SITE.bundle.price)}</span>
            <span className="row" style={{ gap: 4, color: 'var(--primary)', fontWeight: 600 }}>See what's included <ArrowRight size={16} /></span>
          </Link>

          {filtered.length === 0
            ? <p className="muted" style={{ textAlign: 'center', padding: 60, fontSize: 18 }}>No courses match that search.</p>
            : <div className="grid-3">{filtered.map(c => <CourseCard key={c.slug} course={c} />)}</div>}
        </div>
      </div>
    </div>
  )
}
