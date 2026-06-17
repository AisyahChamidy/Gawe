'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'
import { ClipboardList, Zap, Users, Wallet, FilePlus, RefreshCw } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

// Danger red — not a brand colour, kept as a local semantic constant.
const STATUS_RED = '#EF4444'

export default function DasborKlienPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ totalProyek: 0, totalPelamar: 0, proyekAktif: 0, totalSpend: 0 })
  const [recentProyek, setRecentProyek] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }
      setUser(user)

      const { data: projects } = await supabase
        .from('projects')
        .select('id, title, category, status, budget_max, created_at, applications(id, status)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      const all = projects || []
      const totalPelamar = all.reduce((sum: number, p: any) => sum + (p.applications?.length || 0), 0)
      const proyekAktif = all.filter((p: any) => p.status === 'open' || p.status === 'in_progress').length
      const totalSpend = all.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + (p.budget_max || 0), 0)

      setStats({ totalProyek: all.length, totalPelamar, proyekAktif, totalSpend })
      setRecentProyek(all.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>
      Memuat...
    </div>
  )

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  const statusLabel: Record<string, { label: string; color: string }> = {
    open:        { label: 'Menerima Lamaran', color: C.primary },
    in_progress: { label: 'Sedang Berjalan',  color: C.success },
    completed:   { label: 'Selesai',           color: C.success },
    cancelled:   { label: 'Dibatalkan',        color: STATUS_RED },
  }

  const name = user?.user_metadata?.full_name || 'Klien'

  const statCards = [
    { label: 'Total Proyek',       value: stats.totalProyek,                                     color: C.primary,  iconBg: C.primaryTint,  Icon: ClipboardList },
    { label: 'Proyek Aktif',       value: stats.proyekAktif,                                     color: C.success,  iconBg: C.successTint,  Icon: Zap },
    { label: 'Total Pelamar',      value: stats.totalPelamar,                                    color: C.coral,    iconBg: C.coralTint,    Icon: Users },
    { label: 'Total Dibelanjakan', value: stats.totalSpend > 0 ? fmt(stats.totalSpend) : 'Rp0', color: C.primary,  iconBg: C.primaryTint,  Icon: Wallet },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <NavbarKlien />

      {/* ── Dark hero strip ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: C.meshBase, padding: '32px 0 28px' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', bottom: '-20%', left: '-20%', background: theme.gradients.darkMesh, filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'linear-gradient(180deg,rgba(15,12,46,0) 0%,rgba(15,12,46,0.3) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, marginBottom: '6px', lineHeight: 1.2, color: '#FFFFFF', fontFamily: theme.fonts.headline }}>
              Selamat datang, {name} 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>
              Kelola proyek dan freelancer-mu di sini.
            </p>
          </div>
          <a href="/klien/post-proyek" style={{
            padding: '9px 18px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: R.sm,
            color: 'white',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>+ Post Proyek Baru</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px clamp(16px, 4vw, 32px) 60px' }}>

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {statCards.map(s => (
            <div key={s.label} style={{
              backgroundColor: C.bgWhite,
              border: `1px solid ${C.border}`,
              borderRadius: R.lg,
              padding: '20px',
              boxShadow: theme.shadow.card,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <s.Icon size={20} strokeWidth={1.5} color={s.color} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.color, fontFamily: theme.fonts.mono, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ color: C.textMuted, fontSize: '13px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Proyek Terbaru ────────────────────────────────────────────── */}
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, overflow: 'hidden', marginBottom: '24px', boxShadow: theme.shadow.card }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: C.textDark }}>Proyek Terbaru</h2>
            <a href="/klien/proyek" style={{ color: C.primary, textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Lihat semua →</a>
          </div>
          {recentProyek.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: C.textMuted }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><ClipboardList size={40} strokeWidth={1.5} color={C.textMuted} /></div>
              <p>Belum ada proyek. <a href="/klien/post-proyek" style={{ color: C.primary }}>Post proyek pertamamu →</a></p>
            </div>
          ) : recentProyek.map((p: any, idx: number) => {
            const s = statusLabel[p.status] || { label: p.status, color: C.textMuted }
            const isLast = idx === recentProyek.length - 1
            return (
              <div key={p.id} style={{
                padding: '16px 24px',
                borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = C.bgLavenderSoft }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: C.textDark }}>{p.title}</div>
                  <div style={{ color: C.textMuted, fontSize: '12px' }}>
                    {p.category} · {p.applications?.length || 0} pelamar · Maks {fmt(p.budget_max || 0)}
                  </div>
                </div>
                <span style={{
                  color: s.color, fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
                  fontWeight: 600, backgroundColor: s.color + '18',
                  border: `1px solid ${s.color}33`, whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* ── Aksi Cepat ───────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, fontWeight: 600, marginBottom: '16px' }}>
            Aksi Cepat
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { href: '/klien/post-proyek', Icon: FilePlus,      title: 'Post Proyek Baru',  desc: 'Cari freelancer untuk proyekmu',  bg: C.primary,         color: 'white',      border: 'none' },
              { href: '/klien/proyek',      Icon: ClipboardList, title: 'Kelola Proyek',     desc: 'Lihat lamaran & update status',   bg: C.bgLavenderSoft,  color: C.textDark,   border: `1px solid ${C.primaryBorder}` },
              { href: '/app/dasbor',        Icon: RefreshCw,     title: 'Mode Freelancer',   desc: 'Beralih jadi freelancer',          bg: C.bgLavenderSoft,  color: C.textDark,   border: `1px solid ${C.primaryBorder}` },
            ].map(a => (
              <a key={a.href} href={a.href} style={{
                backgroundColor: a.bg,
                border: a.border,
                color: a.color,
                textDecoration: 'none',
                borderRadius: R.md,
                padding: '20px 24px',
                display: 'block',
                boxShadow: a.bg === C.primary ? '0 4px 24px rgba(83,74,183,0.25)' : theme.shadow.card,
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <a.Icon size={22} strokeWidth={1.5} color={a.color} />
                </div>
                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>{a.title}</div>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>{a.desc}</div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
