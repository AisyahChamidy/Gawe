'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Send, CheckCircle, Shield, Search, Zap, Rocket } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

// Cyan is kept only for the data/research category avatar colour in getCategoryColor.
const CYAN = '#22D3EE'

// Status badge colours that don't map to the brand palette (semantic/functional only).
const STATUS_RED = '#EF4444'
const STATUS_AMBER = '#FBBF24'

export default function DasborPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ terkirim: 0, diterima: 0, trustScore: 10 })
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }
      setUser(user)
      const [{ data: prof }, { data: apps }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('applications')
          .select('id, status, created_at, projects(id, title, category, budget_min, budget_max, status)')
          .eq('freelancer_id', user.id).order('created_at', { ascending: false })
      ])
      const allApps = apps || []
      setStats({
        terkirim: allApps.length,
        diterima: allApps.filter((a: any) => a.status === 'accepted').length,
        trustScore: prof?.trust_score || 10,
      })
      setRecentApps(allApps.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>
      Memuat...
    </div>
  )

  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  function getBadge(appStatus: string, projStatus?: string): { label: string; color: string } {
    if (appStatus === 'rejected') return { label: 'Ditolak',            color: STATUS_RED }
    if (appStatus === 'pending')  return { label: 'Menunggu',           color: STATUS_AMBER }
    if (appStatus === 'accepted') {
      if (projStatus === 'in_progress') return { label: 'Sedang Dikerjakan', color: C.primary }
      if (projStatus === 'submitted')   return { label: 'Menunggu Review',   color: C.primary }
      if (projStatus === 'completed')   return { label: 'Selesai ✓',         color: C.success }
      if (projStatus === 'revision')    return { label: 'Perlu Revisi',       color: STATUS_AMBER }
      return { label: 'Diterima', color: C.success }
    }
    return { label: appStatus, color: C.textMuted }
  }

  function getCategoryColor(cat?: string): string {
    if (!cat) return C.primary
    const c = cat.toLowerCase()
    if (c.includes('desain') || c.includes('grafis') || c.includes('ui') || c.includes('ux')) return C.primary
    if (c.includes('web') || c.includes('mobile') || c.includes('dev'))                       return C.primary
    if (c.includes('konten') || c.includes('penulisan') || c.includes('copy'))                return STATUS_AMBER
    if (c.includes('video') || c.includes('animasi'))                                          return STATUS_RED
    if (c.includes('data') || c.includes('riset'))                                             return CYAN
    if (c.includes('terjemahan'))                                                              return C.success
    if (c.includes('sosial') || c.includes('social') || c.includes('media'))                  return C.coral
    return C.primary
  }

  const name = user?.user_metadata?.full_name || 'Pengguna'

  const statCards = [
    {
      label: 'Lamaran Terkirim',
      value: String(stats.terkirim),
      color: C.primary,
      iconBg: C.primaryTint,
      Icon: Send,
    },
    {
      label: 'Lamaran Diterima',
      value: String(stats.diterima),
      color: C.success,
      iconBg: C.successTint,
      Icon: CheckCircle,
    },
    {
      label: 'Trust Score',
      value: `${stats.trustScore}/100`,
      color: C.primary,
      iconBg: C.primaryTint,
      Icon: Shield,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <Navbar />

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
              Pantau perkembangan freelance-mu di sini.
            </p>
          </div>
          <a href="/app/profil" style={{
            padding: '9px 18px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: R.sm,
            color: 'white',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            Edit Profil
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px clamp(16px, 4vw, 32px) 60px' }}>

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {statCards.map(({ label, value, color, iconBg, Icon }) => (
            <div key={label} style={{
              background: C.bgWhite,
              border: `1px solid ${C.border}`,
              borderRadius: R.lg,
              padding: '20px 24px',
              minHeight: '110px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: theme.shadow.card,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon size={20} strokeWidth={1.5} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color, fontFamily: theme.fonts.mono, lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: '13px', color: C.textMuted, marginTop: '6px' }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Lamaran Terbaru ───────────────────────────────────────────── */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, fontWeight: 600, marginBottom: '4px' }}>
                Aktivitas
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: C.textDark }}>Lamaran Terbaru</h2>
            </div>
            <a href="/app/lamaran" style={{ color: C.primary, textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
              Lihat semua →
            </a>
          </div>

          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, overflow: 'hidden', boxShadow: theme.shadow.card }}>
            {recentApps.length === 0 ? (
              <div style={{ padding: '56px 24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Rocket size={48} strokeWidth={1.5} color={C.primary} /></div>
                <p style={{ color: C.textDark, fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Belum ada lamaran</p>
                <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '20px' }}>Yuk mulai jelajahi proyek yang tersedia!</p>
                <a href="/app/jelajah" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: C.primary, color: 'white', borderRadius: R.sm, textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
                  Jelajahi Proyek →
                </a>
              </div>
            ) : recentApps.map((item: any, idx: number) => {
              const b = getBadge(item.status, item.projects?.status)
              const cat = item.projects?.category || ''
              const catColor = getCategoryColor(cat)
              const initial = (item.projects?.title || 'P')[0].toUpperCase()
              const isLast = idx === recentApps.length - 1
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = C.bgLavenderSoft }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                >
                  {/* Category avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    backgroundColor: catColor + '22',
                    border: `1px solid ${catColor}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, color: catColor,
                  }}>
                    {initial}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '14px', color: C.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.projects?.title || 'Proyek'}
                    </div>
                    <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px' }}>
                      {cat}{cat && ' · '}{fmt(item.projects?.budget_min || 0)} – {fmt(item.projects?.budget_max || 0)}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    color: b.color, fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                    fontWeight: 600, border: `1px solid ${b.color}33`,
                    backgroundColor: b.color + '18', whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {b.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Aksi Cepat ───────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, fontWeight: 600, marginBottom: '16px' }}>
            Aksi Cepat
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <a href="/app/jelajah" style={{
              background: C.primary,
              color: 'white', textDecoration: 'none', borderRadius: R.md,
              padding: '24px', display: 'block',
              boxShadow: '0 4px 24px rgba(83,74,183,0.25)',
            }}>
              <div style={{ marginBottom: '10px' }}>
                <Search size={22} strokeWidth={1.5} color="white" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '5px' }}>Jelajah Proyek</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Temukan proyek yang cocok untukmu</div>
            </a>
            <a href="/app/profil/skill-test" style={{
              background: C.bgLavenderSoft,
              border: `1px solid ${C.primaryBorder}`,
              color: C.textDark, textDecoration: 'none', borderRadius: R.md,
              padding: '24px', display: 'block',
            }}>
              <div style={{ marginBottom: '10px' }}>
                <Zap size={22} strokeWidth={1.5} color={C.primary} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '5px', color: C.textDark }}>Tingkatkan Trust Score</div>
              <div style={{ fontSize: '13px', color: C.textMuted }}>Ikuti Skill Test untuk naik peringkat</div>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
