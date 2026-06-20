'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import NavbarKlien from '@/components/NavbarKlien'
import { Search, X } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

type Project = { id: string; title: string; description: string; category: string; budget_min: number; budget_max: number; estimated_days: number; skills_required: string[]; created_at: string }

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) }

const KATEGORI = ['Desain Grafis','Web Development','Social Media','Penulisan & Copywriting','Video & Animasi','Data & Riset','Terjemahan','Administrasi']

export default function ProyekPublikPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data }, { data: { user: u } }] = await Promise.all([
        supabase.from('projects').select('*').eq('status', 'open').order('created_at', { ascending: false }),
        supabase.auth.getUser(),
      ])
      setProjects(data || [])
      setLoading(false)
      if (u) {
        setUser(u)
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', u.id).single()
        setUserRole(profile?.role || 'freelancer')
      }
      setLoadingAuth(false)
    }
    load()
  }, [])

  const filtered = projects.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())) &&
    (!kategori || p.category === kategori)
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <style>{`
        .pill-scroll-pub { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
        .pill-scroll-pub::-webkit-scrollbar { display: none; }
        input::placeholder { color: #AFA9EC; }
        @media (max-width: 767px) {
          .pub-nav-hide    { display: none !important; }
          .proj-card-top   { flex-wrap: wrap !important; }
          .proj-card-right { margin-left: 0 !important; }
        }
      `}</style>

      {loadingAuth ? null : userRole === 'client' ? (
        <NavbarKlien />
      ) : userRole ? (
        <Navbar />
      ) : (
        <div style={{ backgroundColor: C.bgWhite, borderBottom: `1px solid ${C.border}`, padding: '0 clamp(16px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64, position: 'sticky', top: 0, zIndex: 100 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: C.textDark, fontFamily: theme.fonts.headline }}>Gawe</span>
          </a>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="/#cara-kerja" className="pub-nav-hide" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Cara Kerja</a>
            <a href="/proyek" className="pub-nav-hide" style={{ color: C.primary, textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Proyek</a>
            <a href="/auth/masuk" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Masuk</a>
            <div className="pub-nav-hide" style={{ width: 1, height: 20, backgroundColor: C.border }} />
            <a href="/auth/daftar" style={{ backgroundColor: C.primary, color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 18px', borderRadius: R.sm }}>
              Daftar Gratis
            </a>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: C.textDark, fontFamily: theme.fonts.headline }}>Proyek Tersedia</h1>
        <p style={{ color: C.textMuted, marginBottom: '28px' }}>
          {loading ? 'Memuat...' : `${filtered.length} proyek menunggu freelancer seperti kamu`}
        </p>

        {/* Filter panel */}
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '16px 20px', marginBottom: '28px', boxShadow: theme.shadow.card }}>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Search size={16} strokeWidth={1.5} color={C.textTertiary} />
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari proyek..."
              style={{ width: '100%', padding: '9px 12px 9px 38px', backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textDark, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Category pills */}
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, fontWeight: 600, marginBottom: '8px' }}>
            Kategori
          </div>
          <div style={{ position: 'relative' }}>
            <div className="pill-scroll-pub">
              {['', ...KATEGORI].map(k => {
                const isActive = kategori === k
                return (
                  <button key={k} onClick={() => setKategori(k)}
                    style={{
                      flexShrink: 0, whiteSpace: 'nowrap',
                      padding: '5px 14px', borderRadius: R.pill, fontSize: '12px',
                      fontWeight: isActive ? 600 : 500, cursor: 'pointer',
                      backgroundColor: isActive ? C.primary : C.bgLavenderSoft,
                      color: isActive ? 'white' : C.textMuted,
                      border: isActive ? 'none' : `1px solid ${C.border}`,
                    }}>
                    {k || 'Semua'}
                  </button>
                )
              })}
            </div>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 48, background: `linear-gradient(to right, transparent, ${C.bgWhite})`, pointerEvents: 'none' }} />
          </div>

          {/* Reset */}
          {(search || kategori) && (
            <button onClick={() => { setSearch(''); setKategori('') }}
              style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'transparent', border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textMuted, cursor: 'pointer', fontSize: '12px' }}>
              <X size={12} strokeWidth={1.5} />
              Reset filter
            </button>
          )}
        </div>

        {/* Project list */}
        {loading ? (
          <div style={{ textAlign: 'center', color: C.textMuted, padding: '80px' }}>Memuat proyek...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.textMuted, padding: '80px', backgroundColor: C.bgLavenderSoft, borderRadius: R.md, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', opacity: 0.3 }}>
              <Search size={40} strokeWidth={1} color={C.textDark} />
            </div>
            <p style={{ margin: 0 }}>Tidak ada proyek yang cocok.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(project => (
              <div key={project.id} style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
                <div className="proj-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ backgroundColor: C.primaryTint, color: C.primary, fontSize: '12px', padding: '4px 10px', borderRadius: '20px', display: 'inline-block' }}>{project.category}</span>
                    <a href={`/proyek/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h2 style={{ fontSize: '18px', margin: '8px 0 0', fontWeight: 700, cursor: 'pointer', color: C.textDark }}>{project.title}</h2>
                    </a>
                  </div>
                  <div className="proj-card-right" style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                    <div style={{ color: C.primary, fontWeight: 700, fontSize: '14px', fontFamily: theme.fonts.mono, whiteSpace: 'nowrap' }}>{fmt(project.budget_min)} – {fmt(project.budget_max)}</div>
                    <div style={{ color: C.textMuted, fontSize: '12px', marginTop: '4px' }}>{project.estimated_days} hari</div>
                  </div>
                </div>
                <p style={{ color: C.textMuted, fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{project.description}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {(project.skills_required || []).map(skill => (
                    <span key={skill} style={{ backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, color: C.textMuted, fontSize: '12px', padding: '4px 10px', borderRadius: R.sm }}>{skill}</span>
                  ))}
                </div>
                <a href={`/proyek/${project.id}`}
                  style={{ display: 'inline-block', backgroundColor: C.primary, color: 'white', textDecoration: 'none', borderRadius: R.sm, padding: '10px 20px', fontSize: '14px', fontWeight: 700 }}>
                  Lihat & Lamar
                </a>
              </div>
            ))}
          </div>
        )}

        {/* CTA Bottom */}
        <div style={{ marginTop: '48px', position: 'relative', overflow: 'hidden', borderRadius: R.lg, padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: C.meshBase }} />
          <div style={{ position: 'absolute', top: '-20%', right: '-20%', bottom: '-20%', left: '-20%', background: theme.gradients.darkMesh, filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: 'white', fontFamily: theme.fonts.headline }}>Mau lamar proyek ini?</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '24px', fontSize: '15px' }}>Daftar gratis dan mulai bangun portofoliomu di Gawe.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/auth/daftar" style={{ backgroundColor: C.primary, color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: R.sm, fontWeight: 700, fontSize: '15px' }}>Daftar Gratis</a>
              <a href="/auth/masuk" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: R.sm, fontWeight: 600, fontSize: '15px', border: '1px solid rgba(255,255,255,0.2)' }}>Sudah punya akun</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
