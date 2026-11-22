import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Award, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import api from '../api/client'
import { findCourse } from '../lib/content'
import { useSeo } from '../lib/seo'

export default function QuizPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const course = findCourse(slug)
  const [test, setTest] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useSeo({ title: `Final test: ${course?.title || ''}`, path: `/quiz/${slug}`, noindex: true })

  const start = () => {
    setTest(null); setResult(null); setAnswers({}); setError('')
    api.get(`/quiz/${slug}`).then(r => {
      if (!r.data.required || r.data.passed) navigate(`/certificate/${slug}`, { replace: true })
      else setTest(r.data)
    }).catch(e => setError(e.response?.data?.detail || 'Could not load the test'))
  }
  useEffect(start, [slug])

  const submit = async () => {
    setBusy(true)
    try {
      const { data } = await api.post(`/quiz/${slug}`, { attempt_id: test.attempt_id, answers })
      setResult(data)
      window.scrollTo(0, 0)
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not submit. Please try again.')
    } finally { setBusy(false) }
  }

  const back = <Link to={`/learn/${slug}`} className="row muted" style={{ gap: 6, fontSize: 14, marginBottom: 16 }}><ArrowLeft size={14} /> Back to the course</Link>

  if (error) return (
    <div className="section"><div className="container-sm">{back}
      <div className="card" style={{ padding: 28, boxShadow: 'none' }}><p style={{ fontSize: 17 }}>{error}</p></div>
    </div></div>
  )
  if (!test) return <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}><div className="spinner" /></div>

  if (result) return (
    <div className="section"><div className="container-sm">{back}
      <div className="card" style={{ padding: 32, textAlign: 'center', boxShadow: 'none', marginBottom: 28 }}>
        {result.passed ? <Award size={44} color="var(--success)" /> : <XCircle size={44} color="var(--error)" />}
        <h1 style={{ fontSize: 28, margin: '12px 0 6px' }}>{result.passed ? 'You passed!' : 'Not quite yet'}</h1>
        <p style={{ fontSize: 18 }}>You scored <strong>{result.score} / {result.total}</strong> ({Math.round(100 * result.score / result.total)}%). The pass mark is {result.pass_percent}%.</p>
        {result.passed
          ? <Link to={`/certificate/${slug}`} className="btn btn-primary btn-lg" style={{ marginTop: 20 }}><Award size={18} /> Get your certificate</Link>
          : <>
              <p className="muted" style={{ marginTop: 10 }}>Review the lessons for the questions you missed, then try again. Attempts left today: {result.attempts_left_today}.</p>
              <div className="row" style={{ justifyContent: 'center', marginTop: 18 }}>
                <Link to={`/learn/${slug}`} className="btn btn-outline">Review lessons</Link>
                {result.attempts_left_today > 0 && <button className="btn btn-primary" onClick={start}>Try again</button>}
              </div>
            </>}
      </div>
      <div className="stack">
        {result.results.map((r, i) => (
          <div key={r.id} className="card" style={{ padding: 18, boxShadow: 'none' }}>
            <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap', gap: 10 }}>
              {(r.right ?? r.chosen === r.correct) ? <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: 3 }} /> : <XCircle size={18} color="var(--error)" style={{ flexShrink: 0, marginTop: 3 }} />}
              <div>
                <strong>{i + 1}. {r.q}</strong>
                {r.options && <p style={{ marginTop: 6, fontSize: 15 }}>Answer: {r.options[r.correct]}</p>}
                {r.explain && <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>{r.explain}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div></div>
  )

  const answered = Object.keys(answers).length
  return (
    <div className="section"><div className="container-sm">{back}
      <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800 }}>Final test</h1>
      <p className="muted" style={{ margin: '6px 0 28px', fontSize: 16 }}>
        {course?.title} · {test.questions.length} questions · pass mark {test.pass_percent}% · attempts left today: {test.attempts_left_today}
      </p>
      <div className="stack" style={{ gap: 18 }}>
        {test.questions.map((q, i) => (
          <fieldset key={q.id} className="card" style={{ padding: 20, boxShadow: 'none', border: '1px solid var(--border)' }}>
            <legend style={{ fontWeight: 700, fontSize: 17, padding: '0 6px' }}>{i + 1}. {q.q}</legend>
            <div className="stack" style={{ gap: 8, marginTop: 8 }}>
              {q.options.map((o, oi) => (
                <label key={oi} className="row" style={{ gap: 10, flexWrap: 'nowrap', alignItems: 'flex-start', padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  background: answers[q.id] === oi ? 'var(--primary-light)' : '#FAFAFA', border: `1px solid ${answers[q.id] === oi ? 'var(--primary)' : 'var(--border)'}` }}>
                  <input type="radio" name={`q${q.id}`} checked={answers[q.id] === oi} onChange={() => setAnswers(a => ({ ...a, [q.id]: oi }))} style={{ marginTop: 4 }} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 28 }}>
        <span className="muted">{answered} of {test.questions.length} answered</span>
        <button className="btn btn-primary btn-lg" disabled={busy || answered < test.questions.length} onClick={submit}>{busy ? 'Submitting…' : 'Submit answers'}</button>
      </div>
    </div></div>
  )
}
