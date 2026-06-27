import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Circle, ChevronDown, ChevronUp, Play } from 'lucide-react'
import api from '../api/client'

export default function LearnPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)
  const [progress, setProgress] = useState({})
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(true)
  const videoRef = useRef(null)
  const progressTimer = useRef(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${slug}`)
        const enrolled = await api.get(`/courses/${slug}/enrolled`)
        if (!enrolled.data.enrolled && data.modules?.length) {
          navigate(`/courses/${slug}`)
          return
        }
        setCourse(data)
        // Set first video as active
        if (data.modules?.[0]?.videos?.[0]) {
          setActiveVideo(data.modules[0].videos[0])
          setExpanded({ [data.modules[0].id]: true })
        }
      } catch {
        navigate('/courses')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [slug])

  const handleVideoChange = (video) => {
    setActiveVideo(video)
    if (videoRef.current) videoRef.current.currentTime = 0
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeVideo) return
    const watched = Math.floor(videoRef.current.currentTime)
    clearTimeout(progressTimer.current)
    progressTimer.current = setTimeout(() => {
      api.post(`/videos/${activeVideo.id}/progress?watched_seconds=${watched}`).catch(() => {})
      setProgress(p => ({ ...p, [activeVideo.id]: watched }))
    }, 5000)
  }

  const allVideos = course?.modules?.flatMap(m => m.videos) || []
  const currentIndex = allVideos.findIndex(v => v.id === activeVideo?.id)
  const nextVideo = allVideos[currentIndex + 1]

  const getVideoUrl = (videoId) => `/api/videos/${videoId}/stream`

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}><div className="spinner" /></div>
  if (!course) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
      {/* Main Content */}
      <div style={{ overflow: 'auto' }}>
        {activeVideo && (
          <>
            <video
              ref={videoRef}
              key={activeVideo.id}
              controls
              style={{ width: '100%', background: '#000', maxHeight: '60vh' }}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => nextVideo && handleVideoChange(nextVideo)}
            >
              <source src={getVideoUrl(activeVideo.id)} type="video/mp4" />
            </video>
            <div style={{ padding: 28 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{activeVideo.title}</h2>
              {activeVideo.description && <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{activeVideo.description}</p>}
              {nextVideo && (
                <button onClick={() => handleVideoChange(nextVideo)} className="btn btn-primary" style={{ marginTop: 20 }}>
                  Next: {nextVideo.title} →
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sidebar */}
      <div style={{ borderLeft: '1px solid var(--border)', overflow: 'auto', background: '#FAFAFA' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{course.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {Object.keys(progress).length} / {allVideos.length} lessons completed
          </p>
        </div>

        {course.modules?.map((mod, idx) => (
          <div key={mod.id}>
            <button
              style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
              onClick={() => setExpanded(p => ({ ...p, [mod.id]: !p[mod.id] }))}
            >
              <span>Module {idx + 1}: {mod.title}</span>
              {expanded[mod.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded[mod.id] && mod.videos.map(v => (
              <button
                key={v.id}
                onClick={() => handleVideoChange(v)}
                style={{
                  width: '100%', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
                  background: activeVideo?.id === v.id ? 'var(--primary-light)' : 'none',
                  border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left',
                  color: activeVideo?.id === v.id ? 'var(--primary)' : 'var(--text)',
                }}
              >
                {progress[v.id] ? <CheckCircle size={16} color="var(--success)" /> : activeVideo?.id === v.id ? <Play size={16} color="var(--primary)" /> : <Circle size={16} color="var(--text-muted)" />}
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>{v.title}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
