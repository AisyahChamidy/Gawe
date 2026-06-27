'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'
import { ChevronDown, Zap, ClipboardList, Wallet, Search, Star, MessageCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

const STATUS_RED   = '#EF4444'
const STATUS_AMBER = '#F59E0B'

type Application = {
  id: string
  status: string
  created_at: string
  freelancer_id: string
  freelancer_name: string
  trust_score: number | null
  headline: string | null
  cover_letter: string | null
}
type Project = { id: string; title: string; category: string; budget_min: number; budget_max: number; status: string; applications: Application[] }
type ReviewedSet = Set<string>

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function formatRelativeDate(dateStr: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return '1 hari lalu'
  return `${diffDays} hari lalu`
}

const projectStatusBadge: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Menerima Lamaran',   color: C.primary,    bg: C.primaryTint       },
  in_review:   { label: 'Pilih Freelancer',   color: STATUS_AMBER, bg: STATUS_AMBER + '26' },
  funded:      { label: 'Didanai',            color: C.primary,    bg: C.primaryTint       },
  in_progress: { label: 'Sedang Dikerjakan',  color: C.primary,    bg: C.primaryTint       },
  submitted:   { label: 'Menunggu Reviewmu',  color: C.primary,    bg: C.primaryTint       },
  revision:    { label: 'Perlu Revisi Ulang', color: STATUS_RED,   bg: STATUS_RED + '1A'   },
  completed:   { label: 'Selesai ✓',         color: C.success,    bg: C.successTint       },
  cancelled:   { label: 'Dibatalkan',         color: STATUS_RED,   bg: STATUS_RED + '1A'   },
}

const ACTION_STATUSES = new Set(['in_review', 'submitted', 'revision', 'completed'])

const TAB_STATUSES: Record<string, string[]> = {
  'perlu-tindakan': ['in_review', 'submitted', 'revision'],
  'aktif':          ['open', 'funded', 'in_progress'],
  'selesai':        ['completed', 'cancelled'],
  'semua':          [],
}

const TABS = [
  { key: 'perlu-tindakan', label: 'Perlu Tindakan' },
  { key: 'aktif',          label: 'Aktif'           },
  { key: 'selesai',        label: 'Selesai'         },
  { key: 'semua',          label: 'Semua'           },
]

