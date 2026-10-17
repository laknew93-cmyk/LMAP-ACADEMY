import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Circle, Lock, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Award } from 'lucide-react'
import api, { BASE_URL } from '../api/client'
import { useAuth } from '../App'
import { findCourse, formatINR } from '../lib/content'
import { renderMarkdown } from '../lib/markdown'
import { useSeo } from '../lib/seo'

export default function LearnPage() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const meta = findCourse(slug)
  const [course, setCourse] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [done, setDone] = useState(new Set())
  const [lesson, setLesson] = useState(null) // { ...lesson } | { locked: true }
  const [expanded, setExpanded] = useState({})
  const [saving, setSaving] = useState(false)

  useSeo({ title: course ? `Learn: ${course.title}` : 'Learn', path: `/learn/${slug}`, noindex: true })

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/courses/${slug}`)
        setCourse(data)
        if (user) {
          const e = await api.get(`/courses/${slug}/enrolled`)
          setEnrolled(e.data.enrolled)
          if (e.data.enrolled) {
            const p = await api.get(`/courses/${slug}/progress`)
            setDone(new Set(p.data.completed))
          }
        }
      } catch {
        navigate(`/courses/${slug}`)
      }
    })()
  }, [slug, user])

  const lessons = useMemo(() => course?.modules.flatMap((m, mi) => m.videos.map(v => ({ ...v, mi }))) || [], [course])
  const requested = Number(params.get('lesson'))
  const activeId = lessons.some(l => l.id === requested) ? requested : (lessons.find(l => !done.has(l.id)) || lessons[0])?.id
  const idx = lessons.findIndex(l => l.id === activeId)
  const active = lessons[idx]
  const next = lessons[idx + 1]
  const prev = lessons[idx - 1]
  const percent = lessons.length ? Math.round((100 * done.size) / lessons.length) : 0

  useEffect(() => {
    if (!active) return
    setExpanded(e => ({ ...e, [active.mi]: true }))
    setLesson(null)
    api.get(`/lessons/${active.id}`)
      .then(r => setLesson(r.data))
      .catch(err => setLesson(err.response?.status === 403 ? { locked: true } : { error: true }))
    document.querySelector('.learn-main')?.scrollTo(0, 0)
    window.scrollTo(0, 0)
  }, [active?.id])

  const go = l => setParams({ lesson: String(l.id) })

  const toggleComplete = async (completed, thenNext) => {
    setSaving(true)
    try {
      await api.post(`/lessons/${active.id}/complete`, { completed })
      setDone(d => { const n = new Set(d); completed ? n.add(active.id) : n.delete(active.id); return n })
      if (thenNext && next) go(next)
    } finally { setSaving(false) }
  }

  if (!course || !active) return <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}><div className="spinner" /></div>

  const token = localStorage.getItem('lmap_token')
  const isDone = done.has(active.id)

  return (
    <div className="learn">
      <main className="learn-main">
        <div className="container-sm" style={{ padding: '32px 24px 64px' }}>
          <Link to={`/courses/${slug}/`} className="row muted" style={{ gap: 6, fontSize: 14, marginBottom: 16 }}><ArrowLeft size={14} /> {course.title}</Link>
          <p className="muted" style={{ fontSize: 13, fontWeight: 700 }}>MODULE {active.mi + 1} · LESSON {idx + 1} OF {lessons.length}</p>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, lineHeight: 1.25, margin: '6px 0 24px' }}>{active.title}</h1>

          {!lesson && <div className="spinner" />}
          {lesson?.error && <p className="muted">Could not load this lesson. Please refresh the page.</p>}
          {lesson?.locked && (
            <div className="card" style={{ padding: 32, textAlign: 'center', boxShadow: 'none' }}>
              <Lock size={32} color="var(--primary)" />
              <h2 style={{ fontSize: 22, margin: '12px 0 8px' }}>This lesson is part of the full course</h2>
              <p className="muted" style={{ marginBottom: 20 }}>{active.summary}</p>
              <Link to={`/courses/${slug}/`} className="btn btn-primary">
                {meta?.price ? `Unlock all ${lessons.length} lessons for ${formatINR(meta.price)}` : 'Enrol for free'}
              </Link>
              {!user && <p className="muted" style={{ fontSize: 14, marginTop: 14 }}>Already enrolled? <Link to={`/login?next=${encodeURIComponent(`/learn/${slug}?lesson=${active.id}`)}`} style={{ color: 'var(--primary)' }}>Log in</Link></p>}
            </div>
          )}
          {lesson?.content !== undefined && (
            <>
              {lesson.has_video && (
                <video key={active.id} controls controlsList="nodownload" style={{ width: '100%', background: '#000', borderRadius: 12, marginBottom: 28 }}
                  src={`${BASE_URL}/videos/${active.id}/stream${token ? `?token=${token}` : ''}`} />
              )}
              <article className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content) }} />

              <div className="row" style={{ justifyContent: 'space-between', marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', gap: 12 }}>
                {prev ? <button className="btn btn-ghost" onClick={() => go(prev)}><ArrowLeft size={16} /> Previous</button> : <span />}
                {enrolled ? (
                  <div className="row">
                    {isDone && <button className="btn btn-ghost btn-sm" disabled={saving} onClick={() => toggleComplete(false)}>Mark incomplete</button>}
                    {!isDone && <button className="btn btn-primary" disabled={saving} onClick={() => toggleComplete(true, true)}><CheckCircle size={16} /> {next ? 'Complete & next' : 'Mark complete'}</button>}
                    {isDone && next && <button className="btn btn-primary" onClick={() => go(next)}>Next lesson <ArrowRight size={16} /></button>}
                  </div>
                ) : (
                  <Link to={`/courses/${slug}/`} className="btn btn-primary">{meta?.price ? 'Get the full course' : 'Enrol free to continue'} <ArrowRight size={16} /></Link>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <aside className="learn-side">
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>{course.title}</h2>
          {enrolled ? (
            <>
              <div className="progress"><span style={{ width: `${percent}%` }} /></div>
              <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>{done.size} of {lessons.length} lessons complete · {percent}%</p>
              {percent === 100 && <Link to={`/certificate/${slug}`} className="btn btn-accent btn-sm" style={{ marginTop: 12 }}><Award size={14} /> Get your certificate</Link>}
            </>
          ) : <p className="muted" style={{ fontSize: 13 }}>Previewing — free lessons are unlocked</p>}
        </div>
        {course.modules.map((mod, mi) => (
          <div key={mod.id}>
            <button onClick={() => setExpanded(p => ({ ...p, [mi]: !p[mi] }))}
              style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', gap: 8, background: 'none', border: 'none', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 650, textAlign: 'left' }}>
              <span>{mi + 1}. {mod.title}</span>{expanded[mi] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded[mi] && mod.videos.map(v => {
              const current = v.id === active.id
              const open = enrolled || v.is_preview
              return (
                <button key={v.id} onClick={() => go(v)}
                  style={{ width: '100%', padding: '11px 20px', display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', border: 'none', borderBottom: '1px solid var(--border)', background: current ? 'var(--primary-light)' : 'none', color: current ? 'var(--primary-dark)' : 'var(--text)' }}>
                  {done.has(v.id) ? <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                    : open ? <Circle size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                    : <Lock size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />}
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{v.title}</span>
                </button>
              )
            })}
          </div>
        ))}
      </aside>
    </div>
  )
}
