'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Project = {
  id: string
  title: string
  description: string
  category: string
  budget_min: number
  budget_max: number
  estimated_days: number
  skills_required: string[]
  created_at: string
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function JelajahPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      // Ambil semua proyek
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      setProjects(projectsData || [])

      // Cek lamaran yang sudah dikirim user ini
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: apps } = await supabase
          .from('applications')
          .select('project_id')
          .eq('freelancer_id', user.id)

        setAppliedIds((apps || []).map(a => a.project_id))
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleLamar(projectId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/masuk')
      return
    }

    setApplyingId(projectId)

    const { error } = await supabase.from('applications').insert({
      project_id: projectId,
      freelancer_id: user.id,
      cover_letter: '',
      status: 'pending',
    })

    if (!error) {
      setAppliedIds(prev => [...prev, projectId])
    }

    setApplyingId(null)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      {/* Navbar */}
      <div style={{
        backgroundColor: '#131929',
        borderBottom: '1px solid #1e2d4a',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4F6EF7' }}>Gawe</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="/app/dasbor" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '14px' }}>Dashboard</a>
          <a href="/app/jelajah" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Jelajah Proyek</a>
          <a href="/app/lamaran" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '14px' }}>Lamaranku</a>
        </div>
      </div>

      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Jelajah Proyek</h1>
        <p style={{ color: '#8892a4', marginBottom: '32px' }}>
          {loading ? 'Memuat...' : `${projects.length} proyek tersedia`}
        </p>

        {loading ? (
          <div style={{ color: '#8892a4', textAlign: 'center', padding: '60px' }}>Memuat proyek...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projects.map(project => {
              const sudahDilamar = appliedIds.includes(project.id)
              const sedangMelamar = applyingId === project.id

              return (
                <div key={project.id} style={{
                  backgroundColor: '#131929',
                  border: '1px solid #1e2d4a',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{
                        backgroundColor: '#1a2340',
                        color: '#4F6EF7',
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        marginBottom: '8px',
                        display: 'inline-block'
                      }}>
                        {project.category}
                      </span>
                      <h2 style={{ fontSize: '18px', margin: '8px 0 0', fontWeight: 'bold' }}>
                        {project.title}
                      </h2>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                      <div style={{ color: '#22D3EE', fontWeight: 'bold', fontSize: '16px' }}>
                        {formatRupiah(project.budget_min)} – {formatRupiah(project.budget_max)}
                      </div>
                      <div style={{ color: '#8892a4', fontSize: '12px', marginTop: '4px' }}>
                        {project.estimated_days} hari
                      </div>
                    </div>
                  </div>

                  <p style={{ color: '#8892a4', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                    {project.description}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {project.skills_required.map(skill => (
                      <span key={skill} style={{
                        backgroundColor: '#0A0E1A',
                        border: '1px solid #1e2d4a',
                        color: '#8892a4',
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => !sudahDilamar && handleLamar(project.id)}
                    disabled={sudahDilamar || sedangMelamar}
                    style={{
                      backgroundColor: sudahDilamar ? '#1a2340' : '#4F6EF7',
                      color: sudahDilamar ? '#4F6EF7' : 'white',
                      border: sudahDilamar ? '1px solid #4F6EF7' : 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: sudahDilamar ? 'default' : 'pointer',
                    }}
                  >
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