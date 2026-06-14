'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Clock, Inbox } from 'lucide-react'

type Lamaran = {
  id: string
  status: string
  created_at: string
  cover_letter: string | null
  projects: {
    id: string
    title: string
    category: string
    budget_min: number
    budget_max: number
    estimated_days: number
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

function daysAgo(dateStr: string): string {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (d === 0) return 'hari ini'
  if (d === 1) return '1 hari lalu'
  return `${d} hari lalu`
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Menunggu Review',   color: '#F59E0B', bg: 'rgba(245,158,11,0.15)'  },
  accepted:    { label: '✓ Diterima',        color: '#10B981', bg: 'rgba(16,185,129,0.15)'  },
  rejected:    { label: 'Ditolak',           color: '#EF4444', bg: 'rgba(239,68,68,0.15)'   },
  in_progress: { label: 'Sedang Dikerjakan', color: '#22D3EE', bg: 'rgba(34,211,238,0.15)'  },
  submitted:   { label: 'Menunggu Review',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)'  },
  revision:    { label: 'Perlu Revisi',      color: '#F59E0B', bg: 'rgba(245,158,11,0.15)'  },
  completed:   { label: 'Selesai ✓',        color: '#10B981', bg: 'rgba(16,185,129,0.15)'  },
}

const AKTIF_STATUSES = ['pending', 'accepted', 'in_progress', 'submitted', 'revision']

const clampStyle: React.CSSProperties = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

export default function LamaranPage() {
  const [lamaran, setLamaran]   = useState<Lamaran[]>([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('semua')
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchLamaran() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }
      const { data } = await supabase
        .from('applications')
        .select('id, status, created_at, cover_letter, projects(id, title, category, budget_min, budget_max, estimated_days)')
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

  const filtered =
    activeTab === 'aktif'   ? lamaran.filter(l => AKTIF_STATUSES.includes(l.status)) :
    activeTab === 'selesai' ? lamaran.filter(l => l.status === 'completed') :
    activeTab === 'ditolak' ? lamaran.filter(l => l.status === 'rejected') :
    lamaran

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '800px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Lamaranku</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '28px', fontSize: '14px' }}>
          {loading ? 'Memuat...' : `${lamaran.length} lamaran terkirim`}
        </p>

        {/* ── Tabs ── */}
        {!loading && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.key
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{
                    background:   isActive ? '#4F6EF7' : 'transparent',
                    color:        isActive ? 'white'   : 'rgba(255,255,255,0.5)',
                    border:       isActive ? 'none'    : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px', padding: '6px 16px',
                    fontSize: '13px', fontWeight: isActive ? 600 : 500, cursor: 'pointer',
                  }}>
                  {tab.label} ({tab.count})
                </button>
              )
            })}
          </div>
        )}

        {/* ── States ── */}
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '60px' }}>Memuat...</div>
        ) : lamaran.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.3 }}>
              <Inbox size={48} strokeWidth={1} />
            </div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Kamu belum melamar proyek apapun.</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '20px' }}>Mulai cari proyek yang cocok dengan skill-mu!</p>
            <a href="/app/jelajah"
              style={{ display: 'inline-block', padding: '9px 20px', background: '#4F6EF7', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
              Jelajahi Proyek →
            </a>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', opacity: 0.25 }}>
              <Inbox size={40} strokeWidth={1} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '16px' }}>
              Belum ada lamaran di kategori ini.
            </p>
            <a href="/app/jelajah"
              style={{ fontSize: '13px', color: '#4F6EF7', textDecoration: 'none', fontWeight: 500 }}>
              Jelajahi Proyek →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(item => {
              const project = item.projects
              const s = statusConfig[item.status] || statusConfig.pending
              const coverLetter = item.cover_letter?.trim() || null

              return (
                <div key={item.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '20px',
                }}>
                  {/* Row 1: category badge + status badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ background: 'rgba(79,110,247,0.12)', color: '#4F6EF7', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 500 }}>
                      {project?.category}
                    </span>
                    <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>
                      {s.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3 }}>
                    {project?.title}
                  </h2>

                  {/* Budget + time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#22D3EE', fontSize: '13px', fontWeight: 600 }}>
                      {fmt(project?.budget_min)} – {fmt(project?.budget_max)}
                    </span>
                    <span style={{ display: 'inline-block', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>
                      <Clock size={12} strokeWidth={1.5} />
                      Dilamar {daysAgo(item.created_at)}
                    </span>
                  </div>

                  {/* Cover letter preview */}
                  {coverLetter && (
                    <div style={{ ...clampStyle, fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '12px', fontStyle: 'italic' }}>
                      "{coverLetter}"
                    </div>
                  )}

                  {/* Footer: workspace/chat if accepted */}
                  {(item.status === 'accepted' || item.status === 'in_progress' || item.status === 'submitted' || item.status === 'revision') && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <a href={'/app/proyek/' + project?.id}
                        style={{ padding: '6px 14px', background: '#4F6EF7', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                        🏗 Buka Workspace
                      </a>
                      <a href={'/app/proyek/' + project?.id}
                        style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(79,110,247,0.35)', color: '#4F6EF7', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                        💬 Chat
                      </a>
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
