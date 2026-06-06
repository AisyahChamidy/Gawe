'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'

type Application = { id: string; status: string; created_at: string; freelancer_id: string; freelancer_name: string }
type Project = { id: string; title: string; category: string; budget_min: number; budget_max: number; status: string; applications: Application[] }

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

const projectStatusBadge: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Menerima Lamaran', color: '#4F6EF7', bg: 'rgba(79,110,247,0.1)' },
  in_review:   { label: 'Seleksi Freelancer', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  funded:      { label: 'Didanai',            color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  in_progress: { label: 'Sedang Dikerjakan',  color: '#4F6EF7', bg: 'rgba(79,110,247,0.1)' },
  submitted:   { label: 'Menunggu Review',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  revision:    { label: 'Perlu Revisi',       color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  completed:   { label: 'Selesai ✓',         color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  cancelled:   { label: 'Dibatalkan',         color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
}

export default function KlienProyekPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading,  setLoading]  = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router  = useRouter()
  const supabase = createClient()

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/masuk'); return }

    const { data: projectsData, error: projError } = await supabase
      .from('projects')
      .select('id, title, category, budget_min, budget_max, status, applications(id, status, created_at, freelancer_id)')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (projError) { setLoading(false); return }
    if (!projectsData) { setLoading(false); return }

    const ids = [...new Set(projectsData.flatMap((p: any) => (p.applications || []).map((a: any) => a.freelancer_id)))]
    let names: Record<string, string> = {}
    if (ids.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids)
      ;(profiles || []).forEach((p: any) => { names[p.id] = p.full_name || p.id.slice(0, 8) })
    }

    setProjects(projectsData.map((p: any) => ({
      ...p,
      applications: (p.applications || []).map((a: any) => ({ ...a, freelancer_name: names[a.freelancer_id] || 'Pengguna' })),
    })))
    setLoading(false)
  }

  async function handleTerima(appId: string, projectId: string, freelancerId: string) {
    setActionLoading(appId)

    await supabase.from('applications').update({ status: 'accepted' }).eq('id', appId)
    await supabase.from('projects').update({
      status: 'in_review',
      selected_freelancer_id: freelancerId,
    }).eq('id', projectId)

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
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Proyekku</h1>
        <p style={{ color: '#8892a4', marginBottom: '32px' }}>
          {loading ? 'Memuat...' : projects.length + ' proyek diposting'}
        </p>
        {loading ? (
          <div style={{ color: '#8892a4', textAlign: 'center', padding: '60px' }}>Memuat...</div>
        ) : projects.length === 0 ? (
          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Belum ada proyek yang dipost.</p>
            <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '20px' }}>Mulai posting proyek dan temukan freelancer yang tepat!</p>
            <a href="/klien/post-proyek" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#8B5CF6', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>+ Post Proyek Pertamamu</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {projects.map(project => {
              const badge = projectStatusBadge[project.status] || projectStatusBadge.open
              return (
                <div key={project.id} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', overflow: 'hidden' }}>
                  {/* Project header */}
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2d4a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ backgroundColor: '#1a2340', color: '#4F6EF7', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>{project.category}</span>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0 4px' }}>{project.title}</h2>
                        <span style={{ color: '#22D3EE', fontSize: '14px' }}>{formatRupiah(project.budget_min)} – {formatRupiah(project.budget_max)}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
                          {badge.label}
                        </span>
                        <span style={{ color: '#8892a4', fontSize: '12px' }}>{project.applications?.length || 0} pelamar</span>
                        {/* Action buttons per status */}
                        {project.status === 'in_review' && (
                          <a href={`/klien/proyek/${project.id}/bayar`}
                            style={{ padding: '6px 14px', backgroundColor: '#10B981', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
                            💰 Danai Proyek
                          </a>
                        )}
                        {project.status === 'submitted' && (
                          <a href={`/klien/proyek/${project.id}/review`}
                            style={{ padding: '6px 14px', backgroundColor: '#8B5CF6', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
                            🔍 Review Hasil
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Applications */}
                  <div style={{ padding: '16px 24px' }}>
                    {!project.applications || project.applications.length === 0 ? (
                      <p style={{ color: '#8892a4', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Belum ada pelamar</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {project.applications.map(app => (
                          <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#0A0E1A', borderRadius: '8px', border: '1px solid #1e2d4a', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{app.freelancer_name}</div>
                              <div style={{ color: '#8892a4', fontSize: '12px', marginTop: '2px' }}>
                                {new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {app.status === 'pending' ? (
                                <>
                                  <button onClick={() => handleTerima(app.id, project.id, app.freelancer_id)} disabled={actionLoading === app.id}
                                    style={{ padding: '6px 14px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', opacity: actionLoading === app.id ? 0.7 : 1 }}>
                                    Terima
                                  </button>
                                  <button onClick={() => handleTolak(app.id)} disabled={actionLoading === app.id}
                                    style={{ padding: '6px 14px', backgroundColor: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', opacity: actionLoading === app.id ? 0.7 : 1 }}>
                                    Tolak
                                  </button>
                                </>
                              ) : app.status === 'accepted' ? (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <a href={'/klien/proyek/' + project.id} style={{ padding: '4px 12px', backgroundColor: '#4F6EF7', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>💬 Chat</a>
                                  <span style={{ backgroundColor: '#152d1e', color: '#10B981', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>✓ Diterima</span>
                                </div>
                              ) : (
                                <span style={{ backgroundColor: '#2d1515', color: '#EF4444', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>Ditolak</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
