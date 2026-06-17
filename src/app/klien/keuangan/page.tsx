'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'
import { Calendar, CheckCircle, Clock, ClipboardList, Banknote, Wallet } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

const STATUS_RED   = '#EF4444'
const STATUS_AMBER = '#F59E0B'

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

const FUNDED_STATUSES = ['in_progress', 'submitted', 'revision', 'completed']

export default function KeuanganKlienPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }

      const { data } = await supabase
        .from('projects')
        .select('id, title, category, status, budget_max, funded_at, completed_at, created_at')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      setProjects(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const funded   = projects.filter(p => FUNDED_STATUSES.includes(p.status))
  const sudahBayar = funded
  const menunggu = projects.filter(p => ['in_progress', 'submitted', 'revision'].includes(p.status))
  const completed = projects.filter(p => p.status === 'completed')

  const now = new Date()
  const bulanIni = completed.filter(p => {
    if (!p.completed_at) return false
    const d = new Date(p.completed_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const totalBulanIni   = bulanIni.reduce((s: number, p: any) => s + (p.budget_max || 0), 0)
  const totalSudahBayar = sudahBayar.reduce((s: number, p: any) => s + (p.budget_max || 0), 0)
  const totalMenunggu   = menunggu.reduce((s: number, p: any) => s + (p.budget_max || 0), 0)

  const statCards = [
    { Icon: Calendar,      label: 'Pengeluaran Bulan Ini', value: fmt(totalBulanIni),    color: STATUS_RED,   iconBg: STATUS_RED + '18'   },
    { Icon: CheckCircle,   label: 'Sudah Dibayar',         value: fmt(totalSudahBayar),  color: C.success,    iconBg: C.successTint        },
    { Icon: Clock,         label: 'Menunggu Proses',        value: fmt(totalMenunggu),    color: STATUS_AMBER, iconBg: STATUS_AMBER + '18'  },
    { Icon: ClipboardList, label: 'Total Proyek Aktif',     value: String(funded.length), color: C.primary,    iconBg: C.primaryTint        },
  ]

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    in_progress: { label: 'Sedang Dikerjakan', color: C.primary,    bg: C.primaryTint        },
    submitted:   { label: 'Menunggu Review',   color: C.primary,    bg: C.primaryTint        },
    revision:    { label: 'Perlu Revisi',      color: STATUS_AMBER, bg: STATUS_AMBER + '18'  },
    completed:   { label: 'Selesai ✓',        color: C.success,    bg: C.successTint         },
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <NavbarKlien />
      <div style={{ padding: 'clamp(20px,5vw,40px) clamp(16px,4vw,32px)', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', color: C.textDark, fontFamily: theme.fonts.headline }}>Keuangan</h1>
        <p style={{ color: C.textMuted, marginBottom: '32px' }}>Pantau pengeluaran dan riwayat pembayaran proyekmu</p>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '16px', marginBottom: '32px' }}>
          {statCards.map(s => (
            <div key={s.label} style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px', boxShadow: theme.shadow.card }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <s.Icon size={20} strokeWidth={1.5} color={s.color} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, marginBottom: '4px', fontFamily: theme.fonts.mono }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: C.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Riwayat */}
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, overflow: 'hidden', boxShadow: theme.shadow.card }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.textDark, margin: 0 }}>Riwayat Pembayaran</h2>
            <a href="/klien/post-proyek" style={{ padding: '8px 16px', backgroundColor: C.primary, color: 'white', borderRadius: R.sm, fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              + Post Proyek Baru
            </a>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: C.textMuted }}>Memuat...</div>
          ) : funded.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: C.textMuted }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', opacity: 0.3 }}>
                <Wallet size={40} strokeWidth={1} color={C.textDark} />
              </div>
              <p>Belum ada riwayat pembayaran.</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Pembayaran akan muncul setelah kamu mendanai proyek.</p>
            </div>
          ) : funded.map(p => {
            const s = statusLabel[p.status] || { label: p.status, color: C.textMuted, bg: C.bgLavenderSoft }
            return (
              <div key={p.id} style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: R.sm, backgroundColor: C.primaryTint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Banknote size={16} strokeWidth={1.5} color={C.primary} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: C.textDark }}>{p.title}</div>
                    <div style={{ color: C.textMuted, fontSize: '12px' }}>
                      {p.category} · {p.funded_at ? new Date(p.funded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: STATUS_RED, fontFamily: theme.fonts.mono }}>-{fmt(p.budget_max || 0)}</div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', backgroundColor: s.bg, color: s.color, fontWeight: 600 }}>
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
