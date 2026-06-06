'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'

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

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  const statusLabel: Record<string, { label: string; color: string }> = {
    open: { label: 'Menerima Lamaran', color: '#4F6EF7' },
    in_progress: { label: 'Sedang Berjalan', color: '#10B981' },
    completed: { label: 'Selesai', color: '#8B5CF6' },
    cancelled: { label: 'Dibatalkan', color: '#EF4444' },
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <NavbarKlien />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Dashboard Klien 👋</h1>
            <p style={{ color: '#8892a4', fontSize: '14px' }}>Halo, {user?.user_metadata?.full_name || 'Klien'}! Kelola proyekmu di sini.</p>
          </div>
          <a href="/klien/post-proyek" style={{
            padding: '10px 20px', backgroundColor: '#4F6EF7', color: 'white',
            textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold'
          }}>+ Post Proyek Baru</a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Proyek', value: stats.totalProyek, color: '#4F6EF7', icon: '📋' },
            { label: 'Proyek Aktif', value: stats.proyekAktif, color: '#10B981', icon: '⚡' },
            { label: 'Total Pelamar', value: stats.totalPelamar, color: '#8B5CF6', icon: '👥' },
            { label: 'Total Dibelanjakan', value: stats.totalSpend > 0 ? fmt(stats.totalSpend) : 'Rp0', color: '#22D3EE', icon: '💰' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: s.color, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ color: '#8892a4', fontSize: '13px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Proyek terbaru */}
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2d4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>Proyek Terbaru</h2>
            <a href="/klien/proyek" style={{ color: '#4F6EF7', textDecoration: 'none', fontSize: '13px' }}>Lihat semua →</a>
          </div>
          {recentProyek.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#8892a4' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
              <p>Belum ada proyek. <a href="/klien/post-proyek" style={{ color: '#4F6EF7' }}>Post proyek pertamamu →</a></p>
            </div>
          ) : recentProyek.map((p: any) => {
            const s = statusLabel[p.status] || { label: p.status, color: '#8892a4' }
            return (
              <div key={p.id} style={{ padding: '16px 24px', borderBottom: '1px solid #0d1526', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{p.title}</div>
                  <div style={{ color: '#8892a4', fontSize: '12px' }}>
                    {p.category} · {p.applications?.length || 0} pelamar · Maks {fmt(p.budget_max || 0)}
                  </div>
                </div>
                <span style={{ color: s.color, fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid', borderColor: s.color, backgroundColor: '#0A0E1A' }}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {[
            { href: '/klien/post-proyek', icon: '✏️', title: 'Post Proyek Baru', desc: 'Cari freelancer untuk proyekmu', bg: '#4F6EF7', color: 'white' },
            { href: '/klien/proyek', icon: '📋', title: 'Kelola Proyek', desc: 'Lihat lamaran & update status', bg: '#131929', color: 'white' },
            { href: '/app/dasbor', icon: '🔄', title: 'Mode Freelancer', desc: 'Beralih jadi freelancer', bg: '#131929', color: 'white' },
          ].map(a => (
            <a key={a.href} href={a.href} style={{ backgroundColor: a.bg, border: a.bg === '#131929' ? '1px solid #1e2d4a' : 'none', color: a.color, textDecoration: 'none', borderRadius: '12px', padding: '20px 24px', display: 'block' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{a.icon}</div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>{a.title}</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>{a.desc}</div>
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}
