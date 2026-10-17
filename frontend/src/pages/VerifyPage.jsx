import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import api from '../api/client'
import { useSeo } from '../lib/seo'
import { CertificateView } from './CertificatePage'

export default function VerifyPage() {
  const { code } = useParams()
  const [cert, setCert] = useState(null)
  const [missing, setMissing] = useState(false)
  useSeo({ title: `Verify certificate ${code}`, path: `/verify/${code}`, noindex: true })

  useEffect(() => {
    api.get(`/certificates/verify/${code}`).then(r => setCert(r.data)).catch(() => setMissing(true))
  }, [code])

  return (
    <div className="section" style={{ background: '#F3F4F6' }}>
      <div className="container">
        {missing && <p style={{ textAlign: 'center', fontSize: 18 }}>No certificate found with ID <strong>{code}</strong>.</p>}
        {cert && (
          <>
            <p className="row" style={{ justifyContent: 'center', color: 'var(--success)', fontWeight: 700, marginBottom: 20 }}>
              <CheckCircle size={20} /> Valid certificate issued by LMAP Academy
            </p>
            <CertificateView cert={cert} />
          </>
        )}
        {!cert && !missing && <div className="spinner" style={{ margin: '0 auto' }} />}
      </div>
    </div>
  )
}
