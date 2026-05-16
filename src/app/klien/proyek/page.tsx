'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

type Application = {
  id: string
  status: string
  created_at: string
  freelancer_id: string
  freelancer_name: string
}

type Project = {
  id: string
  title: string
  category: string
  budget_min: number
  budget_max: number
  status: string
  applications: Application[]
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export default function KlienProyekPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/masuk'); return }

    // Step 1: ambil projects + applications
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, title, category, budget_min, budget_max, status, applications(id, status, created_at, freelancer_id)')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (!projectsData) { setLoading(false); return }

    // Step 2: ambil semua freelancer_id unik
    const freelancerIds = [...new Set(
      projectsData.flatMap((p: any) => (p.applications || []).map((a: any) => a.freelancer_id))
    )]

    // Step 3: fetch nama dari profiles
    let namesMap: Record<string, string> = {}
    if (freelancerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', freelancerIds)
      
      ;(profiles || []).forEach((p: any) => {
        namesMap[p.id] = p.full_name || 'Anonim'
      })
    }

    // Step 4: gabungkan nama ke aplikasi
    const enriched = projectsData.map((p: any) => ({
      ...p,
      applications: (p.applications || []).map((a: any) => ({
        ...a,
        freelancer_name: namesMap[a.freelancer_id] || 'Pengguna',
      }))
    }))

    setProjects(enriched)
    setLoading(false)
  }

  async function handleTerima(applicationId: string) {
    setActionLoading(applicationId)
    await supabase.from('applications').update({ status: 'accepted' }).eq('id', applicationId)
    await fetchProjects()
    setActionLoading(null)
  }

  async function handleTolak(applicationId: string) {
    setActionLoading(applicationId)
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', applicationId)
    await fetchProjects()
    setActionLoading(null)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Proyekku</h1>
        <p style={{ color: '#8892a4', marginBottom: '32px' }}>
          {loading ? 'Memuat...' : `${projects.length} proyek diposting`}
        </p>

        {loading ? (
          <div style={{ color: '#8892a4', textAlign: 'center', padding: '60px' }}>Memuat...</div>
        ) : projects.length === 0 ? (
          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#8892a4' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
            <p>Belum ada proyek. Yuk post proyek pertamamu!</p>
            <a href="/klien/post-proyek" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 20px', backgroundColor: '#4F6EF7', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              Post Proyek
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {projects.map(project => (
              <div key={project.id} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2d4a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ backgroundColor: '#1a2340', color: '#4F6EF7', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', marginRight: '8px' }}>
                        {project.category}
                      </span>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0 4px' }}>{project.title}</h2>
                      <span style={{ color: '#22D3EE', fontSize: '14px' }}>
                        {formatRupiah(project.budget_min)} – {formatRupiah(project.budget_max)}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#8892a4', fontSize: '13px' }}>{project.applications?.length || 0} pelamar</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px 24px' }}>
                  {!project.applications || project.applications.length === 0 ? (
                    <p style={{ color: '#8892a4', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Belum ada pelamar</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {project.applications.map(app => (
                        <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#0A0E1A', borderRadius: '8px', border: '1px solid #1e2d4a' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{app.freelancer_name}</div>
                            <div style={{ color: '#8892a4', fontSize: '12px', marginTop: '2px' }}>
                              {new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {app.status === 'pending' ? (
                              <>
                                <button onClick={() => handleTerima(app.id)} disabled={actionLoading === app.id}
                                  style={{ padding: '6px 14px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', opacity: actionLoading === app.id ? 0.7 : 1 }}>
                                  Terima
                                </button>
                                <button onClick={() => handleTolak(app.id)} disabled={actionLoading === app.id}
                                  style={{ padding: '6px 14px', backgroundColor: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', opacity: actionLoading === app.id ? 0.7 : 1 }}>
                                  Tolak
                                </button>
                              </>
                            ) : app.status === 'accepted' ? (
                              <span style={{ backgroundColor: '#152d1e', color: '#10B981', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>✓ Diterima</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
