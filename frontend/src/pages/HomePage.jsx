import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Briefcase, GraduationCap, RefreshCw, Store, Code2, BookOpen, Award, Zap, ShieldCheck, Languages } from 'lucide-react'
import CourseCard from '../components/CourseCard'
import { COURSES, POSTS, paidCourses, formatINR } from '../lib/content'
import { useSeo } from '../lib/seo'
import { SITE } from '../site'

export const HOME_FAQS = [
  { q: 'Do I need a technical background?', a: 'No. Six of our seven paid courses are designed for non-technical learners. Only Generative AI Mastery expects basic Python. Start with the free AI in 60 Minutes course if you are new to AI.' },
  { q: 'Are the courses self-paced?', a: 'Yes. Every course is self-paced with lifetime access. Lessons are short and practical, each ending with a hands-on exercise you can finish in 10–20 minutes.' },
  { q: 'Do I get a certificate?', a: 'Yes. When you mark every lesson complete you can download a certificate of completion with a unique ID that anyone can verify on our website.' },
  { q: 'What is the refund policy?', a: `If a course is not right for you, ask for a full refund within ${SITE.refundDays} days of purchase, as long as you have completed less than ${SITE.refundMaxProgress}% of it.` },
  { q: 'How do I pay?', a: 'Securely through Razorpay with UPI, debit or credit cards, net banking or wallets. Prices are in Indian rupees and you get instant access after payment.' },
]

const AUDIENCES = [
  { icon: Briefcase, title: 'Working professionals', desc: 'Save hours every week on email, reports, spreadsheets and meetings — and become the AI person on your team.' },
  { icon: GraduationCap, title: 'Students & freshers', desc: 'Add job-ready AI skills to your CV and LinkedIn that most graduates still do not have.' },
  { icon: RefreshCw, title: 'Career returners', desc: 'Restart after a break with confidence. Learn at your own pace and walk into interviews with current skills.' },
  { icon: Store, title: 'Freelancers & business owners', desc: 'Offer AI-powered services, win clients, and automate the repetitive work in your business.' },
  { icon: Code2, title: 'Developers', desc: 'Build real LLM apps, RAG systems and agents in Python and move into GenAI roles.' },
]

const WHY = [
  { icon: Zap, title: 'Learn by doing', desc: 'Every lesson ends with a practical exercise. Every course ends with portfolio projects.' },
  { icon: Languages, title: 'Made for India', desc: 'Examples from Indian workplaces and businesses — GST invoices, Naukri, WhatsApp Business, ₹ pricing.' },
  { icon: Award, title: 'Verifiable certificate', desc: 'Finish a course and share a certificate with a unique ID that employers can verify.' },
  { icon: ShieldCheck, title: 'Low risk', desc: `Lifetime access, secure Razorpay checkout and a ${SITE.refundDays}-day refund window.` },
]