export default function KlienProyekPage() {
  const [projects,          setProjects]          = useState<Project[]>([])
  const [reviewedIds,       setReviewedIds]       = useState<ReviewedSet>(new Set())
  const [loading,           setLoading]           = useState(true)
  const [actionLoading,     setActionLoading]     = useState<string | null>(null)
  const [activeTab,         setActiveTab]         = useState<string>('perlu-tindakan')
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [expandedAppIds,    setExpandedAppIds]    = useState<Set<string>>(new Set())
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => { fetchProjects() }, [])

  function getFiltered(projs: Project[], tab: string): Project[] {
    if (tab === 'semua') return projs
    const statuses = TAB_STATUSES[tab] || []
    return projs.filter(p => statuses.includes(p.status))
  }

  function switchTab(tab: string) {
    setActiveTab(tab)
    const list = getFiltered(projects, tab)
    setExpandedProjectId(list[0]?.id ?? null)
  }

  function toggleProject(id: string) {
    setExpandedProjectId(prev => prev === id ? null : id)
  }

  function toggleAppExpand(id: string) {
    setExpandedAppIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function fetchProjects() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/masuk'); return }

    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (prof?.role !== 'client' && prof?.role !== 'both') { router.push('/app/dasbor'); return }

    const { data: projectsData, error: projError } = await supabase
      .from('projects')
      .select('id, title, category, budget_min, budget_max, status')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (projError || !projectsData) { setLoading(false); return }

    const projectIds = projectsData.map((p: any) => p.id)
    const appsByProject: Record<string, any[]> = {}
    if (projectIds.length > 0) {
      const { data: appsData } = await supabase
        .from('applications')
        .select('id, status, created_at, freelancer_id, project_id, cover_letter')
        .in('project_id', projectIds)
      ;(appsData || []).forEach((a: any) => {
        if (!appsByProject[a.project_id]) appsByProject[a.project_id] = []
        appsByProject[a.project_id].push(a)
      })
    }

    const allApps = Object.values(appsByProject).flat()
    const ids = [...new Set(allApps.map((a: any) => a.freelancer_id))]
    type ProfileInfo = { name: string; trust_score: number | null; headline: string | null }
    const profileMap: Record<string, ProfileInfo> = {}
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, trust_score, headline')
        .in('id', ids)
      ;(profiles || []).forEach((p: any) => {
        profileMap[p.id] = {
          name:        p.full_name || p.id.slice(0, 8),
          trust_score: p.trust_score ?? null,
          headline:    p.headline || null,
        }
      })
    }

    const merged = projectsData.map((p: any) => ({
      ...p,
      applications: (appsByProject[p.id] || []).map((a: any) => ({
        ...a,
        freelancer_name: profileMap[a.freelancer_id]?.name       ?? 'Pengguna',
        trust_score:     profileMap[a.freelancer_id]?.trust_score ?? null,
        headline:        profileMap[a.freelancer_id]?.headline    ?? null,
        cover_letter:    a.cover_letter ?? null,
      })),
    }))

    setProjects(merged)

    // Default tab: "Perlu Tindakan" if has items, else "Aktif"
    const urgentList = merged.filter((p: Project) => TAB_STATUSES['perlu-tindakan'].includes(p.status))
    const defaultTab  = urgentList.length > 0 ? 'perlu-tindakan' : 'aktif'
    const defaultList = urgentList.length > 0
      ? urgentList
      : merged.filter((p: Project) => TAB_STATUSES['aktif'].includes(p.status))
    setActiveTab(defaultTab)
    setExpandedProjectId(defaultList[0]?.id ?? null)

    const completedIds = projectsData.filter((p: any) => p.status === 'completed').map((p: any) => p.id)
    if (completedIds.length > 0) {
      const { data: revData } = await supabase
        .from('reviews').select('project_id').eq('reviewer_id', user.id).in('project_id', completedIds)
      setReviewedIds(new Set((revData || []).map((r: any) => r.project_id)))
    }
    setLoading(false)
  }

  async function handleTerima(appId: string, projectId: string, freelancerId: string) {
    setActionLoading(appId)
    await supabase.from('applications').update({ status: 'accepted' }).eq('id', appId)
    await supabase.from('projects').update({ status: 'in_review', selected_freelancer_id: freelancerId }).eq('id', projectId)
    // Trigger #1 — notifikasi ke freelancer, silent jika gagal
    try {
      const projectTitle = projects.find(p => p.id === projectId)?.title || 'proyek'
      await supabase.from('notifications').insert({
        user_id: freelancerId,
        type: 'application_accepted',
        title: 'Lamaran diterima',
        body: `Lamaranmu untuk "${projectTitle}" telah diterima oleh klien.`,
        action_url: '/app/lamaran',
      })
    } catch (e) {
      console.error('[notif] gagal insert application_accepted:', e)
    }
    await fetchProjects()
    setActionLoading(null)
  }

  async function handleTolak(appId: string) {
    setActionLoading(appId)
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', appId)
    await fetchProjects()
    setActionLoading(null)
  }

  // Derived values
  const counts: Record<string, number> = {
    'perlu-tindakan': projects.filter(p => TAB_STATUSES['perlu-tindakan'].includes(p.status)).length,
    'aktif':          projects.filter(p => TAB_STATUSES['aktif'].includes(p.status)).length,
    'selesai':        projects.filter(p => TAB_STATUSES['selesai'].includes(p.status)).length,
    'semua':          projects.length,
  }
  const filteredProjects = getFiltered(projects, activeTab)
  const urgentCount      = counts['perlu-tindakan']

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <NavbarKlien />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '900px', margin: '0 auto' }}>

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, margin: 0, color: C.textDark, fontFamily: theme.fonts.headline }}>Proyekku</h1>
            <p style={{ color: C.textMuted, marginTop: '6px', marginBottom: 0 }}>
              {loading ? 'Memuat...' : `${projects.length} proyek diposting`}
            </p>
          </div>
          <a href="/klien/post-proyek" style={{
            background: C.primary, color: 'white', textDecoration: 'none',
            borderRadius: R.sm, padding: '10px 20px',
            fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap',
          }}>
            + Post Proyek
          </a>
        </div>

        {loading ? (
          <div style={{ color: C.textMuted, textAlign: 'center', padding: '60px' }}>Memuat...</div>
        ) : projects.length === 0 ? (
          <div style={{ background: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, padding: '60px', textAlign: 'center', boxShadow: theme.shadow.card }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <ClipboardList size={48} strokeWidth={0.8} color={C.textTertiary} />
            </div>
            <p style={{ color: C.textDark, fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Belum ada proyek yang dipost.</p>
            <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '20px' }}>Mulai posting proyek dan temukan freelancer yang tepat!</p>
            <a href="/klien/post-proyek" style={{ display: 'inline-block', padding: '10px 20px', background: C.primary, color: 'white', borderRadius: R.sm, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
              + Post Proyek Pertamamu
            </a>
          </div>
        ) : (
          <>
            {/* ── Tabs ─────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.key
                return (
                  <button key={tab.key} onClick={() => switchTab(tab.key)}
                    style={{
                      padding: '6px 16px', borderRadius: R.sm, fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', border: '1px solid',
                      background:   isActive ? C.primary        : 'transparent',
                      borderColor:  isActive ? C.primary        : C.primaryBorder,
                      color:        isActive ? 'white'          : C.textMuted,
                      transition: 'all 0.15s ease',
                      fontFamily: theme.fonts.body,
                    }}>
                    {tab.label} ({counts[tab.key]})
                  </button>
                )
              })}
            </div>

            {/* ── Urgent banner (persistent when not on perlu-tindakan tab) ── */}
            {urgentCount > 0 && activeTab !== 'perlu-tindakan' && (
              <div
                onClick={() => switchTab('perlu-tindakan')}
                style={{
                  background: STATUS_AMBER + '18', border: `1px solid ${STATUS_AMBER}33`,
                  color: STATUS_AMBER, borderRadius: R.sm, padding: '10px 16px',
                  marginBottom: '16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                <Zap size={14} strokeWidth={1.5} />
                {urgentCount} proyek menunggu tindakanmu
              </div>
            )}

            {/* ── Banner saat di tab Perlu Tindakan ── */}
            {urgentCount > 0 && activeTab === 'perlu-tindakan' && (
              <div style={{
                background: STATUS_AMBER + '18', border: `1px solid ${STATUS_AMBER}33`,
                color: STATUS_AMBER, borderRadius: R.sm, padding: '10px 16px',
                marginBottom: '16px', fontSize: '13px', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <Zap size={14} strokeWidth={1.5} />
                {urgentCount} proyek menunggu tindakanmu
              </div>
            )}

            {/* ── Project list ─────────────────────────────────────────── */}
            {filteredProjects.length === 0 ? (
              <div style={{ background: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.lg, padding: '48px 24px', textAlign: 'center', color: C.textMuted, fontSize: '14px' }}>
                Tidak ada proyek di kategori ini.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredProjects.map(project => {
                  const badge      = projectStatusBadge[project.status] || projectStatusBadge.open
                  const isExpanded = expandedProjectId === project.id
                  const apps       = project.applications || []
                  const hasActions = ACTION_STATUSES.has(project.status)

                  return (
                    <div key={project.id}>

                      {/* ── Card header ── */}
                      <div
                        onClick={() => toggleProject(project.id)}
                        style={{
                          background: C.bgWhite,
                          border: `1px solid ${C.border}`,
                          borderRadius: isExpanded ? `${R.md} ${R.md} 0 0` : R.md,
                          padding: '18px 24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          flexWrap: 'wrap',
                          boxShadow: isExpanded ? 'none' : theme.shadow.card,
                        }}
                      >
                        {/* Left: category + title */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            background: C.primaryTint, color: C.primary,
                            fontSize: '11px', padding: '2px 9px', borderRadius: '20px',
                            display: 'inline-block', marginBottom: '5px',
                          }}>
                            {project.category}
                          </span>
                          <div style={{ fontSize: '15px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.textDark }}>
                            {project.title}
                          </div>
                        </div>

                        {/* Center: budget */}
                        <div style={{ fontSize: '14px', fontWeight: 600, color: C.primary, flexShrink: 0, fontFamily: theme.fonts.mono }}>
                          {formatRupiah(project.budget_min)} – {formatRupiah(project.budget_max)}
                        </div>

                        {/* Right: status badge + chevron */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <span style={{
                            background: badge.bg, color: badge.color,
                            fontSize: '12px', padding: '4px 12px',
                            borderRadius: '20px', fontWeight: 600,
                          }}>
                            {badge.label}
                          </span>
                          <div style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            color: C.textMuted,
                            display: 'flex', alignItems: 'center',
                          }}>
                            <ChevronDown size={18} strokeWidth={1.5} />
                          </div>
                        </div>
                      </div>

                      {/* ── Card body ── */}
                      {isExpanded && (
                        <div style={{
                          background: C.bgLavenderSoft,
                          border: `1px solid ${C.border}`,
                          borderTop: 'none',
                          borderRadius: `0 0 ${R.md} ${R.md}`,
                          padding: '0 24px 20px',
                        }}>

                          {/* Action buttons */}
                          {hasActions && (
                            <div style={{ paddingTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                              {project.status === 'in_review' && (
                                <a href={`/klien/proyek/${project.id}/bayar`}
                                  style={{ padding: '8px 16px', background: C.success, color: 'white', borderRadius: R.sm, fontSize: '13px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Wallet size={14} strokeWidth={1.5} />
                                  Danai Proyek
                                </a>
                              )}
                              {project.status === 'submitted' && (
                                <a href={`/klien/proyek/${project.id}/review`}
                                  style={{ padding: '8px 16px', background: C.primary, color: 'white', borderRadius: R.sm, fontSize: '13px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Search size={14} strokeWidth={1.5} />
                                  Review Hasil
                                </a>
                              )}
                              {project.status === 'revision' && (
                                <a href={`/klien/proyek/${project.id}/review`}
                                  style={{ padding: '8px 16px', background: STATUS_AMBER, color: C.textDark, borderRadius: R.sm, fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                                  ↩ Lihat Revisi
                                </a>
                              )}
                              {project.status === 'completed' && (
                                reviewedIds.has(project.id) ? (
                                  <span style={{ fontSize: '12px', color: C.success, padding: '6px 14px', borderRadius: '20px', background: C.successTint, border: `1px solid ${C.success}33`, fontWeight: 600 }}>
                                    ✓ Sudah Dirating
                                  </span>
                                ) : (
                                  <a href={`/klien/proyek/${project.id}/rating`}
                                    style={{ padding: '8px 16px', background: STATUS_AMBER, color: C.textDark, borderRadius: R.sm, fontSize: '13px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <Star size={14} strokeWidth={1.5} />
                                    Beri Rating
                                  </a>
                                )
                              )}
                            </div>
                          )}

                          {/* Divider */}
                          <div style={{ height: '1px', background: C.border, margin: hasActions ? '0 0 16px' : '16px 0' }} />

                          {/* Applicants label */}
                          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, fontWeight: 500, marginBottom: '12px' }}>
                            Pelamar ({apps.length})
                          </div>

                          {apps.length === 0 ? (
                            <p style={{ color: C.textMuted, fontSize: '14px', padding: '8px 0 4px' }}>
                              Belum ada yang melamar proyek ini.
                            </p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {apps.map(app => {
                                const isAppExpanded = expandedAppIds.has(app.id)
                                const coverLetter   = app.cover_letter?.trim() || null
                                const initial       = (app.freelancer_name || 'P')[0].toUpperCase()

                                return (
                                  <div key={app.id} style={{
                                    background: C.bgWhite,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: R.md,
                                    padding: '14px 16px',
                                    display: 'flex',
                                    gap: '12px',
                                    boxShadow: theme.shadow.card,
                                  }}>
                                    {/* Avatar */}
                                    <div style={{
                                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                      background: C.primaryTint,
                                      border: `1px solid ${C.primaryBorder}`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '15px', fontWeight: 700, color: C.primary,
                                    }}>
                                      {initial}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '2px' }}>
                                        <a href={`/freelancer/${app.freelancer_id}`}
                                          style={{ fontWeight: 600, fontSize: '14px', color: C.textDark, textDecoration: 'none' }}
                                          onMouseEnter={e => (e.currentTarget.style.color = C.primary)}
                                          onMouseLeave={e => (e.currentTarget.style.color = C.textDark)}>
                                          {app.freelancer_name} ↗
                                        </a>
                                        {app.trust_score !== null && (
                                          <span style={{ background: C.primaryTint, color: C.primary, borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 500 }}>
                                            TS {app.trust_score}
                                          </span>
                                        )}
                                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: C.textMuted }}>
                                          {formatRelativeDate(app.created_at)}
                                        </span>
                                      </div>

                                      <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '8px' }}>
                                        {app.headline || 'Freelancer'}
                                      </div>

                                      {coverLetter && (
                                        <div style={{ marginBottom: '10px' }}>
                                          <div style={isAppExpanded ? {
                                            fontSize: '13px', color: C.textDark, whiteSpace: 'pre-wrap', lineHeight: 1.6,
                                          } : {
                                            fontSize: '13px', color: C.textDark, lineHeight: 1.6,
                                            overflow: 'hidden', display: '-webkit-box',
                                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                          } as React.CSSProperties}>
                                            {coverLetter}
                                          </div>
                                          {coverLetter.length > 150 && (
                                            <button onClick={() => toggleAppExpand(app.id)}
                                              style={{ marginTop: '3px', background: 'none', border: 'none', color: C.primary, fontSize: '12px', cursor: 'pointer', padding: 0 }}>
                                              {isAppExpanded ? 'Sembunyikan' : 'Lihat selengkapnya'}
                                            </button>
                                          )}
                                        </div>
                                      )}

                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {app.status === 'pending' ? (
                                          <>
                                            <button onClick={() => handleTerima(app.id, project.id, app.freelancer_id)} disabled={actionLoading === app.id}
                                              style={{ padding: '6px 14px', background: C.success, color: 'white', border: 'none', borderRadius: R.sm, fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === app.id ? 0.7 : 1, fontFamily: theme.fonts.body }}>
                                              Terima
                                            </button>
                                            <button onClick={() => handleTolak(app.id)} disabled={actionLoading === app.id}
                                              style={{ padding: '6px 14px', background: 'transparent', color: STATUS_RED, border: `1px solid ${STATUS_RED}`, borderRadius: R.sm, fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === app.id ? 0.7 : 1, fontFamily: theme.fonts.body }}>
                                              Tolak
                                            </button>
                                          </>
                                        ) : app.status === 'accepted' ? (
                                          <>
                                            <a href={'/klien/proyek/' + project.id}
                                              style={{ padding: '5px 12px', background: C.primary, color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                              <MessageCircle size={12} strokeWidth={1.5} />
                                              Chat
                                            </a>
                                            <span style={{ background: C.successTint, color: C.success, fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
                                              ✓ Diterima
                                            </span>
                                          </>
                                        ) : (
                                          <span style={{ background: STATUS_RED + '18', color: STATUS_RED, fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
                                            Ditolak
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
