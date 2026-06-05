'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Project = { id: string; title: string; description: string; category: string; budget_min: number; budget_max: number; estimated_days: number; skills_required: string[]; created_at: string }

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) }

const KATEGORI = ['Desain Grafis','Web Development','Social Media','Penulisan & Copywriting','Video & Animasi','Data & Riset','Terjemahan','Administrasi']

export default function ProyekPublikPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.from('projects').select('*').eq('status', 'open').order('created_at', { ascending: false })
      .then(({ data }) => { setProjects(data || []); setLoading(false) })
  }, [])

  async function handleLamar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/masuk'); return }
    router.push('/app/jelajah')
  }

  const filtered = projects.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())) &&
    (!kategori || p.category === kategori)
  )

  const navLink: React.CSSProperties = { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <div style={{ backgroundColor: 'rgba(10,14,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64, position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'white', fontFamily: 'Outfit, sans-serif' }}>Gawe</span>
        </a>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <a href="/#cara-kerja" style={navLink}>Cara Kerja</a>
          <a href="/proyek" style={{ ...navLink, color: 'white', fontWeight: '600' }}>Proyek</a>
          <a href="/auth/masuk" style={navLink}>Masuk</a>
          <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <a href="/auth/daftar" style={{ backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600', padding: '8px 18px', borderRadius: '8px' }}>
            Daftar Gratis
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Proyek Tersedia</h1>
        <p style={{ color: '#8892a4', marginBottom: '28px' }}>
          {loading ? 'Memuat...' : `${filtered.length} proyek menunggu freelancer seperti kamu`}
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari proyek..."
            style={{ flex: 1, minWidth: 200, padding: '10px 14px', backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }} />
          <select value={kategori} onChange={e => setKategori(e.target.value)}
            style={{ padding: '10px 14px', backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '8px', color: kategori ? 'white' : '#8892a4', fontSize: '14px', outline: 'none' }}>
            <option value="">Semua kategori</option>
            {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          {(search || kategori) && (
            <button onClick={() => { setSearch(''); setKategori('') }}
              style={{ padding: '10px 14px', backgroundColor: 'transparent', border: '1px solid #1e2d4a', borderRadius: '8px', color: '#8892a4', cursor: 'pointer', fontSize: '14px' }}>
              Reset
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#8892a4', padding: '80px' }}>Memuat proyek...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8892a4', padding: '80px', backgroundColor: '#131929', borderRadius: '12px', border: '1px solid #1e2d4a' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p>Tidak ada proyek yang cocok.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(project => (
              <div key={project.id} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ backgroundColor: '#1a2340', color: '#4F6EF7', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', display: 'inline-block' }}>{project.category}</span>
                    <a href={`/proyek/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h2 style={{ fontSize: '18px', margin: '8px 0 0', fontWeight: 'bold', cursor: 'pointer' }}>{project.title}</h2>
                    </a>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                    <div style={{ color: '#22D3EE', fontWeight: 'bold', fontSize: '16px' }}>{fmt(project.budget_min)} – {fmt(project.budget_max)}</div>
                    <div style={{ color: '#8892a4', fontSize: '12px', marginTop: '4px' }}>{project.estimated_days} hari</div>
                  </div>
                </div>
                <p style={{ color: '#8892a4', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{project.description}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {(project.skills_required || []).map(skill => (
                    <span key={skill} style={{ backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', color: '#8892a4', fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}>{skill}</span>
                  ))}
                </div>
                <button onClick={handleLamar}
                  style={{ backgroundColor: '#4F6EF7', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Lamar Proyek
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '48px', backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Mau lamar proyek ini?</h2>
          <p style={{ color: '#8892a4', marginBottom: '24px' }}>Daftar gratis dan mulai bangun portofoliomu di Gawe.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/auth/daftar" style={{ backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px' }}>Daftar Gratis</a>
            <a href="/auth/masuk" style={{ backgroundColor: 'transparent', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', border: '1px solid rgba(255,255,255,0.15)' }}>Sudah punya akun</a>
          </div>
        </div>
      </div>
    </div>
  )
}
