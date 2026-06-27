import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import api from '../api/client'
import CourseCard from '../components/CourseCard'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/courses/').then(r => { setCourses(r.data); setFiltered(r.data) }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = courses
    if (search) result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    if (level !== 'all') result = result.filter(c => c.level === level)
    setFiltered(result)
  }, [search, level, courses])

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 100%)', color: '#fff', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 12 }}>All Courses</h1>
          <p style={{ fontSize: 18, color: '#9CA3AF' }}>Master AI tools and build the career you deserve</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: 42, width: '100%' }}
                placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'beginner', 'intermediate', 'advanced'].map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`btn btn-sm ${level === l ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textTransform: 'capitalize' }}>
                  {l === 'all' ? 'All Levels' : l}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 18 }}>No courses found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid-3">
              {filtered.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
