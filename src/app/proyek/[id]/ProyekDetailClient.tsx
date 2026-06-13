'use client'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import NavbarKlien from '@/components/NavbarKlien'

type Project = {
  id: string; title: string; description: string; category: string
  budget_min: number; budget_max: number; estimated_days: number
  skills_required: string[]; created_at: string; status: string; client_id: string
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
  open:        { label: 'Menerima Lamaran', color: '#4F6EF7', bg: 'rgba(79,110,247,0.12)' },
  in_progress: { label: 'Sedang Berjalan',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  completed:   { label: 'Selesai',          color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  cancelled:   { label: 'Dibatalkan',       color: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
}

const navLinkStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
}

function PublicNavbar() {
  return (
    <div style={{ backgroundColor: 'rgba(10,14,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64, position: 'sticky', top: 0, zIndex: 100 }}>
      <a href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '20px', fontWeight: '800', color: 'white', fontFamily: 'Outfit, sans-serif' }}>Gawe</span>
      </a>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <a href="/#cara-kerja" style={navLinkStyle}>Cara Kerja</a>
        <a href="/proyek" style={{ ...navLinkStyle, color: 'white', fontWeight: '600' }}>Proyek</a>
        <a href="/auth/masuk" style={navLinkStyle}>Masuk</a>
        <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <a href="/auth/daftar" style={{ backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600', padding: '8px 18px', borderRadius: '8px' }}>
          Daftar Gratis
        </a>
      </div>
    </div>
  )
}

export default function ProyekDetailClient({ project }: { project: Project }) {
  const supabase = createClient()

  const [userRole,     setUserRole]     = useState<string | null>(null)
  const [loadingAuth,  setLoadingAuth]  = useState(true)
  const [user,         setUser]         = useState<any>(null)
  const [clientName,   setClientName]   = useState('')
  const [pelamarCount, setPelamarCount] = useState(0)
  const [sudahDilamar, setSudahDilamar] = useState(false)
  const [applying,     setApplying]     = useState(false)
  const [applied,      setApplied]      = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)

      const [{ data: clientProfile }, { count }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', project.client_id).single(),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('project_id', project.id),
      ])
      setClientName(clientProfile?.full_name || 'Klien')
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>

      {/* Navbar: publik saat loading auth, lalu kondisional sesuai role */}
      {loadingAuth
        ? <PublicNavbar />
        : userRole === 'client'
          ? <NavbarKlien />
          : userRole
            ? <Navbar />
            : <PublicNavbar />
      }

      {/* Breadcrumb: Jelajah Proyek untuk freelancer, Semua Proyek untuk publik/klien */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px clamp(16px, 4vw, 32px) 0' }}>
        <a href={userRole === 'freelancer' ? '/app/jelajah' : '/proyek'}
          style={{ color: '#8892a4', textDecoration: 'none', fontSize: '13px' }}>
          ← {userRole === 'freelancer' ? 'Jelajah Proyek' : 'Semua Proyek'}
        </a>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px clamp(16px, 4vw, 32px) 60px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '32px', alignItems: 'start' }}>

        {/* Left */}
        <div>
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span style={{ backgroundColor: '#1a2340', color: '#4F6EF7', fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
                {project.category}
              </span>
              <span style={{ backgroundColor: st.bg, color: st.color, fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
                {st.label}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '800', lineHeight: '1.2', marginBottom: '12px', fontFamily: 'Outfit, sans-serif' }}>
              {project.title}
            </h1>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#8892a4' }}>
              <span>👤 {clientName}</span>
              <span>📅 Dipost {timeAgo(project.created_at)}</span>
              <span>👥 {pelamarCount} pelamar</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#8892a4', marginBottom: '4px' }}>Budget</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#22D3EE' }}>
                {fmt(project.budget_min)} – {fmt(project.budget_max)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8892a4', marginBottom: '4px' }}>Estimasi Waktu</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{project.estimated_days} hari</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Deskripsi Proyek</h2>
            <p style={{ color: '#c4cdd6', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{project.description}</p>
          </div>

          {(project.skills_required || []).length > 0 && (
            <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Skills yang Dibutuhkan</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {project.skills_required.map(skill => (
                  <span key={skill} style={{ backgroundColor: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', color: '#4F6EF7', fontSize: '13px', padding: '6px 14px', borderRadius: '20px', fontWeight: '500' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — sidebar */}
        <div style={{ position: 'sticky', top: '84px' }}>
          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#22D3EE', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>
              {fmt(project.budget_min)}
            </div>
            <div style={{ fontSize: '13px', color: '#8892a4', marginBottom: '20px' }}>
              s.d. {fmt(project.budget_max)} · {project.estimated_days} hari
            </div>

            {sudahDilamar || applied ? (
              <div style={{ width: '100%', padding: '14px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', borderRadius: '10px', color: '#10B981', fontWeight: '700', fontSize: '15px', textAlign: 'center' }}>
                ✓ Sudah Dilamar
              </div>
            ) : project.status !== 'open' ? (
              <div style={{ width: '100%', padding: '14px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '10px', color: '#8892a4', fontSize: '14px', textAlign: 'center' }}>
                Proyek tidak lagi menerima lamaran
              </div>
            ) : user ? (
              <button onClick={handleLamar} disabled={applying}
                style={{ width: '100%', padding: '14px', backgroundColor: applying ? '#2a3a6a' : '#4F6EF7', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: applying ? 'not-allowed' : 'pointer' }}>
                {applying ? 'Mengirim...' : 'Lamar Proyek'}
              </button>
            ) : (
              <a href="/auth/masuk"
                style={{ display: 'block', width: '100%', padding: '14px', backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', textAlign: 'center', boxSizing: 'border-box' }}>
                Masuk untuk Melamar
              </a>
            )}

            {!user && !loadingAuth && (
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#8892a4', marginTop: '12px' }}>
                Belum punya akun?{' '}
                <a href="/auth/daftar" style={{ color: '#4F6EF7', textDecoration: 'none' }}>Daftar gratis</a>
              </p>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #1e2d4a', margin: '20px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#8892a4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Kategori</span>
                <span style={{ color: 'white', fontWeight: '500' }}>{project.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pelamar</span>
                <span style={{ color: 'white', fontWeight: '500' }}>{pelamarCount} orang</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Dipost</span>
                <span style={{ color: 'white', fontWeight: '500' }}>{timeAgo(project.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {!user && !loadingAuth && (
        <div style={{ backgroundColor: '#131929', borderTop: '1px solid #1e2d4a', padding: '40px clamp(16px, 4vw, 32px)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Mau lamar proyek ini?</h2>
          <p style={{ color: '#8892a4', marginBottom: '20px', fontSize: '14px' }}>Daftar gratis di Gawe dan mulai bangun karirmu.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/daftar" style={{ backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: '700', fontSize: '14px' }}>Daftar Gratis</a>
            <a href="/auth/masuk" style={{ backgroundColor: 'transparent', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>Sudah punya akun</a>
          </div>
        </div>
      )}
    </div>
  )
}
