'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Clock, Inbox, AlertTriangle, MessageCircle, Briefcase } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

const STATUS_RED   = '#EF4444'
const STATUS_AMBER = '#F59E0B'

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
    created_at: string
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

function getDaysLeft(projectCreatedAt: string, estimatedDays: number): number {
  const deadline = new Date(projectCreatedAt)
  deadline.setDate(deadline.getDate() + estimatedDays)
  return Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Menunggu Review',   color: STATUS_AMBER,  bg: STATUS_AMBER + '26'  },
  accepted:    { label: '✓ Diterima',        color: C.success,     bg: C.successTint        },
  rejected:    { label: 'Ditolak',           color: STATUS_RED,    bg: STATUS_RED + '26'    },
  in_progress: { label: 'Sedang Dikerjakan', color: C.primary,     bg: C.primaryTint        },
  submitted:   { label: 'Menunggu Review',   color: C.primary,     bg: C.primaryTint        },
  revision:    { label: 'Perlu Revisi',      color: STATUS_AMBER,  bg: STATUS_AMBER + '26'  },
  completed:   { label: 'Selesai ✓',        color: C.success,     bg: C.successTint        },
}

const AKTIF_STATUSES = ['pending', 'accepted', 'in_progress', 'submitted', 'revision']
const DEADLINE_STATUSES = ['accepted', 'in_progress', 'submitted', 'revision']

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
        .select('id, status, created_at, cover_letter, projects(id, title, category, budget_min, budget_max, estimated_days, created_at)')
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
    activeTab === 'aktif' ? [...lamaran.filter(l => AKTIF_STATUSES.includes(l.status))].sort((a, b) => {
      const aD = DEADLINE_STATUSES.includes(a.status)
      const bD = DEADLINE_STATUSES.includes(b.status)
      if (!aD && !bD) return 0
      if (!aD) return 1
      if (!bD) return -1
      return getDaysLeft(a.projects?.created_at || '', a.projects?.estimated_days || 30)
           - getDaysLeft(b.projects?.created_at || '', b.projects?.estimated_days || 30)
    }) :
    activeTab === 'selesai' ? lamaran.filter(l => l.status === 'completed') :
    activeTab === 'ditolak' ? lamaran.filter(l => l.status === 'rejected') :
    lamaran

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <Navbar />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '800px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px', color: C.textDark, fontFamily: theme.fonts.headline }}>Lamaranku</h1>
        <p style={{ color: C.textMuted, marginBottom: '28px', fontSize: '14px' }}>
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
                    background:   isActive ? C.primary      : 'transparent',
                    color:        isActive ? 'white'        : C.textMuted,
                    border:       isActive ? 'none'         : `1px solid ${C.primaryBorder}`,
                    borderRadius: R.sm, padding: '6px 16px',
                    fontSize: '13px', fontWeight: isActive ? 600 : 500, cursor: 'pointer',
                    fontFamily: theme.fonts.body,
                  }}>
                  {tab.label} ({tab.count})
                </button>
              )
            })}
          </div>
        )}

        {/* ── States ── */}
        {loading ? (
          <div style={{ color: C.textMuted, textAlign: 'center', padding: '60px' }}>Memuat...</div>
        ) : lamaran.length === 0 ? (
          <div style={{ background: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, padding: '60px 24px', textAlign: 'center', boxShadow: theme.shadow.card }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.3 }}>
              <Inbox size={48} strokeWidth={1} color={C.textDark} />
            </div>
            <p style={{ color: C.textDark, fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Kamu belum melamar proyek apapun.</p>
            <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '20px' }}>Mulai cari proyek yang cocok dengan skill-mu!</p>
            <a href="/app/jelajah"
              style={{ display: 'inline-block', padding: '9px 20px', background: C.primary, color: 'white', borderRadius: R.sm, textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
              Jelajahi Proyek →
            </a>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.lg, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', opacity: 0.3 }}>
              <Inbox size={40} strokeWidth={1} color={C.textDark} />
            </div>
            <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '16px' }}>
              Belum ada lamaran di kategori ini.
            </p>
            <a href="/app/jelajah"
              style={{ fontSize: '13px', color: C.primary, textDecoration: 'none', fontWeight: 500 }}>
              Jelajahi Proyek →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* ── Urgency banner (aktif tab only) ── */}
            {activeTab === 'aktif' && (() => {
              const urgent = filtered.find(l =>
                DEADLINE_STATUSES.includes(l.status) && l.projects?.created_at &&
                getDaysLeft(l.projects.created_at, l.projects.estimated_days) <= 2
              )
              if (!urgent) return null
              const d = getDaysLeft(urgent.projects.created_at, urgent.projects.estimated_days)
              const label = d < 0 ? `terlambat ${Math.abs(d)} hari` : d === 0 ? 'deadline hari ini!' : `${d} hari lagi`
              return (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: STATUS_RED + '12', border: `1px solid ${STATUS_RED}33`,
                  borderRadius: R.sm, padding: '10px 14px', fontSize: '13px',
                }}>
                  <AlertTriangle size={16} strokeWidth={1.5} color={STATUS_RED} />
                  <span>
                    <span style={{ fontWeight: 700, color: STATUS_RED }}>Paling mendesak: </span>
                    <span style={{ color: C.textDark }}>"{urgent.projects.title}"</span>
                    <span style={{ color: C.textMuted }}> — {label}</span>
                  </span>
                </div>
              )
            })()}
            {filtered.map(item => {
              const project = item.projects
              const s = statusConfig[item.status] || statusConfig.pending
              const coverLetter = item.cover_letter?.trim() || null

              return (
                <div key={item.id} style={{
                  background: C.bgWhite,
                  border: `1px solid ${C.border}`,
                  borderRadius: R.lg,
                  padding: '20px',
                  boxShadow: theme.shadow.card,
                }}>
                  {/* Row 1: category badge + status badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ background: C.primaryTint, color: C.primary, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 500 }}>
                      {project?.category}
                    </span>
                    <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>
                      {s.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3, color: C.textDark }}>
                    {project?.title}
                  </h2>

                  {/* Budget + time + urgency */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: C.primary, fontSize: '13px', fontWeight: 600, fontFamily: theme.fonts.mono }}>
                      {fmt(project?.budget_min)} – {fmt(project?.budget_max)}
                    </span>
                    <span style={{ display: 'inline-block', width: '3px', height: '3px', borderRadius: '50%', background: C.border }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C.textMuted, fontSize: '12px' }}>
                      <Clock size={12} strokeWidth={1.5} />
                      Dilamar {daysAgo(item.created_at)}
                    </span>
                    {DEADLINE_STATUSES.includes(item.status) && project?.created_at && (() => {
                      const d = getDaysLeft(project.created_at, project.estimated_days)
                      const isOver    = d < 0
                      const isUrgent  = !isOver && d <= 2
                      const isWarning = !isOver && d > 2 && d <= 7
                      const color = (isOver || isUrgent) ? STATUS_RED : isWarning ? STATUS_AMBER : C.textMuted
                      const bg    = (isOver || isUrgent) ? STATUS_RED + '18' : isWarning ? STATUS_AMBER + '18' : C.bgLavenderSoft
                      const text  = isOver ? `⚠ Terlambat ${Math.abs(d)}h` : `⏳ ${d} hari lagi`
                      return (
                        <span style={{ background: bg, color, borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
                          {text}
                        </span>
                      )
                    })()}
                  </div>

                  {/* Cover letter preview */}
                  {coverLetter && (
                    <div style={{ ...clampStyle, fontSize: '13px', color: C.textMuted, lineHeight: 1.6, marginBottom: '12px', fontStyle: 'italic' }}>
                      "{coverLetter}"
                    </div>
                  )}

                  {/* Footer: workspace/chat if accepted */}
                  {(item.status === 'accepted' || item.status === 'in_progress' || item.status === 'submitted' || item.status === 'revision') && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <a href={'/app/proyek/' + project?.id}
                        style={{ padding: '6px 14px', background: C.primary, color: 'white', borderRadius: R.sm, fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Briefcase size={13} strokeWidth={1.5} />
                        Buka Workspace
                      </a>
                      <a href={'/app/proyek/' + project?.id}
                        style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${C.primaryBorder}`, color: C.primary, borderRadius: R.sm, fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <MessageCircle size={13} strokeWidth={1.5} />
                        Chat
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
