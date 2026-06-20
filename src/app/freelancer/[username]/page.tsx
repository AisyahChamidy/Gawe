'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import NavbarKlien from '@/components/NavbarKlien'
import { User, MapPin, ShieldCheck, Star, CheckCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

type Profile = {
  id: string; full_name: string; headline: string; bio: string
  city: string; trust_score: number; skills: string[]; avatar_url: string
  ktp_status: string
}

export default function FreelancerProfilePage() {
  const params = useParams()
  const freelancerId = params.username as string
  const supabase = createClient()

  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [acceptedCount, setAccepted]   = useState(0)
  const [reviews,      setReviews]     = useState<any[]>([])
  const [avgRating,    setAvgRating]   = useState(0)
  const [loading,      setLoading]     = useState(true)
  const [notFound,     setNotFound]    = useState(false)
  const [userRole,     setUserRole]    = useState<string | null>(null)
  const [loadingAuth,  setLoadingAuth] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: prof }, { count }, { data: revData }, { data: { user } }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', freelancerId).single(),
        supabase.from('applications').select('id', { count: 'exact', head: true })
          .eq('freelancer_id', freelancerId).eq('status', 'accepted'),
        supabase.from('reviews').select('*').eq('reviewee_id', freelancerId)
          .order('created_at', { ascending: false }).limit(5),
        supabase.auth.getUser(),
      ])
      if (user) {
        const { data: roleData } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setUserRole(roleData?.role || 'freelancer')
      }
      setLoadingAuth(false)
      if (!prof) { setNotFound(true); setLoading(false); return }
      setProfile(prof)
      setAccepted(count || 0)

      if (revData && revData.length > 0) {
        const reviewerIds = [...new Set(revData.map((r: any) => r.reviewer_id))]
        const { data: reviewerProfiles } = await supabase
          .from('profiles').select('id, full_name').in('id', reviewerIds)
        const nameMap: Record<string, string> = {}
        ;(reviewerProfiles || []).forEach((p: any) => { nameMap[p.id] = p.full_name || 'Pengguna' })
        const enriched = revData.map((r: any) => ({ ...r, reviewer_name: nameMap[r.reviewer_id] || 'Pengguna' }))
        setReviews(enriched)
        setAvgRating(Math.round((enriched.reduce((s: number, r: any) => s + r.rating, 0) / enriched.length) * 10) / 10)
      }
      setLoading(false)
    }
    load()
  }, [freelancerId])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>
      Memuat...
    </div>
  )

  if (notFound || !profile) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.textDark, gap: '16px', fontFamily: theme.fonts.body }}>
      <User size={48} strokeWidth={1.5} color={C.textMuted} />
      <h1 style={{ fontSize: '24px', color: C.textDark }}>Profil tidak ditemukan</h1>
      <a href="/proyek" style={{ color: C.primary, textDecoration: 'none' }}>← Lihat proyek tersedia</a>
    </div>
  )

  const initials = (profile.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const trustColor = profile.trust_score >= 80 ? C.success : profile.trust_score >= 60 ? C.primary : C.textMuted

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <style>{`
        @media (max-width: 767px) {
          .fl-main-grid { grid-template-columns: 1fr !important; }
          .fl-sidebar   { order: -1; display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .fl-cta-card  { grid-column: 1 / -1; }
          .pub-nav-hide { display: none !important; }
        }
      `}</style>
      {loadingAuth ? null : userRole === 'client' ? (
        <NavbarKlien />
      ) : userRole ? (
        <Navbar />
      ) : (
        <div style={{ backgroundColor: C.bgWhite, borderBottom: `1px solid ${C.border}`, padding: '0 clamp(16px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64, position: 'sticky', top: 0, zIndex: 100 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: C.primary, fontFamily: theme.fonts.headline }}>Gawe</span>
          </a>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="/#cara-kerja" className="pub-nav-hide" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Cara Kerja</a>
            <a href="/proyek" className="pub-nav-hide" style={{ color: C.primary, textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Proyek</a>
            <a href="/auth/masuk" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Masuk</a>
            <div className="pub-nav-hide" style={{ width: 1, height: 20, backgroundColor: C.border }} />
            <a href="/auth/daftar" style={{ backgroundColor: C.primary, color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600', padding: '8px 18px', borderRadius: R.sm }}>
              Daftar Gratis
            </a>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px clamp(16px, 4vw, 32px) 80px' }}>

        {/* Profile header card */}
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, padding: '32px', marginBottom: '24px', boxShadow: theme.shadow.card }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Avatar */}
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name}
                style={{ width: 80, height: 80, borderRadius: R.md, objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: R.md, backgroundColor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', flexShrink: 0, fontFamily: theme.fonts.headline, color: 'white' }}>
                {initials}
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '800', marginBottom: '6px', fontFamily: theme.fonts.headline, color: C.textDark }}>
                {profile.full_name || 'Freelancer'}
              </h1>
              {profile.headline && (
                <p style={{ color: C.textMuted, fontSize: '15px', marginBottom: '6px' }}>{profile.headline}</p>
              )}
              {profile.city && (
                <p style={{ color: C.textMuted, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} strokeWidth={1.5} /> {profile.city}
                </p>
              )}
              {profile.ktp_status === 'verified' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px', backgroundColor: C.successTint, border: `1px solid ${C.success}33`, borderRadius: R.pill, padding: '3px 10px' }}>
                  <ShieldCheck size={11} strokeWidth={1.5} color={C.success} />
                  <span style={{ fontSize: '11px', color: C.success, fontWeight: '600' }}>Identitas Terverifikasi</span>
                </div>
              )}
              {reviews.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  {Array.from({ length: Math.round(avgRating) }).map((_, i) => (
                    <Star key={i} size={13} strokeWidth={1.5} fill="#FBBF24" color="#FBBF24" />
                  ))}
                  <span style={{ fontSize: '13px', color: '#FBBF24', fontWeight: '600', marginLeft: '2px' }}>{avgRating}</span>
                  <span style={{ fontSize: '13px', color: C.textMuted }}>({reviews.length} ulasan)</span>
                </div>
              )}
            </div>

            {/* Trust Score */}
            <div style={{ backgroundColor: C.bgLavenderSoft, border: `1px solid ${trustColor}`, borderRadius: R.md, padding: '16px 20px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: trustColor, fontFamily: theme.fonts.mono, lineHeight: 1 }}>
                {profile.trust_score || 10}
              </div>
              <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Trust Score
              </div>
              <div style={{ width: '80px', height: '3px', backgroundColor: C.bgLavenderStrong, borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(profile.trust_score || 10, 100)}%`, height: '100%', backgroundColor: trustColor, borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="fl-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 240px', gap: '24px', alignItems: 'start' }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Bio */}
            {profile.bio && (
              <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tentang</h2>
                <p style={{ color: C.textDark, fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
              </div>
            )}

            {/* Skills */}
            {(profile.skills || []).length > 0 && (
              <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.skills.map((skill: string) => (
                    <span key={skill} style={{ backgroundColor: C.primaryTint, border: `1px solid ${C.primaryBorder}`, color: C.primary, fontSize: '13px', padding: '6px 14px', borderRadius: R.pill, fontWeight: '500' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Ulasan ({reviews.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {reviews.map((r: any) => (
                    <div key={r.id} style={{ backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.sm, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: C.textDark }}>{r.reviewer_name}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} size={12} strokeWidth={1.5} fill="#FBBF24" color="#FBBF24" />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p style={{ color: C.textDark, fontSize: '13px', lineHeight: '1.6' }}>{r.comment}</p>}
                      <p style={{ color: C.textMuted, fontSize: '11px', marginTop: '6px' }}>
                        {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — stats */}
          <div className="fl-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { Icon: CheckCircle, label: 'Proyek Selesai', value: acceptedCount,                          color: C.success },
              { Icon: Star,        label: 'Trust Score',   value: `${profile.trust_score || 10}/100`,      color: C.primary },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px', boxShadow: theme.shadow.card }}>
                <div style={{ marginBottom: '8px' }}>
                  <s.Icon size={22} strokeWidth={1.5} color={s.color} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: C.textDark, marginBottom: '4px', fontFamily: theme.fonts.mono }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: C.textMuted }}>{s.label}</div>
              </div>
            ))}

            <div className="fl-cta-card" style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px', textAlign: 'center', boxShadow: theme.shadow.card }}>
              <p style={{ fontSize: '13px', color: C.textMuted, marginBottom: '12px' }}>Butuh freelancer seperti ini?</p>
              <a href="/auth/daftar" style={{ display: 'block', backgroundColor: C.primary, color: 'white', textDecoration: 'none', padding: '10px', borderRadius: R.sm, fontSize: '13px', fontWeight: '700' }}>
                Post Proyek →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