export default function HomePage() {
  useSeo({ title: 'AI Courses Online in India — ChatGPT, Prompt Engineering & GenAI', description: SITE.description, path: '/' })
  const paid = paidCourses()
  const free = COURSES.find(c => c.price === 0)
  const totalLessons = COURSES.reduce((s, c) => s + c.lesson_count, 0)
  const bundleValue = paid.reduce((s, c) => s + c.price, 0)

  return (
    <div>
      <section className="hero-dark" style={{ padding: '88px 0 80px' }}>
        <div className="container split">
          <div>
            <span className="eyebrow"><Sparkles size={14} /> Practical AI courses for India</span>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, lineHeight: 1.1, margin: '20px 0' }}>
              Learn the AI skills that get you <span style={{ color: '#A78BFA' }}>hired, paid and promoted</span>
            </h1>
            <p style={{ fontSize: 18, color: '#D1D5DB', lineHeight: 1.7, marginBottom: 32, maxWidth: 520 }}>
              Self-paced courses on ChatGPT, prompt engineering, AI automation, data analysis and generative AI —
              with hands-on projects and a verifiable certificate. Courses from {formatINR(Math.min(...paid.map(c => c.price)))}.
            </p>
            <div className="row" style={{ gap: 14 }}>
              <Link to="/courses" className="btn btn-primary btn-lg">Explore courses <ArrowRight size={18} /></Link>
              {free && <Link to={`/courses/${free.slug}`} className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}>Start free</Link>}
            </div>
            <div className="row" style={{ gap: 20, marginTop: 32, fontSize: 14, color: '#9CA3AF' }}>
              <span>✓ Lifetime access</span><span>✓ Certificate</span><span>✓ {SITE.refundDays}-day refund</span><span>✓ UPI & cards</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              [COURSES.length, 'AI courses'],
              [`${totalLessons}+`, 'practical lessons'],
              [COURSES.reduce((s, c) => s + (c.projects?.length || 0), 0), 'hands-on projects'],
              ['1', 'free starter course'],
            ].map(([v, l]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '26px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: '#C4B5FD' }}>{v}</div>
                <div style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#FAFAFA' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 className="section-title">Built for where you are today</h2>
            <p className="section-subtitle">Pick a path. Every course is practical from the first lesson.</p>
          </div>
          <div className="grid-3">
            {AUDIENCES.map(a => (
              <div key={a.title} className="card" style={{ padding: 24, boxShadow: 'none' }}>
                <a.icon size={26} color="var(--primary)" />
                <h3 style={{ fontSize: 18, margin: '12px 0 6px' }}>{a.title}</h3>
                <p className="muted" style={{ fontSize: 15 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 36 }}>
            <div>
              <h2 className="section-title">Our AI courses</h2>
              <p className="section-subtitle" style={{ marginTop: 8 }}>From your first prompt to building AI agents</p>
            </div>
            <Link to="/courses" className="btn btn-outline">All courses <ArrowRight size={16} /></Link>
          </div>
          <div className="grid-3">{COURSES.slice(0, 6).map(c => <CourseCard key={c.slug} course={c} />)}</div>
        </div>
      </section>

      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div className="hero-dark" style={{ borderRadius: 20, padding: 'clamp(28px, 5vw, 56px)' }}>
            <div className="split">
              <div>
                <span className="eyebrow">Best value</span>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: '16px 0 12px' }}>All-Access Pass</h2>
                <p style={{ color: '#D1D5DB', fontSize: 17, lineHeight: 1.7 }}>
                  All {paid.length} paid courses, every future update, one payment. Worth {formatINR(bundleValue)} if bought separately.
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 800 }}>{formatINR(SITE.bundle.price)}</div>
                <div style={{ color: '#9CA3AF', marginBottom: 20 }}>one-time · save {Math.round((1 - SITE.bundle.price / bundleValue) * 100)}%</div>
                <Link to="/all-access" className="btn btn-accent btn-lg">Get All-Access <ArrowRight size={18} /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#FAFAFA' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 44 }}>Why learners choose LMAP Academy</h2>
          <div className="grid-2">
            {WHY.map(w => (
              <div key={w.title} style={{ display: 'flex', gap: 18, padding: 24, background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <w.icon size={22} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, marginBottom: 6 }}>{w.title}</h3>
                  <p className="muted" style={{ fontSize: 15 }}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {POSTS.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 32 }}>
              <h2 className="section-title">Free AI guides</h2>
              <Link to="/blog" className="btn btn-outline">Read the blog <ArrowRight size={16} /></Link>
            </div>
            <div className="grid-3">
              {POSTS.slice(0, 3).map(p => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="card" style={{ padding: 24 }}>
                  <BookOpen size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: 18, margin: '10px 0 8px', lineHeight: 1.4 }}>{p.title}</h3>
                  <p className="muted" style={{ fontSize: 14 }}>{p.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" style={{ background: '#FAFAFA' }}>
        <div className="container-sm faq">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 32 }}>Frequently asked questions</h2>
          {HOME_FAQS.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: '72px 0', textAlign: 'center', color: '#fff' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 14 }}>Start learning AI today — free</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,.85)', marginBottom: 32 }}>Take the 60-minute starter course, then choose your path.</p>
          <Link to={free ? `/courses/${free.slug}` : '/courses'} className="btn btn-accent btn-lg">Take the free course <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  )
}
