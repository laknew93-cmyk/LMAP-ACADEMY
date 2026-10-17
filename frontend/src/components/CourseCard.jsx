import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, BookOpen, ArrowRight } from 'lucide-react'
import { formatINR, discountPct } from '../lib/content'

const GRADIENTS = {
  'AI Fundamentals': 'linear-gradient(135deg, #6D28D9 0%, #DB2777 100%)',
  'Prompt Engineering': 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
  'AI for Business': 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)',
  'AI for Marketing': 'linear-gradient(135deg, #DB2777 0%, #F59E0B 100%)',
  'AI for Data': 'linear-gradient(135deg, #059669 0%, #0EA5E9 100%)',
  'AI Automation': 'linear-gradient(135deg, #0F766E 0%, #6D28D9 100%)',
  'Generative AI Engineering': 'linear-gradient(135deg, #111827 0%, #7C3AED 100%)',
}

export function CourseThumb({ course, compact = false }) {
  return (
    <div className="thumb" style={{ background: GRADIENTS[course.category] || GRADIENTS['AI Fundamentals'] }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,.18)', padding: '4px 10px', borderRadius: 99 }}>{course.category}</span>
        <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize', opacity: .9 }}>{course.level}</span>
      </div>
      {!compact && <div className="thumb-title">{course.title.split(':')[0]}</div>}
    </div>
  )
}

export default function CourseCard({ course }) {
  const off = discountPct(course)
  return (
    <Link to={`/courses/${course.slug}`} className="card" style={{ display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <CourseThumb course={course} />
      <div style={{ padding: '18px 20px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{course.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>{course.subtitle}</p>
        <div className="row muted" style={{ gap: 16, marginTop: 14, fontSize: 13 }}>
          <span className="row" style={{ gap: 4 }}><Clock size={14} /> {course.duration_hours} hours</span>
          <span className="row" style={{ gap: 4 }}><BookOpen size={14} /> {course.lesson_count} lessons</span>
        </div>
      </div>
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="row" style={{ gap: 8 }}>
          <span className="price" style={{ fontSize: 22 }}>{course.price ? formatINR(course.price) : 'Free'}</span>
          {off > 0 && <span className="mrp" style={{ fontSize: 14 }}>{formatINR(course.mrp)}</span>}
          {off > 0 && <span className="off">{off}% off</span>}
        </span>
        <span className="row" style={{ gap: 4, color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>View <ArrowRight size={14} /></span>
      </div>
    </Link>
  )
}
