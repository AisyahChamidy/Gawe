'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import NavbarKlien from '@/components/NavbarKlien'

type Profile = {
  id: string; full_name: string; headline: string; bio: string
  city: string; trust_score: number; skills: string[]; avatar_url: string
  ktp_status: string
}

const navLink: React.CSSProperties = { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }

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
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      Memuat...
    </div>
  )

  if (notFound || !profile) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>👤</div>
      <h1 style={{ fontSize: '24px' }}>Profil tidak ditemukan</h1>
      <a href="/proyek" style={{ color: '#4F6EF7', textDecoration: 'none' }}>← Lihat proyek tersedia</a>
    </div>
  )

  const initials = (profile.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const trustColor = profile.trust_score >= 80 ? '#22D3EE' : profile.trust_score >= 60 ? '#4F6EF7' : '#8B5CF6'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      {loadingAuth ? null : userRole === 'client' ? (
        <NavbarKlien />
      ) : userRole ? (
        <Navbar />
      ) : (
        <div style={{ backgroundColor: 'rgba(10,14,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64, position: 'sticky', top: 0, zIndex: 100 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'white', fontFamily: 'Outfit, sans-serif' }}>Gawe</span>
          </a>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <a href="/#cara-kerja" style={navLink}>Cara Kerja</a>
            <a href="/proyek" style={navLink}>Proyek</a>
            <a href="/auth/masuk" style={navLink}>Masuk</a>
            <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <a href="/auth/daftar" style={{ backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600', padding: '8px 18px', borderRadius: '8px' }}>
              Daftar Gratis
            </a>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px clamp(16px, 4vw, 32px) 80px' }}>

        {/* Profile header card */}
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Avatar */}
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name}
                style={{ width: 80, height: 80, borderRadius: '16px', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '16px', backgroundColor: '#4F6EF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', flexShrink: 0, fontFamily: 'Outfit, sans-serif' }}>
                {initials}
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '800', marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>
                {profile.full_name || 'Freelancer'}
              </h1>
              {profile.headline && (
                <p style={{ color: '#c4cdd6', fontSize: '15px', marginBottom: '6px' }}>{profile.headline}</p>
              )}
              {profile.city && (
                <p style={{ color: '#8892a4', fontSize: '13px' }}>📍 {profile.city}</p>
              )}
              {profile.ktp_status === 'verified' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '3px 10px' }}>
                  <span style={{ fontSize: '11px' }}>🛡️</span>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>Identitas Terverifikasi</span>
                </div>
              )}
              {reviews.length > 0 && (
                <p style={{ fontSize: '13px', color: '#FBBF24', marginTop: '6px', fontWeight: '600' }}>
                  {'⭐'.repeat(Math.round(avgRating))} {avgRating} <span style={{ color: '#8892a4', fontWeight: '400' }}>({reviews.length} ulasan)</span>
                </p>
              )}
            </div>

            {/* Trust Score */}
            <div style={{ backgroundColor: '#0A0E1A', border: `1px solid ${trustColor}`, borderRadius: '12px', padding: '16px 20px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: trustColor, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                {profile.trust_score || 10}
              </div>
              <div style={{ fontSize: '10px', color: '#8892a4', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Trust Score
              </div>
              {/* Progress bar */}
              <div style={{ width: '80px', height: '3px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(profile.trust_score || 10, 100)}%`, height: '100%', backgroundColor: trustColor, borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 240px', gap: '24px', alignItems: 'start' }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Bio */}
            {profile.bio && (
              <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tentang</h2>
                <p style={{ color: '#c4cdd6', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
              </div>
            )}

            {/* Skills */}
            {(profile.skills || []).length > 0 && (
              <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.skills.map((skill: string) => (
                    <span key={skill} style={{ backgroundColor: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', color: '#4F6EF7', fontSize: '13px', padding: '6px 14px', borderRadius: '20px', fontWeight: '500' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Ulasan ({reviews.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {reviews.map((r: any) => (
                    <div key={r.id} style={{ backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px' }}>{r.reviewer_name}</span>
                        <span style={{ color: '#FBBF24', fontSize: '13px' }}>{'⭐'.repeat(r.rating)}</span>
                      </div>
                      {r.comment && <p style={{ color: '#c4cdd6', fontSize: '13px', lineHeight: '1.6' }}>{r.comment}</p>}
                      <p style={{ color: '#8892a4', fontSize: '11px', marginTop: '6px' }}>
                        {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '✅', label: 'Proyek Selesai', value: acceptedCount },
              { icon: '⭐', label: 'Trust Score', value: `${profile.trust_score || 10}/100` },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '4px', fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#8892a4' }}>{s.label}</div>
              </div>
            ))}

            <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#8892a4', marginBottom: '12px' }}>Butuh freelancer seperti ini?</p>
              <a href="/auth/daftar" style={{ display: 'block', backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                Post Proyek →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
