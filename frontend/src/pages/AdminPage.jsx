import React, { useEffect, useState } from 'react'
import { Users, BookOpen, IndianRupee, TrendingUp, Plus, Upload, Eye, EyeOff } from 'lucide-react'
import api from '../api/client'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('overview')
  const [newCourse, setNewCourse] = useState({ title: '', short_description: '', description: '', price: 10000, level: 'beginner', duration_hours: 10 })
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const load = async () => {
    const [s, c, u] = await Promise.all([api.get('/admin/stats'), api.get('/courses/all'), api.get('/admin/users')])
    setStats(s.data); setCourses(c.data); setUsers(u.data)
  }

  useEffect(() => { load() }, [])

  const createCourse = async (e) => {
    e.preventDefault(); setCreating(true)
    try {
      await api.post('/courses/', newCourse)
      showToast('Course created successfully!')
      setNewCourse({ title: '', short_description: '', description: '', price: 10000, level: 'beginner', duration_hours: 10 })
      load()
    } catch (e) {
      showToast(e.response?.data?.detail || 'Error', 'error')
    } finally { setCreating(false) }
  }

  const togglePublish = async (course) => {
    await api.put(`/courses/${course.id}/publish`)
    showToast(course.is_published ? 'Course unpublished' : 'Course published!')
    load()
  }

  const set = k => e => setNewCourse(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="section">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage LMAP Academy</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: '#F3F4F6', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {['overview', 'courses', 'create', 'users'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, textTransform: 'capitalize', cursor: 'pointer', background: tab === t ? '#fff' : 'transparent', color: tab === t ? 'var(--primary)' : 'var(--text-muted)', boxShadow: tab === t ? 'var(--shadow)' : 'none' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            <StatCard icon={Users} label="Total Users" value={stats.total_users} color="#7C3AED" />
            <StatCard icon={BookOpen} label="Total Courses" value={stats.total_courses} color="#0EA5E9" />
            <StatCard icon={TrendingUp} label="Enrollments" value={stats.total_enrollments} color="#10B981" />
            <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats.total_revenue || 0).toLocaleString('en-IN')}`} color="#F59E0B" />
          </div>
        )}

        {/* Courses List */}
        {tab === 'courses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {courses.map(c => (
              <div key={c.id} className="card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    ₹{c.price.toLocaleString('en-IN')} • {c.level} • {c.duration_hours}h • {c.modules?.length || 0} modules
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: c.is_published ? '#D1FAE5' : '#FEE2E2', color: c.is_published ? '#065F46' : '#991B1B' }}>
                    {c.is_published ? 'Published' : 'Draft'}
                  </span>
                  <button onClick={() => togglePublish(c)} className="btn btn-outline btn-sm">
                    {c.is_published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Course */}
        {tab === 'create' && (
          <div className="card" style={{ padding: 36, maxWidth: 640 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Create New Course</h2>
            <form onSubmit={createCourse} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input className="form-input" placeholder="AI Foundations for Career Re-entry" value={newCourse.title} onChange={set('title')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Short Description (shown on cards)</label>
                <input className="form-input" placeholder="One-line summary" value={newCourse.short_description} onChange={set('short_description')} />
              </div>
              <div className="form-group">
                <label className="form-label">Full Description</label>
                <textarea className="form-input" rows={5} placeholder="Detailed course description..." value={newCourse.description} onChange={set('description')} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input className="form-input" type="number" value={newCourse.price} onChange={set('price')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="form-input" value={newCourse.level} onChange={set('level')}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (hours)</label>
                  <input className="form-input" type="number" value={newCourse.duration_hours} onChange={set('duration_hours')} />
                </div>
              </div>
              <button type="submit" disabled={creating} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <Plus size={18} /> {creating ? 'Creating...' : 'Create Course'}
              </button>
            </form>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Email', 'Role', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: 14 }}>{u.email}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: u.role === 'admin' ? 'var(--primary-light)' : '#F3F4F6', color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
