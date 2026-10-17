import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import { findPost, findCourse } from '../lib/content'
import { renderMarkdown, readingMinutes } from '../lib/markdown'
import { useSeo } from '../lib/seo'

export default function BlogPostPage() {
  const { slug } = useParams()
  const post = findPost(slug)
  useSeo({ title: post?.title, description: post?.description, path: `/blog/${slug}` })
  if (!post) return <Navigate to="/blog" replace />
  const courses = post.courses.map(findCourse).filter(Boolean)

  return (
    <div>
      <div className="hero-dark" style={{ padding: '56px 0' }}>
        <div className="container-sm">
          <nav style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 14 }}><Link to="/blog">Blog</Link></nav>
          <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 42px)', fontWeight: 800, lineHeight: 1.2 }}>{post.title}</h1>
          <p style={{ color: '#9CA3AF', marginTop: 14, fontSize: 14 }}>
            {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {readingMinutes(post.body)} min read
          </p>
        </div>
      </div>
      <div className="section" style={{ paddingTop: 48 }}>
        <article className="container-sm prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      </div>
      {courses.length > 0 && (
        <section className="section" style={{ background: '#FAFAFA' }}>
          <div className="container">
            <h2 className="section-title" style={{ fontSize: 28, marginBottom: 28 }}>Courses mentioned in this guide</h2>
            <div className="grid-3">{courses.map(c => <CourseCard key={c.slug} course={c} />)}</div>
          </div>
        </section>
      )}
    </div>
  )
}
