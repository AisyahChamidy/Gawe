'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'
import { ChevronDown } from 'lucide-react'

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
  open:        { label: 'Menerima Lamaran',  color: '#4F6EF7', bg: 'rgba(79,110,247,0.15)'   },
  in_review:   { label: 'Seleksi Freelancer',color: '#F59E0B', bg: 'rgba(245,158,11,0.15)'   },
  funded:      { label: 'Didanai',           color: '#22D3EE', bg: 'rgba(34,211,238,0.15)'   },
  in_progress: { label: 'Sedang Dikerjakan', color: '#22D3EE', bg: 'rgba(34,211,238,0.15)'   },
  submitted:   { label: 'Menunggu Review',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)'   },
  revision:    { label: 'Perlu Revisi',      color: '#EF4444', bg: 'rgba(239,68,68,0.15)'    },
  completed:   { label: 'Selesai ✓',        color: '#10B981', bg: 'rgba(16,185,129,0.15)'   },
  cancelled:   { label: 'Dibatalkan',        color: '#EF4444', bg: 'rgba(239,68,68,0.15)'    },
}

const ACTION_STATUSES = new Set(['in_review','submitted','revision','completed'])

export default function KlienProyekPage() {
  const [projects,          setProjects]          = useState<Project[]>([])
  const [reviewedIds,       setReviewedIds]       = useState<ReviewedSet>(new Set())
  const [loading,           setLoading]           = useState(true)
  const [actionLoading,     setActionLoading]     = useState<string | null>(null)
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [expandedAppIds,    setExpandedAppIds]    = useState<Set<string>>(new Set())
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => { fetchProjects() }, [])

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
    setExpandedProjectId(merged[0]?.id ?? null)

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
    await fetchProjects()
    setActionLoading(null)
  }

  async function handleTolak(appId: string) {
    setActionLoading(appId)
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', appId)
    await fetchProjects()
    setActionLoading(null)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <NavbarKlien />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '900px', margin: '0 auto' }}>

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, margin: 0 }}>Proyekku</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '6px', marginBottom: 0 }}>
              {loading ? 'Memuat...' : `${projects.length} proyek diposting`}
            </p>
          </div>
          <a href="/klien/post-proyek" style={{
            background: '#4F6EF7', color: 'white', textDecoration: 'none',
            borderRadius: '10px', padding: '10px 20px',
            fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap',
          }}>
            + Post Proyek
          </a>
        </div>

        {/* ── States ────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ color: '#8892a4', textAlign: 'center', padding: '60px' }}>Memuat...</div>
        ) : projects.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Belum ada proyek yang dipost.</p>
            <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '20px' }}>Mulai posting proyek dan temukan freelancer yang tepat!</p>
            <a href="/klien/post-proyek" style={{ display: 'inline-block', padding: '10px 20px', background: '#4F6EF7', color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
              + Post Proyek Pertamamu
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map(project => {
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
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: isExpanded ? '14px 14px 0 0' : '14px',
                      padding: '18px 24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Left: category + title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        background: 'rgba(79,110,247,0.12)', color: '#4F6EF7',
                        fontSize: '11px', padding: '2px 9px', borderRadius: '20px',
                        display: 'inline-block', marginBottom: '5px',
                      }}>
                        {project.category}
                      </span>
                      <div style={{ fontSize: '15px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.title}
                      </div>
                    </div>

                    {/* Center: budget */}
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#22D3EE', flexShrink: 0 }}>
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
                        color: 'rgba(255,255,255,0.4)',
                        display: 'flex', alignItems: 'center',
                      }}>
                        <ChevronDown size={18} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* ── Card body ── */}
                  {isExpanded && (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderTop: 'none',
                      borderRadius: '0 0 14px 14px',
                      padding: '0 24px 20px',
                    }}>

                      {/* Action buttons */}
                      {hasActions && (
                        <div style={{ paddingTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          {project.status === 'in_review' && (
                            <a href={`/klien/proyek/${project.id}/bayar`}
                              style={{ padding: '8px 16px', background: '#10B981', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                              💰 Danai Proyek
                            </a>
                          )}
                          {project.status === 'submitted' && (
                            <a href={`/klien/proyek/${project.id}/review`}
                              style={{ padding: '8px 16px', background: '#8B5CF6', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                              🔍 Review Hasil
                            </a>
                          )}
                          {project.status === 'revision' && (
                            <a href={`/klien/proyek/${project.id}/review`}
                              style={{ padding: '8px 16px', background: '#f59e0b', color: '#0A0E1A', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                              ↩ Lihat Revisi
                            </a>
                          )}
                          {project.status === 'completed' && (
                            reviewedIds.has(project.id) ? (
                              <span style={{ fontSize: '12px', color: '#10B981', padding: '6px 14px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600 }}>
                                ✓ Sudah Dirating
                              </span>
                            ) : (
                              <a href={`/klien/proyek/${project.id}/rating`}
                                style={{ padding: '8px 16px', background: '#FBBF24', color: '#0A0E1A', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                                ⭐ Beri Rating
                              </a>
                            )
                          )}
                        </div>
                      )}

                      {/* Divider */}
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: hasActions ? '0 0 16px' : '16px 0' }} />

                      {/* Applicants label */}
                      <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: '12px' }}>
                        Pelamar ({apps.length})
                      </div>

                      {apps.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', padding: '8px 0 4px' }}>
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
                                background: '#0A0E1A',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '12px',
                                padding: '14px 16px',
                                display: 'flex',
                                gap: '12px',
                              }}>
                                {/* Avatar */}
                                <div style={{
                                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                  background: 'rgba(79,110,247,0.15)',
                                  border: '1px solid rgba(79,110,247,0.25)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '15px', fontWeight: 700, color: '#4F6EF7',
                                }}>
                                  {initial}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {/* Name + trust score + time */}
                                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '2px' }}>
                                    <a href={`/freelancer/${app.freelancer_id}`}
                                      style={{ fontWeight: 600, fontSize: '14px', color: 'white', textDecoration: 'none' }}
                                      onMouseEnter={e => (e.currentTarget.style.color = '#4F6EF7')}
                                      onMouseLeave={e => (e.currentTarget.style.color = 'white')}>
                                      {app.freelancer_name} ↗
                                    </a>
                                    {app.trust_score !== null && (
                                      <span style={{ background: 'rgba(79,110,247,0.12)', color: '#4F6EF7', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 500 }}>
                                        TS {app.trust_score}
                                      </span>
                                    )}
                                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                                      {formatRelativeDate(app.created_at)}
                                    </span>
                                  </div>

                                  {/* Headline */}
                                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>
                                    {app.headline || 'Freelancer'}
                                  </div>

                                  {/* Cover letter */}
                                  {coverLetter && (
                                    <div style={{ marginBottom: '10px' }}>
                                      <div style={isAppExpanded ? {
                                        fontSize: '13px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                                      } : {
                                        fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6,
                                        overflow: 'hidden', display: '-webkit-box',
                                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                      } as React.CSSProperties}>
                                        {coverLetter}
                                      </div>
                                      {coverLetter.length > 150 && (
                                        <button onClick={() => toggleAppExpand(app.id)}
                                          style={{ marginTop: '3px', background: 'none', border: 'none', color: '#4F6EF7', fontSize: '12px', cursor: 'pointer', padding: 0 }}>
                                          {isAppExpanded ? 'Sembunyikan' : 'Lihat selengkapnya'}
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {/* Action buttons */}
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {app.status === 'pending' ? (
                                      <>
                                        <button onClick={() => handleTerima(app.id, project.id, app.freelancer_id)} disabled={actionLoading === app.id}
                                          style={{ padding: '6px 14px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === app.id ? 0.7 : 1 }}>
                                          Terima
                                        </button>
                                        <button onClick={() => handleTolak(app.id)} disabled={actionLoading === app.id}
                                          style={{ padding: '6px 14px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === app.id ? 0.7 : 1 }}>
                                          Tolak
                                        </button>
                                      </>
                                    ) : app.status === 'accepted' ? (
                                      <>
                                        <a href={'/klien/proyek/' + project.id}
                                          style={{ padding: '5px 12px', background: '#4F6EF7', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                                          💬 Chat
                                        </a>
                                        <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
                                          ✓ Diterima
                                        </span>
                                      </>
                                    ) : (
                                      <span style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
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
      </div>
    </div>
  )
}
