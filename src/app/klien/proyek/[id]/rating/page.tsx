'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'
import { Star, Sparkles } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme
const STAR_AMBER = '#FBBF24'
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
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>
      Memuat...
    </div>
  )

  const activeStar = hoverStar || selectedStar

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <NavbarKlien />
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px) 80px' }}>

        <a href="/klien/proyek" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '13px' }}>← Kembali ke Proyekku</a>

        {done ? (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <Sparkles size={56} strokeWidth={1.5} color={C.success} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: C.success, marginBottom: '8px', fontFamily: theme.fonts.headline }}>Rating Terkirim!</h1>
            <p style={{ color: C.textMuted, fontSize: '14px' }}>Terima kasih sudah memberi ulasan. Mengalihkan...</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '16px 0 4px', fontFamily: theme.fonts.headline, color: C.textDark }}>Beri Rating Freelancer</h1>
            <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '28px' }}>Bagikan pengalamanmu bekerja sama.</p>

            {/* Project info */}
            <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px 24px', marginBottom: '24px', boxShadow: theme.shadow.card }}>
              <span style={{ backgroundColor: C.primaryTint, color: C.primary, fontSize: '11px', padding: '2px 8px', borderRadius: R.pill }}>{project?.category}</span>
              <h2 style={{ fontSize: '17px', fontWeight: '700', margin: '8px 0 4px', color: C.textDark }}>{project?.title}</h2>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: C.textMuted }}>
                <span style={{ fontFamily: theme.fonts.mono }}>{fmt(project?.budget_max || 0)}</span>
                {freelancer && <span>{freelancer}</span>}
              </div>
            </div>

            {/* Star selector */}
            <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '28px 24px', marginBottom: '20px', textAlign: 'center', boxShadow: theme.shadow.card }}>
              <p style={{ color: C.textMuted, fontSize: '13px', marginBottom: '16px' }}>Seberapa puas kamu dengan hasil kerja {freelancer || 'freelancer'} ini?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setSelectedStar(star)}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 1, transition: 'transform 0.1s', transform: activeStar >= star ? 'scale(1.15)' : 'scale(1)' }}
                  >
                    <Star
                      size={32}
                      strokeWidth={1.5}
                      fill={activeStar >= star ? STAR_AMBER : 'none'}
                      color={activeStar >= star ? STAR_AMBER : C.border}
                    />
                  </button>
                ))}
              </div>
              {selectedStar > 0 && (
                <p style={{ color: STAR_AMBER, fontSize: '13px', fontWeight: '600' }}>
                  {['', 'Mengecewakan', 'Kurang memuaskan', 'Cukup baik', 'Bagus!', 'Luar biasa! 🎉'][selectedStar]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: C.textMuted, display: 'block', marginBottom: '8px' }}>Komentar (opsional)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Ceritakan pengalamanmu bekerja sama dengan freelancer ini..."
                style={{ width: '100%', padding: '12px 14px', backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textDark, fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '90px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedStar || submitting}
              style={{ width: '100%', padding: '14px', backgroundColor: selectedStar && !submitting ? C.primary : C.bgLavenderStrong, color: selectedStar ? 'white' : C.textMuted, border: 'none', borderRadius: R.sm, fontSize: '15px', fontWeight: '700', cursor: selectedStar && !submitting ? 'pointer' : 'not-allowed' }}>
              {submitting ? 'Mengirim...' : 'Kirim Rating'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
