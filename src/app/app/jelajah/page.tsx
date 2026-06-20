'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Clock, Users, Search } from 'lucide-react'
import { calculateMatchScore } from '@/utils/matchScore'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

const STATUS_RED   = '#EF4444'

const KATEGORI = ['Semua','Desain Grafis','Web Development','Social Media','Penulisan Konten','Video Editing','UI/UX Design','Terjemahan','Data Entry','Lainnya']
type Project = { id: string; title: string; description: string; category: string; budget_min: number; budget_max: number; estimated_days: number; skills_required: string[]; created_at: string }
const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

function MatchBadge({ score }: { score: number }) {
  if (score >= 85) return (
    <span style={{ background: C.primary, color: 'white', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {score}% Cocok
    </span>
  )
  if (score >= 70) return (
    <span style={{ background: C.primaryTint, border: `1px solid ${C.primaryBorder}`, color: C.primary, borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {score}% Cocok
    </span>
  )
  return (
    <span style={{ background: C.bgLavenderSoft, border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {score}% Cocok
    </span>
  )
}

export default function JelajahPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filtered, setFiltered] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('Semua')
  const [budgetMax, setBudgetMax] = useState(5000000)
  const [sortBy, setSortBy] = useState('paling-cocok')
  const [pelamarCount, setPelamarCount] = useState<Record<string, number>>({})
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [freelancerSkills, setFreelancerSkills] = useState<string[]>([])
  const [freelancerTrustScore, setFreelancerTrustScore] = useState(10)

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
        const [{ data: apps }, { data: prof }] = await Promise.all([
          supabase.from('applications').select('project_id').eq('freelancer_id', user.id),
          supabase.from('profiles').select('skills, trust_score').eq('id', user.id).single(),
        ])
        setAppliedIds((apps || []).map((a: any) => a.project_id))
        if (prof) {
          setFreelancerSkills(prof.skills || [])
          setFreelancerTrustScore(prof.trust_score || 10)
        }
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
    if (sortBy === 'paling-cocok') {
      r = [...r].sort((a, b) => {
        const sa = calculateMatchScore({ freelancerSkills, trustScore: freelancerTrustScore, project: { skillsRequired: a.skills_required || [], category: a.category, budgetMin: a.budget_min, budgetMax: a.budget_max } })
        const sb = calculateMatchScore({ freelancerSkills, trustScore: freelancerTrustScore, project: { skillsRequired: b.skills_required || [], category: b.category, budgetMin: b.budget_min, budgetMax: b.budget_max } })
        return sb - sa
      })
    } else if (sortBy === 'harga-tertinggi') r = [...r].sort((a, b) => b.budget_max - a.budget_max)
    else if (sortBy === 'harga-terendah') r = [...r].sort((a, b) => a.budget_min - b.budget_min)
    else if (sortBy === 'deadline') r = [...r].sort((a, b) => a.estimated_days - b.estimated_days)
    else r = [...r].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setFiltered(r)
  }, [search, kategori, budgetMax, sortBy, projects, freelancerSkills, freelancerTrustScore])

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
    width: '100%', background: C.bgWhite, border: `1px solid ${C.border}`,
    borderRadius: R.sm, padding: '12px', color: C.textDark, fontSize: '14px',
    outline: 'none', boxSizing: 'border-box', fontFamily: theme.fonts.body,
  }

  const clampStyle: React.CSSProperties = {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <style>{`
        .pill-scroll { overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
        .pill-scroll::-webkit-scrollbar { display: none; }
        .modal-textarea::placeholder { color: ${C.textTertiary}; }
        .modal-input::placeholder { color: ${C.textTertiary}; }
      `}</style>
      <Navbar />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: C.textDark, fontFamily: theme.fonts.headline }}>Jelajah Proyek</h1>
        <p style={{ color: C.textMuted, marginBottom: '24px', fontSize: '14px' }}>{loading ? 'Memuat...' : filtered.length + ' proyek tersedia'}</p>

        {/* Filter panel */}
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px', marginBottom: '24px', boxShadow: theme.shadow.card }}>
          {/* Search bar */}
          <input type="text" placeholder="Cari proyek atau skill..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textDark, fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '20px' }} />

          {/* Kategori */}
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, fontWeight: 600, marginBottom: '8px' }}>
            Kategori
          </div>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <div className="pill-scroll" style={{ display: 'flex', gap: '6px', overflowX: 'auto', flexWrap: 'nowrap' }}>
              {KATEGORI.map(k => (
                <button key={k} onClick={() => setKategori(k)}
                  style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                    border: '1px solid', flexShrink: 0, whiteSpace: 'nowrap',
                    borderColor: kategori === k ? C.primary : C.primaryBorder,
                    backgroundColor: kategori === k ? C.primary : 'transparent',
                    color: kategori === k ? 'white' : C.textMuted,
                    fontFamily: theme.fonts.body,
                  }}>
                  {k}
                </button>
              ))}
            </div>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '48px', background: `linear-gradient(to right, transparent, ${C.bgWhite})`, pointerEvents: 'none', zIndex: 1 }} />
          </div>

          {/* Urutkan & Budget */}
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, fontWeight: 600, marginBottom: '8px' }}>
            Urutkan & Budget
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={budgetMax} onChange={e => setBudgetMax(Number(e.target.value))}
              style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textDark, padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}>
              <option value={500000}>Maks Rp500rb</option>
              <option value={1000000}>Maks Rp1jt</option>
              <option value={2000000}>Maks Rp2jt</option>
              <option value={5000000}>Maks Rp5jt</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textDark, padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}>
              <option value="paling-cocok">Paling Cocok</option>
              <option value="terbaru">Terbaru</option>
              <option value="harga-tertinggi">Harga Tertinggi</option>
              <option value="harga-terendah">Harga Terendah</option>
              <option value="deadline">Deadline Terdekat</option>
            </select>
          </div>
        </div>

        {/* Project list */}
        {loading ? (
          <div style={{ color: C.textMuted, textAlign: 'center', padding: '60px' }}>Memuat proyek...</div>
        ) : filtered.length === 0 ? (
          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, padding: '60px', textAlign: 'center', boxShadow: theme.shadow.card }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <Search size={40} strokeWidth={1} color={C.textTertiary} />
            </div>
            <p style={{ color: C.textMuted }}>Tidak ada proyek yang cocok.</p>
            <button onClick={() => { setSearch(''); setKategori('Semua'); setBudgetMax(5000000) }}
              style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: R.sm, cursor: 'pointer', fontSize: '13px', fontFamily: theme.fonts.body }}>
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
              const matchScore = calculateMatchScore({
                freelancerSkills,
                trustScore: freelancerTrustScore,
                project: {
                  skillsRequired: project.skills_required || [],
                  category: project.category,
                  budgetMin: project.budget_min,
                  budgetMax: project.budget_max,
                },
              })

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/proyek/${project.id}`)}
                  onMouseEnter={() => setHoveredId(project.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    background: isHovered ? C.bgLavenderSoft : C.bgWhite,
                    border: `1px solid ${isHovered ? C.primaryBorder : C.border}`,
                    borderRadius: R.lg,
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isHovered ? theme.shadow.hover : theme.shadow.card,
                  }}
                >
                  {/* Top row: category + match badge + budget */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ background: C.primaryTint, color: C.primary, borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {project.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <MatchBadge score={matchScore} />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: C.primary, fontFamily: theme.fonts.mono, whiteSpace: 'nowrap' }}>
                        {fmt(project.budget_min)} – {fmt(project.budget_max)}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: '17px', fontWeight: 600, color: C.textDark, margin: '0 0 6px', ...clampStyle }}>
                    {project.title}
                  </h2>

                  {/* Description */}
                  <p style={{ fontSize: '13px', color: C.textMuted, margin: '0 0 14px', lineHeight: '1.6', ...clampStyle }}>
                    {project.description}
                  </p>

                  {/* Skill tags */}
                  {visibleSkills.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {visibleSkills.map(skill => {
                        const matched = freelancerSkills.some(fs =>
                          fs.toLowerCase().includes(skill.toLowerCase()) ||
                          skill.toLowerCase().includes(fs.toLowerCase())
                        )
                        return (
                          <span key={skill} style={{
                            background: matched ? C.primaryTint : C.bgLavenderSoft,
                            color: matched ? C.primary : C.textMuted,
                            border: matched ? `1px solid ${C.primaryBorder}` : `1px solid ${C.border}`,
                            borderRadius: '6px', padding: '3px 8px', fontSize: '11px',
                          }}>
                            {skill}
                          </span>
                        )
                      })}
                      {extraSkills > 0 && (
                        <span style={{ background: C.bgLavenderSoft, color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '3px 8px', fontSize: '11px' }}>
                          +{extraSkills} lagi
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom row: meta + button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} strokeWidth={1.5} color={C.textMuted} />
                      <span style={{ fontSize: '12px', color: C.textMuted }}>{project.estimated_days} hari</span>
                      <span style={{ display: 'inline-block', width: '3px', height: '3px', borderRadius: '50%', background: C.border, margin: '0 2px' }} />
                      <Users size={13} strokeWidth={1.5} color={C.textMuted} />
                      <span style={{ fontSize: '12px', color: C.textMuted }}>{pelamar} pelamar</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); if (!sudahDilamar && !sedangMelamar) openModal(project) }}
                      disabled={sudahDilamar || sedangMelamar}
                      style={{
                        background: sudahDilamar ? 'transparent' : C.primary,
                        color: sudahDilamar ? C.textMuted : 'white',
                        border: sudahDilamar ? `1px solid ${C.border}` : 'none',
                        borderRadius: R.sm, padding: '8px 18px', fontSize: '13px',
                        fontWeight: 500, cursor: sudahDilamar ? 'default' : 'pointer', flexShrink: 0,
                        fontFamily: theme.fonts.body,
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
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, padding: 'clamp(20px, 5vw, 32px)', maxWidth: '520px', width: '100%', boxShadow: theme.shadow.hover }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: C.textDark, marginBottom: '4px' }}>Kirim Lamaran</h2>
            <p style={{ fontSize: '14px', color: C.textMuted, marginBottom: '24px' }}>{selectedProject.title}</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: C.textDark, marginBottom: '6px' }}>
                Kenapa kamu cocok untuk proyek ini? <span style={{ color: STATUS_RED }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="modal-textarea"
                  value={coverLetter}
                  onChange={e => { setCoverLetter(e.target.value.slice(0, 500)); setCoverLetterError('') }}
                  placeholder="Ceritakan pengalamanmu yang relevan, skill yang kamu miliki, atau pendekatan yang akan kamu gunakan..."
                  style={{ ...inp, minHeight: '120px', resize: 'vertical', paddingBottom: '24px' }}
                />
                <span style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '12px', color: C.textTertiary }}>
                  {coverLetter.length}/500
                </span>
              </div>
              {coverLetterError && (
                <p style={{ color: STATUS_RED, fontSize: '13px', marginTop: '4px' }}>{coverLetterError}</p>
              )}
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: C.textDark, marginBottom: '6px' }}>
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
              <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '6px' }}>
                Budget klien: {fmt(selectedProject.budget_min)} – {fmt(selectedProject.budget_max)}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={closeModal}
                style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.textDark, borderRadius: R.sm, padding: '10px 20px', fontSize: '14px', cursor: 'pointer', fontFamily: theme.fonts.body }}>
                Batalkan
              </button>
              <button
                onClick={handleSubmit}
                disabled={applyingId === selectedProject.id}
                style={{ background: C.primary, color: 'white', border: 'none', borderRadius: R.sm, padding: '10px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: theme.fonts.body }}>
                {applyingId === selectedProject.id ? 'Mengirim...' : 'Kirim Lamaran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
