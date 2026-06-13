'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Send, CheckCircle, Shield } from 'lucide-react'

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
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      Memuat...
    </div>
  )

  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  function getBadge(appStatus: string, projStatus?: string): { label: string; color: string; border: string } {
    if (appStatus === 'rejected') return { label: 'Ditolak',          color: '#EF4444', border: '#EF4444' }
    if (appStatus === 'pending')  return { label: 'Menunggu',         color: '#FBBF24', border: '#FBBF24' }
    if (appStatus === 'accepted') {
      if (projStatus === 'in_progress') return { label: 'Sedang Dikerjakan', color: '#4F6EF7', border: '#4F6EF7' }
      if (projStatus === 'submitted')   return { label: 'Menunggu Review',   color: '#8B5CF6', border: '#8B5CF6' }
      if (projStatus === 'completed')   return { label: 'Selesai ✓',        color: '#10B981', border: '#10B981' }
      if (projStatus === 'revision')    return { label: 'Perlu Revisi',      color: '#f59e0b', border: '#f59e0b' }
      return { label: 'Diterima', color: '#10B981', border: '#10B981' }
    }
    return { label: appStatus, color: '#8892a4', border: '#1e2d4a' }
  }

  function getCategoryColor(cat?: string): string {
    if (!cat) return '#4F6EF7'
    const c = cat.toLowerCase()
    if (c.includes('desain') || c.includes('grafis') || c.includes('ui') || c.includes('ux')) return '#8B5CF6'
    if (c.includes('web') || c.includes('mobile') || c.includes('dev'))                       return '#4F6EF7'
    if (c.includes('konten') || c.includes('penulisan') || c.includes('copy'))                return '#F59E0B'
    if (c.includes('video') || c.includes('animasi'))                                          return '#EF4444'
    if (c.includes('data') || c.includes('riset'))                                             return '#22D3EE'
    if (c.includes('terjemahan'))                                                              return '#10B981'
    if (c.includes('sosial') || c.includes('social') || c.includes('media'))                  return '#F97316'
    return '#4F6EF7'
  }

  const name = user?.user_metadata?.full_name || 'Pengguna'

  const statCards = [
    {
      label: 'Lamaran Terkirim',
      value: String(stats.terkirim),
      color: '#4F6EF7',
      iconBg: 'rgba(79,110,247,0.12)',
      borderColor: '#4F6EF7',
      Icon: Send,
    },
    {
      label: 'Lamaran Diterima',
      value: String(stats.diterima),
      color: '#10B981',
      iconBg: 'rgba(16,185,129,0.12)',
      borderColor: '#10B981',
      Icon: CheckCircle,
    },
    {
      label: 'Trust Score',
      value: `${stats.trustScore}/100`,
      color: '#22D3EE',
      iconBg: 'rgba(34,211,238,0.12)',
      borderColor: '#22D3EE',
      Icon: Shield,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />

      {/* ── Hero strip ───────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79,110,247,0.15) 0%, rgba(139,92,246,0.08) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 0 28px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, marginBottom: '6px', lineHeight: 1.2 }}>
              Selamat datang, {name} 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              Pantau perkembangan freelance-mu di sini.
            </p>
          </div>
          <a href="/app/profil" style={{
            padding: '9px 18px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
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

        {/* ── Stat cards ───────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {statCards.map(({ label, value, color, iconBg, borderColor, Icon }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderLeft: `3px solid ${borderColor}`,
              borderRadius: '16px',
              padding: '20px 24px',
              minHeight: '110px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon size={20} strokeWidth={1.5} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color, fontFamily: 'monospace', lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
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
              <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: '4px' }}>
                Aktivitas
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Lamaran Terbaru</h2>
            </div>
            <a href="/app/lamaran" style={{ color: '#4F6EF7', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
              Lihat semua →
            </a>
          </div>

          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '14px', overflow: 'hidden' }}>
            {recentApps.length === 0 ? (
              <div style={{ padding: '56px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Belum ada lamaran</p>
                <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '20px' }}>Yuk mulai jelajahi proyek yang tersedia!</p>
                <a href="/app/jelajah" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#4F6EF7', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
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
                    borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderRadius: idx === 0 ? '14px 14px 0 0' : isLast ? '0 0 14px 14px' : '0',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)' }}
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
                    <div style={{ fontWeight: 500, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.projects?.title || 'Proyek'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                      {cat}{cat && ' · '}{fmt(item.projects?.budget_min || 0)} – {fmt(item.projects?.budget_max || 0)}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    color: b.color, fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                    fontWeight: 600, border: `1px solid ${b.border}22`,
                    backgroundColor: b.color + '18', whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {b.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: '16px' }}>
            Aksi Cepat
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <a href="/app/jelajah" style={{
              background: 'linear-gradient(135deg, #4F6EF7 0%, #6366f1 100%)',
              color: 'white', textDecoration: 'none', borderRadius: '14px',
              padding: '24px', display: 'block',
              boxShadow: '0 4px 24px rgba(79,110,247,0.25)',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '5px' }}>Jelajah Proyek</div>
              <div style={{ fontSize: '13px', opacity: 0.75 }}>Temukan proyek yang cocok untukmu</div>
            </a>
            <a href="/app/profil/skill-test" style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(109,40,217,0.15) 100%)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: 'white', textDecoration: 'none', borderRadius: '14px',
              padding: '24px', display: 'block',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>⚡</div>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '5px' }}>Tingkatkan Trust Score</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>Ikuti Skill Test untuk naik peringkat</div>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
