'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

type Lamaran = {
  id: string
  status: string
  created_at: string
  projects: {
    id: string
    title: string
    category: string
    budget_min: number
    budget_max: number
    estimated_days: number
  }
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  pending:     { label: 'Menunggu',   bg: '#2a2a00', color: '#FBBF24' },
  accepted:    { label: 'Diterima',   bg: '#152d1e', color: '#10B981' },
  rejected:    { label: 'Ditolak',    bg: '#2d1515', color: '#EF4444' },
  in_progress: { label: 'Dikerjakan', bg: '#1a2340', color: '#4F6EF7' },
  submitted:   { label: 'Dikirim',    bg: '#1e1a40', color: '#8B5CF6' },
  revision:    { label: 'Revisi',     bg: '#2a1a00', color: '#F59E0B' },
  completed:   { label: 'Selesai',    bg: '#152d1e', color: '#10B981' },
}

const AKTIF_STATUSES = ['pending', 'accepted', 'in_progress', 'submitted', 'revision']

const EMPTY_MESSAGES: Record<string, string> = {
  aktif:   'Belum ada lamaran aktif saat ini.',
  selesai: 'Belum ada proyek yang selesai.',
  ditolak: 'Tidak ada lamaran yang ditolak.',
}

export default function LamaranPage() {
  const [lamaran, setLamaran] = useState<Lamaran[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('semua')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchLamaran() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }

      const { data } = await supabase
        .from('applications')
        .select('id, status, created_at, projects(id, title, category, budget_min, budget_max, estimated_days)')
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false })

      setLamaran((data as any) || [])
      setLoading(false)
    }
    fetchLamaran()
  }, [])

  const tabs = [
    { key: 'semua',   label: 'Semua',   count: lamaran.length },
    { key: 'aktif',   label: 'Aktif',   count: lamaran.filter(l => AKTIF_STATUSES.includes(l.status)).length },
    { key: 'selesai', label: 'Selesai', count: lamaran.filter(l => l.status === 'completed').length },
    { key: 'ditolak', label: 'Ditolak', count: lamaran.filter(l => l.status === 'rejected').length },
  ]

  const filtered = activeTab === 'aktif'   ? lamaran.filter(l => AKTIF_STATUSES.includes(l.status))
    : activeTab === 'selesai' ? lamaran.filter(l => l.status === 'completed')
    : activeTab === 'ditolak' ? lamaran.filter(l => l.status === 'rejected')
    : lamaran

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <style>{`
        .tab-btn:hover { color: white !important; border-color: rgba(255,255,255,0.3) !important; }
      `}</style>
      <Navbar />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Lamaranku</h1>
        <p style={{ color: '#8892a4', marginBottom: '32px' }}>
          {loading ? 'Memuat...' : lamaran.length + ' lamaran terkirim'}
        </p>

        {!loading && lamaran.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {tabs.map(tab => (
              <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)}
                style={{
                  background: activeTab === tab.key ? '#4F6EF7' : 'transparent',
                  color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.5)',
                  border: activeTab === tab.key ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ color: '#8892a4', textAlign: 'center', padding: '60px' }}>Memuat...</div>
        ) : lamaran.length === 0 ? (
          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#8892a4' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📨</div>
            <p style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Kamu belum melamar proyek apapun.</p>
            <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '20px' }}>Mulai cari proyek yang cocok dengan skill-mu!</p>
            <a href="/app/jelajah" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#4F6EF7', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Cari Proyek →</a>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#8892a4' }}>
            <p>{EMPTY_MESSAGES[activeTab] || 'Tidak ada lamaran.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(item => {
              const project = item.projects
              const s = statusConfig[item.status] || statusConfig.pending
              return (
                <div key={item.id} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ backgroundColor: '#1a2340', color: '#4F6EF7', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>{project?.category}</span>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '8px 0 4px' }}>{project?.title}</h2>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ color: '#22D3EE', fontSize: '13px' }}>
                        {formatRupiah(project?.budget_min)} – {formatRupiah(project?.budget_max)}
                      </span>
                      <span style={{ color: '#8892a4', fontSize: '12px' }}>{project?.estimated_days} hari</span>
                      <span style={{ color: '#8892a4', fontSize: '12px' }}>
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '16px', flexWrap: 'wrap' }}>
                    {item.status === 'accepted' && (
                      <>
                        <a href={'/app/proyek/' + item.projects?.id} style={{ padding: '5px 12px', backgroundColor: '#4F6EF7', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          🏗 Buka Workspace →
                        </a>
                        <a href={'/app/proyek/' + item.projects?.id} style={{ padding: '5px 12px', backgroundColor: 'transparent', border: '1px solid rgba(79,110,247,0.4)', color: '#4F6EF7', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          💬 Chat
                        </a>
                      </>
                    )}
                    <span style={{ backgroundColor: s.bg, color: s.color, fontSize: '12px', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      {s.label}
                    </span>
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
