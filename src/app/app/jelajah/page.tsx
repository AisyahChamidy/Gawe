'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const KATEGORI = ['Semua','Desain Grafis','Web Development','Social Media','Penulisan Konten','Video Editing','UI/UX Design','Translasi','Data Entry','Lainnya']
type Project = { id: string; title: string; description: string; category: string; budget_min: number; budget_max: number; estimated_days: number; skills_required: string[]; created_at: string }
const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function JelajahPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filtered, setFiltered] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('Semua')
  const [budgetMax, setBudgetMax] = useState(5000000)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('projects').select('*').eq('status', 'open').order('created_at', { ascending: false })
      setProjects(data || [])
      setFiltered(data || [])
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: apps } = await supabase.from('applications').select('project_id').eq('freelancer_id', user.id)
        setAppliedIds((apps || []).map((a: any) => a.project_id))
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    let r = projects
    if (kategori !== 'Semua') r = r.filter(p => p.category === kategori)
    if (search.trim()) r = r.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    r = r.filter(p => p.budget_min <= budgetMax)
    setFiltered(r)
  }, [search, kategori, budgetMax, projects])

  async function handleLamar(projectId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/masuk'); return }
    setApplyingId(projectId)
    const { error } = await supabase.from('applications').insert({ project_id: projectId, freelancer_id: user.id, cover_letter: '', status: 'pending' })
    if (!error) setAppliedIds(prev => [...prev, projectId])
    setApplyingId(null)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Jelajah Proyek</h1>
        <p style={{ color: '#8892a4', marginBottom: '24px' }}>{loading ? 'Memuat...' : filtered.length + ' proyek tersedia'}</p>

        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <input type="text" placeholder="Cari proyek atau skill..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
              {KATEGORI.map(k => (
                <button key={k} onClick={() => setKategori(k)}
                  style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid', borderColor: kategori === k ? '#4F6EF7' : '#1e2d4a', backgroundColor: kategori === k ? 'rgba(79,110,247,0.2)' : 'transparent', color: kategori === k ? '#4F6EF7' : '#8892a4' }}>
                  {k}
                </button>
              ))}
            </div>
            <select value={budgetMax} onChange={e => setBudgetMax(Number(e.target.value))}
              style={{ backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '6px', color: 'white', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
              <option value={500000}>Maks Rp500rb</option>
              <option value={1000000}>Maks Rp1jt</option>
              <option value={2000000}>Maks Rp2jt</option>
              <option value={5000000}>Maks Rp5jt</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#8892a4', textAlign: 'center', padding: '60px' }}>Memuat proyek...</div>
        ) : filtered.length === 0 ? (
          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#8892a4' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p>Tidak ada proyek yang cocok.</p>
            <button onClick={() => { setSearch(''); setKategori('Semua'); setBudgetMax(5000000) }}
              style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#4F6EF7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              Reset Filter
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(project => {
              const sudahDilamar = appliedIds.includes(project.id)
              const sedangMelamar = applyingId === project.id
              return (
                <div key={project.id} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ backgroundColor: '#1a2340', color: '#4F6EF7', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', display: 'inline-block' }}>{project.category}</span>
                      <h2 style={{ fontSize: '18px', margin: '8px 0 0', fontWeight: 'bold' }}>{project.title}</h2>
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
                  <button onClick={() => !sudahDilamar && handleLamar(project.id)} disabled={sudahDilamar || sedangMelamar}
                    style={{ backgroundColor: sudahDilamar ? '#1a2340' : '#4F6EF7', color: sudahDilamar ? '#4F6EF7' : 'white', border: sudahDilamar ? '1px solid #4F6EF7' : 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', cursor: sudahDilamar ? 'default' : 'pointer' }}>
                    {sedangMelamar ? 'Mengirim...' : sudahDilamar ? '✓ Sudah Dilamar' : 'Lamar Proyek'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
