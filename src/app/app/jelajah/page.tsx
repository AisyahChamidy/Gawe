'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Clock, Users } from 'lucide-react'

const KATEGORI = ['Semua','Desain Grafis','Web Development','Social Media','Penulisan Konten','Video Editing','UI/UX Design','Terjemahan','Data Entry','Lainnya']
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
  const [sortBy, setSortBy] = useState('terbaru')
  const [pelamarCount, setPelamarCount] = useState<Record<string, number>>({})
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [coverLetterError, setCoverLetterError] = useState('')
  const [proposedBudget, setProposedBudget] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('projects').select('*').eq('status', 'open').order('created_at', { ascending: false })
      const projs = data || []
      setProjects(projs)
      setFiltered(projs)

      if (projs.length > 0) {
        const { data: apps } = await supabase
          .from('applications')
          .select('project_id')
          .in('project_id', projs.map((p: Project) => p.id))
        const counts: Record<string, number> = {}
        for (const app of (apps || [])) {
          counts[app.project_id] = (counts[app.project_id] || 0) + 1
        }
        setPelamarCount(counts)
      }

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
    r = r.filter(p => p.budget_max <= budgetMax)
    if (sortBy === 'harga-tertinggi') r = [...r].sort((a, b) => b.budget_max - a.budget_max)
    else if (sortBy === 'harga-terendah') r = [...r].sort((a, b) => a.budget_min - b.budget_min)
    else if (sortBy === 'deadline') r = [...r].sort((a, b) => a.estimated_days - b.estimated_days)
    else r = [...r].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setFiltered(r)
  }, [search, kategori, budgetMax, sortBy, projects])

  function openModal(project: Project) {
    setSelectedProject(project)
    setCoverLetter('')
    setCoverLetterError('')
    setProposedBudget('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setSelectedProject(null)
    setCoverLetter('')
    setCoverLetterError('')
    setProposedBudget('')
  }

  async function handleSubmit() {
    if (coverLetter.trim().length < 20) {
      setCoverLetterError('Minimal 20 karakter.')
      return
    }
    if (!selectedProject) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/masuk'); return }

    setApplyingId(selectedProject.id)

    const payload: Record<string, unknown> = {
      project_id: selectedProject.id,
      freelancer_id: user.id,
      cover_letter: coverLetter.trim(),
      status: 'pending',
    }
    if (proposedBudget) payload.proposed_budget = parseInt(proposedBudget)

    let { error } = await supabase.from('applications').insert(payload)

    if (error && proposedBudget) {
      const { error: err2 } = await supabase.from('applications').insert({
        project_id: selectedProject.id,
        freelancer_id: user.id,
        cover_letter: coverLetter.trim(),
        status: 'pending',
      })
      error = err2
    }

    if (!error) {
      setAppliedIds(prev => [...prev, selectedProject.id])
      closeModal()
    }
    setApplyingId(null)
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }

  const clampStyle: React.CSSProperties = {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <style>{`
        @media (max-width: 640px) {
          .filter-scroll { flex-wrap: nowrap !important; overflow-x: auto !important; padding-bottom: 4px; }
          .filter-scroll::-webkit-scrollbar { display: none; }
        }
        .modal-textarea::placeholder { color: rgba(255,255,255,0.3); }
        .modal-input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
      <Navbar />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Jelajah Proyek</h1>
        <p style={{ color: '#8892a4', marginBottom: '24px' }}>{loading ? 'Memuat...' : filtered.length + ' proyek tersedia'}</p>

        {/* Filter panel */}
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <input type="text" placeholder="Cari proyek atau skill..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="filter-scroll" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
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
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'white', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>
              <option value="terbaru">Terbaru</option>
              <option value="harga-tertinggi">Harga Tertinggi</option>
              <option value="harga-terendah">Harga Terendah</option>
              <option value="deadline">Deadline Terdekat</option>
            </select>
          </div>
        </div>

        {/* Project list */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(project => {
              const sudahDilamar = appliedIds.includes(project.id)
              const sedangMelamar = applyingId === project.id
              const isHovered = hoveredId === project.id
              const skills = project.skills_required || []
              const visibleSkills = skills.slice(0, 3)
              const extraSkills = skills.length - 3
              const pelamar = pelamarCount[project.id] || 0

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/proyek/${project.id}`)}
                  onMouseEnter={() => setHoveredId(project.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    background: isHovered ? 'rgba(79,110,247,0.04)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isHovered ? 'rgba(79,110,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top row: category badge + budget */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ background: 'rgba(79,110,247,0.12)', color: '#4F6EF7', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 500 }}>
                      {project.category}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#22D3EE' }}>
                      {fmt(project.budget_min)} – {fmt(project.budget_max)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'white', margin: '0 0 6px', ...clampStyle }}>
                    {project.title}
                  </h2>

                  {/* Description */}
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 14px', lineHeight: '1.6', ...clampStyle }}>
                    {project.description}
                  </p>

                  {/* Skill tags */}
                  {visibleSkills.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {visibleSkills.map(skill => (
                        <span key={skill} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px' }}>
                          {skill}
                        </span>
                      ))}
                      {extraSkills > 0 && (
                        <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px' }}>
                          +{extraSkills} lagi
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom row: meta + button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} strokeWidth={1.5} color="rgba(255,255,255,0.4)" />
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{project.estimated_days} hari</span>
                      <span style={{ display: 'inline-block', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 2px' }} />
                      <Users size={13} strokeWidth={1.5} color="rgba(255,255,255,0.4)" />
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{pelamar} pelamar</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); if (!sudahDilamar && !sedangMelamar) openModal(project) }}
                      disabled={sudahDilamar || sedangMelamar}
                      style={{
                        background: sudahDilamar ? 'transparent' : '#4F6EF7',
                        color: sudahDilamar ? 'rgba(255,255,255,0.5)' : 'white',
                        border: sudahDilamar ? '1px solid rgba(255,255,255,0.2)' : 'none',
                        borderRadius: '8px',
                        padding: '8px 18px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: sudahDilamar ? 'default' : 'pointer',
                        flexShrink: 0,
                      }}>
                      {sedangMelamar ? 'Mengirim...' : sudahDilamar ? '✓ Sudah Dilamar' : 'Lamar Proyek'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedProject && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0F1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', maxWidth: '520px', width: '100%' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Kirim Lamaran</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>{selectedProject.title}</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                Kenapa kamu cocok untuk proyek ini? <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="modal-textarea"
                  value={coverLetter}
                  onChange={e => { setCoverLetter(e.target.value.slice(0, 500)); setCoverLetterError('') }}
                  placeholder="Ceritakan pengalamanmu yang relevan, skill yang kamu miliki, atau pendekatan yang akan kamu gunakan..."
                  style={{ ...inp, minHeight: '120px', resize: 'vertical', paddingBottom: '24px' }}
                />
                <span style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  {coverLetter.length}/500
                </span>
              </div>
              {coverLetterError && (
                <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>{coverLetterError}</p>
              )}
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                Harga Penawaran (Rp)
              </label>
              <input
                className="modal-input"
                type="number"
                value={proposedBudget}
                onChange={e => setProposedBudget(e.target.value)}
                placeholder="contoh: 500000"
                min={selectedProject.budget_min}
                max={selectedProject.budget_max}
                style={inp}
              />
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                Budget klien: {fmt(selectedProject.budget_min)} – {fmt(selectedProject.budget_max)}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={closeModal}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', cursor: 'pointer' }}>
                Batalkan
              </button>
              <button
                onClick={handleSubmit}
                disabled={applyingId === selectedProject.id}
                style={{ background: '#4F6EF7', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                {applyingId === selectedProject.id ? 'Mengirim...' : 'Kirim Lamaran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
