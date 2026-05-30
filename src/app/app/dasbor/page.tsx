'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

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
          .select('id, status, created_at, projects(id, title, category, budget_min, budget_max)')
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

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>

  const statusColor: Record<string, string> = { pending: '#FBBF24', accepted: '#10B981', rejected: '#EF4444' }
  const statusLabel: Record<string, string> = { pending: 'Menunggu', accepted: 'Diterima', rejected: 'Ditolak' }
  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Selamat datang, {user?.user_metadata?.full_name || 'Pengguna'}! 👋</h1>
            <p style={{ color: '#8892a4', fontSize: '14px' }}>Pantau perkembangan freelance-mu di sini.</p>
          </div>
          <a href="/app/profil" style={{ padding: '8px 16px', backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '8px', color: '#4F6EF7', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>Edit Profil</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Lamaran Terkirim', value: stats.terkirim, color: '#4F6EF7' },
            { label: 'Lamaran Diterima', value: stats.diterima, color: '#10B981' },
            { label: 'Trust Score', value: stats.trustScore + '/100', color: '#22D3EE' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: s.color }}>{s.value}</div>
              <div style={{ color: '#8892a4', fontSize: '14px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2d4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>Lamaran Terbaru</h2>
            <a href="/app/lamaran" style={{ color: '#4F6EF7', textDecoration: 'none', fontSize: '13px' }}>Lihat semua →</a>
          </div>
          {recentApps.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Belum ada lamaran</p>
              <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '20px' }}>Yuk mulai jelajahi proyek yang tersedia!</p>
              <a href="/app/jelajah" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#4F6EF7', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Jelajahi Proyek →</a>
            </div>
          ) : recentApps.map((item: any) => (
            <div key={item.id} style={{ padding: '14px 24px', borderBottom: '1px solid #0d1526', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.projects?.title || 'Proyek'}</div>
                <div style={{ color: '#8892a4', fontSize: '12px' }}>{item.projects?.category} · {fmt(item.projects?.budget_min || 0)} – {fmt(item.projects?.budget_max || 0)}</div>
              </div>
              <span style={{ color: statusColor[item.status] || 'white', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid', borderColor: statusColor[item.status] || '#1e2d4a', backgroundColor: '#0A0E1A' }}>
                {statusLabel[item.status] || item.status}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <a href="/app/jelajah" style={{ backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', borderRadius: '12px', padding: '20px 24px', display: 'block' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Jelajah Proyek</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>Temukan proyek yang cocok untukmu</div>
          </a>
          <a href="/app/profil" style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', color: 'white', textDecoration: 'none', borderRadius: '12px', padding: '20px 24px', display: 'block' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Tingkatkan Trust Score</div>
            <div style={{ fontSize: '13px', color: '#8892a4' }}>Lengkapi profil untuk naik peringkat</div>
          </a>
        </div>
      </div>
    </div>
  )
}
