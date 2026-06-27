import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Clock, BarChart2, CheckCircle, ChevronDown, ChevronUp, Play, Lock, ShoppingCart } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../App'

export default function CourseDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    api.get(`/courses/${slug}`).then(r => setCourse(r.data)).catch(() => navigate('/courses')).finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (user && course) {
      api.get(`/courses/${slug}/enrolled`).then(r => setEnrolled(r.data.enrolled)).catch(() => {})
    }
  }, [user, course])

  const handleBuy = async () => {
    if (!user) { navigate('/login'); return }
    setPaying(true)
    try {
      const { data } = await api.post('/payments/create-order', { course_id: course.id })

      if (!data.key) {
        // Dev mode — simulate payment
        await api.post('/payments/verify', {
          razorpay_order_id: data.order_id,
          razorpay_payment_id: 'pay_dev_' + Date.now(),
          razorpay_signature: 'dev_sig',
          course_id: course.id,
        })
        setEnrolled(true)
        showToast('Enrollment successful! Start learning now.')
        return
      }

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: 'INR',
        name: 'LMAP Academy',
        description: data.course_title,
        order_id: data.order_id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              course_id: course.id,
            })
            setEnrolled(true)
            showToast('Payment successful! Welcome to the course.')
          } catch {
            showToast('Payment verification failed. Contact support.', 'error')
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#7C3AED' },
      })
      rzp.open()
    } catch (e) {
      showToast(e.response?.data?.detail || 'Something went wrong', 'error')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}><div className="spinner" /></div>
  if (!course) return null

  const totalVideos = course.modules?.reduce((s, m) => s + m.videos.length, 0) || 0

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 100%)', color: '#fff', padding: '60px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>
          <div>
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
              {course.level}
            </span>
            <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2, margin: '16px 0 16px' }}>{course.title}</h1>
            <p style={{ fontSize: 17, color: '#D1D5DB', lineHeight: 1.7, marginBottom: 24 }}>{course.short_description}</p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', color: '#9CA3AF', fontSize: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> {course.duration_hours} hours</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BarChart2 size={16} /> {course.modules?.length} modules</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Play size={16} /> {totalVideos} lessons</span>
            </div>
          </div>

          {/* Buy Box */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
              ₹{course.price.toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>One-time payment • Lifetime access</p>

            {enrolled ? (
              <Link to={`/learn/${slug}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Play size={18} /> Continue Learning
              </Link>
            ) : (
              <button onClick={handleBuy} disabled={paying} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <ShoppingCart size={18} /> {paying ? 'Processing...' : 'Enroll Now'}
              </button>
            )}

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Lifetime access to all videos', 'Certificate of completion', '30-day money-back guarantee', 'Access on all devices'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)' }}>
                  <CheckCircle size={16} color="var(--success)" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="section">
        <div className="container-sm">
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Course Curriculum</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {course.modules?.map((mod, idx) => (
              <div key={mod.id} className="card">
                <button
                  style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => setExpanded(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                >
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Module {idx + 1}</span>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{mod.title}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{mod.videos.length} lessons</span>
                    {expanded[mod.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                {expanded[mod.id] && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {mod.videos.map(v => (
                      <div key={v.id} style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {v.is_preview || enrolled
                            ? <Play size={16} color="var(--primary)" />
                            : <Lock size={16} color="var(--text-muted)" />
                          }
                          <span style={{ fontSize: 15 }}>{v.title}</span>
                          {v.is_preview && <span style={{ fontSize: 11, background: 'var(--accent-light)', color: '#92400E', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>FREE</span>}
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {v.duration_seconds > 0 ? `${Math.floor(v.duration_seconds / 60)}m` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Description */}
          {course.description && (
            <div style={{ marginTop: 48 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>About This Course</h2>
              <div style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{course.description}</div>
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
