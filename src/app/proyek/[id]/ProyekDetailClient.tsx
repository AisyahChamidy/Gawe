'use client'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { MapPin, User, Calendar, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import NavbarKlien from '@/components/NavbarKlien'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme
const STATUS_RED = '#EF4444'

type Project = {
  id: string; title: string; description: string; category: string
  budget_min: number; budget_max: number; estimated_days: number
  skills_required: string[]; created_at: string; status: string; client_id: string
}

type ClientProfile = {
  full_name: string
  created_at: string
  trust_score: number | null
  city: string | null
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`
  return `${Math.floor(diff / 86400)} hari yang lalu`
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Menerima Lamaran', color: C.primary,  bg: C.primaryTint  },
  in_progress: { label: 'Sedang Berjalan',  color: C.success,  bg: C.successTint  },
  completed:   { label: 'Selesai',          color: C.primary,  bg: C.primaryTint  },
  cancelled:   { label: 'Dibatalkan',       color: STATUS_RED, bg: STATUS_RED + '18' },
}

const navLinkStyle: CSSProperties = {
  color: C.textMuted, textDecoration: 'none', fontSize: '14px', fontWeight: '500',
}

function PublicNavbar() {
  return (
    <div style={{ backgroundColor: C.bgWhite, borderBottom: `1px solid ${C.border}`, padding: '0 clamp(16px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64, position: 'sticky', top: 0, zIndex: 100 }}>
      <a href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '20px', fontWeight: '800', color: C.primary, fontFamily: theme.fonts.headline }}>Gawe</span>
      </a>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <a href="/#cara-kerja" className="pub-nav-hide" style={navLinkStyle}>Cara Kerja</a>
        <a href="/proyek" className="pub-nav-hide" style={{ ...navLinkStyle, color: C.primary, fontWeight: '600' }}>Proyek</a>
        <a href="/auth/masuk" style={navLinkStyle}>Masuk</a>
        <div className="pub-nav-hide" style={{ width: 1, height: 20, backgroundColor: C.border }} />
        <a href="/auth/daftar" style={{ backgroundColor: C.primary, color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600', padding: '8px 18px', borderRadius: R.sm }}>
          Daftar Gratis
        </a>
      </div>
    </div>
  )
}

export default function ProyekDetailClient({
  project,
  clientProfile,
  clientCompletedProjects,
}: {
  project: Project
  clientProfile: ClientProfile | null
  clientCompletedProjects: number
}) {
  const supabase = createClient()

  const [userRole,     setUserRole]     = useState<string | null>(null)
  const [loadingAuth,  setLoadingAuth]  = useState(true)
  const [user,         setUser]         = useState<any>(null)
  const [pelamarCount, setPelamarCount] = useState(0)
  const [sudahDilamar, setSudahDilamar] = useState(false)
  const [applying,     setApplying]     = useState(false)
  const [applied,      setApplied]      = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)

      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', project.id)
      setPelamarCount(count || 0)

      if (u) {
        const [{ data: roleData }, { data: app }] = await Promise.all([
          supabase.from('profiles').select('role').eq('id', u.id).single(),
          supabase.from('applications').select('id').eq('project_id', project.id).eq('freelancer_id', u.id).single(),
        ])
        setUserRole(roleData?.role || 'freelancer')
        setSudahDilamar(!!app)
      }

      setLoadingAuth(false)
    }
    load()
  }, [project.id])

  async function handleLamar() {
    if (!user) { window.location.href = '/auth/masuk'; return }
    setApplying(true)
    const { error } = await supabase.from('applications').insert({
      project_id: project.id, freelancer_id: user.id, cover_letter: '', status: 'pending',
    })
    if (!error) { setSudahDilamar(true); setApplied(true) }
    setApplying(false)
  }

  const st = statusConfig[project.status] || statusConfig.open
  const joinYear = clientProfile ? new Date(clientProfile.created_at).getFullYear() : null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <style>{`
        @media (max-width: 767px) {
          .detail-grid    { grid-template-columns: 1fr !important; }
          .detail-sidebar { position: static !important; top: auto !important; order: -1; }
          .pub-nav-hide   { display: none !important; }
        }
      `}</style>

      {/* Navbar */}
      {loadingAuth
        ? <PublicNavbar />
        : userRole === 'client'
          ? <NavbarKlien />
          : userRole
            ? <Navbar />
            : <PublicNavbar />
      }

      {/* Breadcrumb */}
      {!loadingAuth && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px clamp(16px, 4vw, 32px) 0' }}>
          {userRole === 'freelancer' || userRole === 'both' ? (
            <a href="/app/jelajah" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '13px' }}>
              ← Jelajah Proyek
            </a>
          ) : (
            <a href="/proyek" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '13px' }}>
              ← Semua Proyek
            </a>
          )}
        </div>
      )}

      {/* Main layout */}
      <div className="detail-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px clamp(16px, 4vw, 32px) 60px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '32px', alignItems: 'start' }}>

        {/* Left */}
        <div>
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span style={{ backgroundColor: C.primaryTint, color: C.primary, fontSize: '12px', padding: '4px 12px', borderRadius: R.pill, fontWeight: '600', border: `1px solid ${C.primaryBorder}` }}>
                {project.category}
              </span>
              <span style={{ backgroundColor: st.bg, color: st.color, fontSize: '12px', padding: '4px 12px', borderRadius: R.pill, fontWeight: '600' }}>
                {st.label}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '800', lineHeight: '1.2', marginBottom: '12px', fontFamily: theme.fonts.headline, color: C.textDark }}>
              {project.title}
            </h1>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: C.textMuted, alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={13} strokeWidth={1.5} /> {clientProfile?.full_name || 'Klien'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} strokeWidth={1.5} /> Dipost {timeAgo(project.created_at)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={13} strokeWidth={1.5} /> {pelamarCount} pelamar
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px 24px', marginBottom: '24px', display: 'flex', gap: '32px', flexWrap: 'wrap', boxShadow: theme.shadow.card }}>
            <div>
              <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '4px' }}>Budget</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: C.primary, fontFamily: theme.fonts.mono }}>
                {fmt(project.budget_min)} – {fmt(project.budget_max)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '4px' }}>Estimasi Waktu</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: C.textDark }}>{project.estimated_days} hari</div>
            </div>
          </div>

          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', marginBottom: '24px', boxShadow: theme.shadow.card }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: C.textDark }}>Deskripsi Proyek</h2>
            <p style={{ color: C.textDark, fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{project.description}</p>
          </div>

          {(project.skills_required || []).length > 0 && (
            <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: C.textDark }}>Skills yang Dibutuhkan</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {project.skills_required.map(skill => (
                  <span key={skill} style={{ backgroundColor: C.primaryTint, border: `1px solid ${C.primaryBorder}`, color: C.primary, fontSize: '13px', padding: '6px 14px', borderRadius: R.pill, fontWeight: '500' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — sidebar */}
        <div className="detail-sidebar" style={{ position: 'sticky', top: '84px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Card: budget + lamar */}
          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, padding: '24px', boxShadow: theme.shadow.card }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: C.primary, fontFamily: theme.fonts.mono, marginBottom: '4px' }}>
              {fmt(project.budget_min)}
            </div>
            <div style={{ fontSize: '13px', color: C.textMuted, marginBottom: '20px' }}>
              s.d. {fmt(project.budget_max)} · {project.estimated_days} hari
            </div>

            {sudahDilamar || applied ? (
              <div style={{ width: '100%', padding: '14px', backgroundColor: C.successTint, border: `1px solid ${C.success}33`, borderRadius: R.sm, color: C.success, fontWeight: '700', fontSize: '15px', textAlign: 'center' }}>
                ✓ Sudah Dilamar
              </div>
            ) : project.status !== 'open' ? (
              <div style={{ width: '100%', padding: '14px', backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textMuted, fontSize: '14px', textAlign: 'center' }}>
                Proyek tidak lagi menerima lamaran
              </div>
            ) : user ? (
              <button onClick={handleLamar} disabled={applying}
                style={{ width: '100%', padding: '14px', backgroundColor: applying ? C.bgLavenderStrong : C.primary, color: applying ? C.textMuted : 'white', border: 'none', borderRadius: R.sm, fontWeight: '700', fontSize: '15px', cursor: applying ? 'not-allowed' : 'pointer' }}>
                {applying ? 'Mengirim...' : 'Lamar Proyek'}
              </button>
            ) : (
              <a href="/auth/masuk"
                style={{ display: 'block', width: '100%', padding: '14px', backgroundColor: C.primary, color: 'white', textDecoration: 'none', borderRadius: R.sm, fontWeight: '700', fontSize: '15px', textAlign: 'center', boxSizing: 'border-box' }}>
                Masuk untuk Melamar
              </a>
            )}

            {!user && !loadingAuth && (
              <p style={{ textAlign: 'center', fontSize: '12px', color: C.textMuted, marginTop: '12px' }}>
                Belum punya akun?{' '}
                <a href="/auth/daftar" style={{ color: C.primary, textDecoration: 'none' }}>Daftar gratis</a>
              </p>
            )}

            <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '20px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: C.textMuted }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Kategori</span>
                <span style={{ color: C.textDark, fontWeight: '500' }}>{project.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pelamar</span>
                <span style={{ color: C.textDark, fontWeight: '500' }}>{pelamarCount} orang</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Dipost</span>
                <span style={{ color: C.textDark, fontWeight: '500' }}>{timeAgo(project.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Card: Tentang Klien */}
          {clientProfile && (
            <div style={{ backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.08em', color: C.textMuted, fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                Tentang Klien
              </div>

              <div style={{ fontSize: '15px', fontWeight: '600', color: C.textDark, marginBottom: '4px' }}>
                {clientProfile.full_name}
              </div>

              {clientProfile.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: C.textMuted, marginBottom: '4px' }}>
                  <MapPin size={12} strokeWidth={1.5} />
                  {clientProfile.city}
                </div>
              )}

              <div style={{ height: '1px', background: C.border, margin: '12px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: C.primary, fontFamily: theme.fonts.mono }}>
                    {clientCompletedProjects}
                  </div>
                  <div style={{ fontSize: '11px', color: C.textMuted }}>Proyek Selesai</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: C.primary, fontFamily: theme.fonts.mono }}>
                    {joinYear}
                  </div>
                  <div style={{ fontSize: '11px', color: C.textMuted }}>Bergabung</div>
                </div>
              </div>

              {clientCompletedProjects > 0 ? (
                <span style={{ backgroundColor: C.successTint, color: C.success, borderRadius: R.pill, padding: '3px 10px', fontSize: '12px', fontWeight: '600' }}>
                  ✓ Klien Aktif
                </span>
              ) : (
                <span style={{ backgroundColor: '#F59E0B18', color: '#F59E0B', borderRadius: R.pill, padding: '3px 10px', fontSize: '12px', fontWeight: '600' }}>
                  Klien Baru
                </span>
              )}
            </div>
          )}

        </div>
      </div>

      {!user && !loadingAuth && (
        <div style={{ position: 'relative', overflow: 'hidden', background: C.meshBase, borderTop: `1px solid rgba(255,255,255,0.06)`, padding: '40px clamp(16px, 4vw, 32px)', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-20%', bottom: '-20%', left: '-20%', background: theme.gradients.darkMesh, filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'white', fontFamily: theme.fonts.headline }}>Mau lamar proyek ini?</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '20px', fontSize: '14px' }}>Daftar gratis di Gawe dan mulai bangun karirmu.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/auth/daftar" style={{ backgroundColor: 'white', color: C.primary, textDecoration: 'none', padding: '12px 28px', borderRadius: R.sm, fontWeight: '700', fontSize: '14px' }}>Daftar Gratis</a>
              <a href="/auth/masuk" style={{ backgroundColor: 'transparent', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: R.sm, fontWeight: '600', fontSize: '14px', border: '1px solid rgba(255,255,255,0.3)' }}>Sudah punya akun</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
