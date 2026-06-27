import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, BookOpen, Clock } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../App'

export default function DashboardPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payments/my-courses').then(r => setCourses(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="section">
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>My Learning</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Welcome back, {user?.name}!</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <BookOpen size={64} color="var(--border)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No courses yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Enroll in a course to start your AI journey</p>
            <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div className="grid-3">
            {courses.map(c => (
              <div key={c.course_id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 140, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative' }}>
                  {c.thumbnail && <img src={c.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ padding: 20, flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{c.course_title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Enrolled {new Date(c.enrolled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
                  <Link to={`/learn/${c.course_slug}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    <Play size={14} /> Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
