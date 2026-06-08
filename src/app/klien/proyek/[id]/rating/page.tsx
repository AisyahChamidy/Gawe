'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function RatingPage() {
  const params = useParams()
  const projectId = params.id as string
  const router = useRouter()
  const supabase = createClient()

  const [project,      setProject]      = useState<any>(null)
  const [freelancer,   setFreelancer]   = useState('')
  const [loading,      setLoading]      = useState(true)
  const [selectedStar, setSelectedStar] = useState(0)
  const [hoverStar,    setHoverStar]    = useState(0)
  const [comment,      setComment]      = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [done,         setDone]         = useState(false)
  const [user,         setUser]         = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth/masuk'); return }
      setUser(u)

      const { data: proj } = await supabase
        .from('projects').select('*').eq('id', projectId).eq('client_id', u.id).single()
      if (!proj) { router.push('/klien/proyek'); return }
      setProject(proj)

      if (proj.selected_freelancer_id) {
        const { data: profile } = await supabase
          .from('profiles').select('full_name').eq('id', proj.selected_freelancer_id).single()
        setFreelancer(profile?.full_name || 'Freelancer')
      }
      setLoading(false)
    }
    load()
  }, [projectId])

  async function handleSubmit() {
    if (!selectedStar || !user || !project) return
    setSubmitting(true)
    await supabase.from('reviews').insert({
      project_id: projectId,
      reviewer_id: user.id,
      reviewee_id: project.selected_freelancer_id,
      rating: selectedStar,
      comment: comment.trim() || null,
    })
    setDone(true)
    setSubmitting(false)
    setTimeout(() => router.push('/klien/proyek'), 1800)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>
  )

  const activeStar = hoverStar || selectedStar

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <NavbarKlien />
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px) 80px' }}>

        <a href="/klien/proyek" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '13px' }}>← Kembali ke Proyekku</a>

        {done ? (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🌟</div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#10B981', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>Rating Terkirim!</h1>
            <p style={{ color: '#8892a4', fontSize: '14px' }}>Terima kasih sudah memberi ulasan. Mengalihkan...</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '16px 0 4px', fontFamily: 'Outfit, sans-serif' }}>Beri Rating Freelancer</h1>
            <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '28px' }}>Bagikan pengalamanmu bekerja sama.</p>

            {/* Project info */}
            <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
              <span style={{ backgroundColor: '#1a2340', color: '#4F6EF7', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>{project?.category}</span>
              <h2 style={{ fontSize: '17px', fontWeight: '700', margin: '8px 0 4px' }}>{project?.title}</h2>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#8892a4' }}>
                <span>{fmt(project?.budget_max || 0)}</span>
                {freelancer && <span>👤 {freelancer}</span>}
              </div>
            </div>

            {/* Star selector */}
            <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '28px 24px', marginBottom: '20px', textAlign: 'center' }}>
              <p style={{ color: '#8892a4', fontSize: '13px', marginBottom: '16px' }}>Seberapa puas kamu dengan hasil kerja {freelancer || 'freelancer'} ini?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setSelectedStar(star)}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '36px', padding: '4px', lineHeight: 1, transition: 'transform 0.1s', transform: activeStar >= star ? 'scale(1.15)' : 'scale(1)' }}
                  >
                    {activeStar >= star ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              {selectedStar > 0 && (
                <p style={{ color: '#FBBF24', fontSize: '13px', fontWeight: '600' }}>
                  {['', 'Mengecewakan', 'Kurang memuaskan', 'Cukup baik', 'Bagus!', 'Luar biasa! 🎉'][selectedStar]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>Komentar (opsional)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Ceritakan pengalamanmu bekerja sama dengan freelancer ini..."
                style={{ width: '100%', padding: '12px 14px', backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '90px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedStar || submitting}
              style={{ width: '100%', padding: '14px', backgroundColor: selectedStar && !submitting ? '#4F6EF7' : '#1e2d4a', color: selectedStar ? 'white' : '#8892a4', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: selectedStar && !submitting ? 'pointer' : 'not-allowed' }}>
              {submitting ? 'Mengirim...' : 'Kirim Rating ⭐'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
