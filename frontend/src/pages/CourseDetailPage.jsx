import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import { Clock, BarChart2, BookOpen, ChevronDown, ChevronUp, Lock, Eye, ShoppingCart, Play, Award, ArrowRight } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../App'
import CourseCard, { CourseThumb } from '../components/CourseCard'
import { COURSES, findCourse, formatINR, discountPct } from '../lib/content'
import { checkout, errorMessage } from '../lib/checkout'
import { useSeo } from '../lib/seo'
import { SITE } from '../site'

export default function CourseDetailPage() {
  const { slug } = useParams()
  const course = findCourse(slug)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lessonIds, setLessonIds] = useState([]) // [[id, ...] per module] from the API
  const [enrolled, setEnrolled] = useState(false)
  const [paying, setPaying] = useState(false)
  const [expanded, setExpanded] = useState({ 0: true })
  const [toast, setToast] = useState(null)

  useSeo({ title: course?.seo?.title || course?.title, description: course?.seo?.description || course?.subtitle, path: `/courses/${slug}` })

  useEffect(() => {
    if (!course) return
    api.get(`/courses/${slug}`).then(r => setLessonIds(r.data.modules.map(m => m.videos.map(v => v.id)))).catch(() => {})
    if (user) api.get(`/courses/${slug}/enrolled`).then(r => setEnrolled(r.data.enrolled)).catch(() => {})
  }, [slug, user])

  if (!course) return <Navigate to="/courses/" replace />

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 5000) }
  const off = discountPct(course)
  const isFree = course.price === 0
  const lessonLink = (mi, li) => lessonIds[mi]?.[li] ? `/learn/${slug}?lesson=${lessonIds[mi][li]}` : null

  const handleBuy = async () => {
    if (!user) { navigate(`/register?next=${encodeURIComponent(`/courses/${slug}`)}`); return }
    setPaying(true)
    try {
      const slugs = await checkout({ course_slug: slug })
      if (slugs) {
        setEnrolled(true)
        window.gtag?.('event', isFree ? 'sign_up' : 'purchase', { currency: 'INR', value: course.price, items: [{ item_id: slug, item_name: course.title }] })
        showToast(isFree ? 'You are enrolled — start learning!' : 'Payment successful — welcome to the course!')
      }
    } catch (e) {
      showToast(errorMessage(e), 'error')
    } finally {
      setPaying(false)
    }
  }

  const related = COURSES.filter(c => c.slug !== slug && c.price > 0).slice(0, 3)

  const buyBox = (
    <div className="card sticky-card">
      <CourseThumb course={course} compact />
      <div style={{ padding: 24 }}>
        <div className="row" style={{ gap: 10, marginBottom: 4 }}>
          <span className="price" style={{ fontSize: 34 }}>{isFree ? 'Free' : formatINR(course.price)}</span>
          {off > 0 && <span className="mrp" style={{ fontSize: 18 }}>{formatINR(course.mrp)}</span>}
          {off > 0 && <span className="off">{off}% off</span>}
        </div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>{isFree ? 'Create a free account to start' : 'One-time payment · inclusive of taxes · lifetime access'}</p>
        {enrolled ? (
          <Link to={`/learn/${slug}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}><Play size={18} /> Continue learning</Link>
        ) : (
          <button onClick={handleBuy} disabled={paying} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <ShoppingCart size={18} /> {paying ? 'Processing…' : isFree ? 'Enrol for free' : 'Buy now'}
          </button>
        )}
        <ul className="check-list" style={{ marginTop: 18, fontSize: 14 }}>
          <li>{course.lesson_count} lessons · {course.duration_hours} hours</li>
          <li>{course.projects?.length || 0} hands-on projects</li>
          <li>Certificate of completion</li>
          <li>Lifetime access on any device</li>
          {!isFree && <li>{SITE.refundDays}-day refund policy</li>}
        </ul>
        {!isFree && (
          <Link to="/all-access/" style={{ display: 'block', marginTop: 18, fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>
            Or get all courses for {formatINR(SITE.bundle.price)} →
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <div>
      <div className="hero-dark" style={{ padding: '56px 0' }}>
        <div className="container split-aside">
          <div>
            <nav className="row" style={{ gap: 6, fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>
              <Link to="/courses/">Courses</Link> <span>/</span> <span>{course.category}</span>
            </nav>
            <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 42px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>{course.title}</h1>
            <p style={{ fontSize: 18, color: '#D1D5DB', lineHeight: 1.7, marginBottom: 22 }}>{course.subtitle}</p>
            <div className="row" style={{ gap: 22, color: '#9CA3AF', fontSize: 14 }}>
              <span className="row" style={{ gap: 6, textTransform: 'capitalize' }}><BarChart2 size={16} /> {course.level}</span>
              <span className="row" style={{ gap: 6 }}><Clock size={16} /> {course.duration_hours} hours</span>
              <span className="row" style={{ gap: 6 }}><BookOpen size={16} /> {course.lesson_count} lessons</span>
              <span className="row" style={{ gap: 6 }}><Award size={16} /> Certificate</span>
            </div>
            {course.tools?.length > 0 && (
              <div className="row" style={{ gap: 8, marginTop: 20 }}>
                {course.tools.map(t => <span key={t} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, border: '1px solid rgba(255,255,255,.2)', color: '#E5E7EB' }}>{t}</span>)}
              </div>
            )}
          </div>
          <div className="hide-sm" />
        </div>
      </div>

      <div className="section" style={{ paddingTop: 40 }}>
        <div className="container split-aside">
          <div className="stack" style={{ gap: 48, minWidth: 0 }}>
            <section>
              <h2 style={{ fontSize: 26, marginBottom: 18 }}>What you'll learn</h2>
              <ul className="check-list outcomes">{course.outcomes?.map(o => <li key={o}>{o}</li>)}</ul>
            </section>

            <section>
              <h2 style={{ fontSize: 26, marginBottom: 6 }}>Curriculum</h2>
              <p className="muted" style={{ marginBottom: 18 }}>{course.modules.length} modules · {course.lesson_count} lessons · lessons marked “Preview” are free to read</p>
              <div className="stack">
                {course.modules.map((mod, mi) => (
                  <div key={mi} className="card" style={{ boxShadow: 'none' }}>
                    <button onClick={() => setExpanded(p => ({ ...p, [mi]: !p[mi] }))}
                      style={{ width: '100%', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', textAlign: 'left', gap: 12 }}>
                      <span>
                        <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>MODULE {mi + 1}</span>
                        <span style={{ display: 'block', fontSize: 17, fontWeight: 700 }}>{mod.title}</span>
                      </span>
                      <span className="row muted" style={{ gap: 8, fontSize: 13, flexShrink: 0 }}>{mod.lessons.length} lessons {expanded[mi] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                    </button>
                    {expanded[mi] && mod.lessons.map((l, li) => {
                      const open = l.preview || enrolled
                      const link = open && lessonLink(mi, li)
                      return (
                        <div key={li} className="lesson-row">
                          <span className="row" style={{ gap: 10, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                            {open ? <Eye size={16} color="var(--primary)" style={{ marginTop: 4, flexShrink: 0 }} /> : <Lock size={16} color="var(--text-muted)" style={{ marginTop: 4, flexShrink: 0 }} />}
                            <span>
                              {link ? <Link to={link} style={{ fontWeight: 600, color: 'var(--primary)' }}>{l.title}</Link> : <span style={{ fontWeight: 600 }}>{l.title}</span>}
                              {l.preview && <span className="pill" style={{ marginLeft: 8, background: 'var(--accent-light)', color: '#92400E' }}>Preview</span>}
                              <span className="muted" style={{ display: 'block', fontSize: 14 }}>{l.summary}</span>
                            </span>
                          </span>
                          <span className="muted" style={{ fontSize: 13, flexShrink: 0 }}>{l.minutes} min</span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </section>

            {course.projects?.length > 0 && (
              <section>
                <h2 style={{ fontSize: 26, marginBottom: 18 }}>Projects you'll complete</h2>
                <ul className="check-list">{course.projects.map(p => <li key={p}>{p}</li>)}</ul>
              </section>
            )}

            <section className="grid-2" style={{ gap: 32 }}>
              <div>
                <h2 style={{ fontSize: 22, marginBottom: 14 }}>Who this course is for</h2>
                <ul className="check-list">{course.audience?.map(a => <li key={a}>{a}</li>)}</ul>
              </div>
              <div>
                <h2 style={{ fontSize: 22, marginBottom: 14 }}>Requirements</h2>
                <ul className="check-list">{course.prerequisites?.map(a => <li key={a}>{a}</li>)}</ul>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: 26, marginBottom: 14 }}>About this course</h2>
              <div className="prose">{course.description.split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>)}</div>
            </section>

            {course.faqs?.length > 0 && (
              <section className="faq">
                <h2 style={{ fontSize: 26, marginBottom: 18 }}>FAQs</h2>
                {course.faqs.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
              </section>
            )}
          </div>

          <aside className="buy-aside">{buyBox}</aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section" style={{ background: '#FAFAFA' }}>
          <div className="container">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 className="section-title" style={{ fontSize: 28 }}>Learners also take</h2>
              <Link to="/courses/" className="btn btn-outline btn-sm">All courses <ArrowRight size={14} /></Link>
            </div>
            <div className="grid-3">{related.map(c => <CourseCard key={c.slug} course={c} />)}</div>
          </div>
        </section>
      )}

      {toast && <div className={`toast toast-${toast.type}`} role="status">{toast.msg}</div>}
    </div>
  )
}
