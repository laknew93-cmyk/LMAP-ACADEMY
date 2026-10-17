import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, BookOpen, Award } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../App'
import { CourseThumb } from '../components/CourseCard'
import { findCourse } from '../lib/content'
import { useSeo } from '../lib/seo'

export default function DashboardPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  useSeo({ title: 'My learning', path: '/dashboard', noindex: true })

  useEffect(() => {
    api.get('/payments/my-courses').then(r => setCourses(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="section">
      <div className="container">
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>My learning</h1>
        <p className="muted" style={{ marginTop: 6, marginBottom: 36 }}>Welcome back, {user?.name}!</p>

        {loading ? <div className="spinner" /> : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <BookOpen size={56} color="var(--border)" />
            <h2 style={{ fontSize: 22, margin: '14px 0 8px' }}>No courses yet</h2>
            <p className="muted" style={{ marginBottom: 24 }}>Start with the free AI in 60 Minutes course.</p>
            <Link to="/courses" className="btn btn-primary">Browse courses</Link>
          </div>
        ) : (
          <div className="grid-3">
            {courses.map(c => {
              const meta = findCourse(c.course_slug) || { title: c.course_title, category: c.category, level: '' }
              return (
                <div key={c.course_id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <CourseThumb course={meta} />
                  <div style={{ padding: 20, flex: 1 }}>
                    <div className="progress"><span style={{ width: `${c.percent}%` }} /></div>
                    <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>{c.lessons_completed} of {c.lessons_total} lessons · {c.percent}%</p>
                  </div>
                  <div className="row" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
                    <Link to={`/learn/${c.course_slug}`} className="btn btn-primary btn-sm"><Play size={14} /> {c.percent ? 'Continue' : 'Start'}</Link>
                    {c.percent === 100 && <Link to={`/certificate/${c.course_slug}`} className="btn btn-outline btn-sm"><Award size={14} /> Certificate</Link>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
