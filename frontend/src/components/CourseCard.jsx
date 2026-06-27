import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, BarChart2, ArrowRight } from 'lucide-react'

const LEVEL_COLORS = {
  beginner: { bg: '#D1FAE5', color: '#065F46' },
  intermediate: { bg: '#FEF3C7', color: '#92400E' },
  advanced: { bg: '#FEE2E2', color: '#991B1B' },
}

const PLACEHOLDERS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

export default function CourseCard({ course }) {
  const lvl = LEVEL_COLORS[course.level] || LEVEL_COLORS.beginner
  const bg = PLACEHOLDERS[course.id % PLACEHOLDERS.length]

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ height: 180, background: course.thumbnail ? `url(${course.thumbnail}) center/cover` : bg, position: 'relative' }}>
        <span style={{ position: 'absolute', top: 12, left: 12, background: lvl.bg, color: lvl.color, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
          {course.level}
        </span>
      </div>
      <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{course.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>{course.short_description}</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {course.duration_hours}h</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BarChart2 size={14} /> {course.modules?.length || 0} modules</span>
        </div>
      </div>
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>₹{course.price.toLocaleString('en-IN')}</span>
        <Link to={`/courses/${course.slug}`} className="btn btn-primary btn-sm">
          View Course <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
