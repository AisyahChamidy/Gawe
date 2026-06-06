'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'

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

  const totalBulanIni  = bulanIni.reduce((s: number, p: any) => s + (p.budget_max || 0), 0)
  const totalSudahBayar = sudahBayar.reduce((s: number, p: any) => s + (p.budget_max || 0), 0)
  const totalMenunggu  = menunggu.reduce((s: number, p: any) => s + (p.budget_max || 0), 0)

  const stats = [
    { icon: '📅', label: 'Pengeluaran Bulan Ini', value: fmt(totalBulanIni), color: '#EF4444' },
    { icon: '✅', label: 'Sudah Dibayar',         value: fmt(totalSudahBayar), color: '#10B981' },
    { icon: '⏳', label: 'Menunggu Proses',        value: fmt(totalMenunggu),  color: '#FBBF24' },
    { icon: '📋', label: 'Total Proyek Aktif',     value: String(funded.length), color: '#4F6EF7' },
  ]

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    in_progress: { label: 'Sedang Dikerjakan', color: '#4F6EF7', bg: 'rgba(79,110,247,0.1)' },
    submitted:   { label: 'Menunggu Review',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    revision:    { label: 'Perlu Revisi',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    completed:   { label: 'Selesai ✓',        color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <NavbarKlien />
      <div style={{ padding: 'clamp(20px,5vw,40px) clamp(16px,4vw,32px)', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>Keuangan</h1>
        <p style={{ color: '#8892a4', marginBottom: '32px' }}>Pantau pengeluaran dan riwayat pembayaran proyekmu</p>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '16px', marginBottom: '32px' }}>
          {stats.map(s => (
            <div key={s.label} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: s.color, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#8892a4' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Riwayat */}
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2d4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>Riwayat Pembayaran</h2>
            <a href="/klien/post-proyek" style={{ padding: '8px 16px', backgroundColor: '#4F6EF7', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none' }}>
              + Post Proyek Baru
            </a>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8892a4' }}>Memuat...</div>
          ) : funded.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#8892a4' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💳</div>
              <p>Belum ada riwayat pembayaran.</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Pembayaran akan muncul setelah kamu mendanai proyek.</p>
            </div>
          ) : funded.map(p => {
            const s = statusLabel[p.status] || { label: p.status, color: '#8892a4', bg: 'transparent' }
            return (
              <div key={p.id} style={{ padding: '16px 24px', borderBottom: '1px solid #0d1526', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: '#2d1515', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    💰
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.title}</div>
                    <div style={{ color: '#8892a4', fontSize: '12px' }}>
                      {p.category} · {p.funded_at ? new Date(p.funded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#EF4444' }}>-{fmt(p.budget_max || 0)}</div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', backgroundColor: s.bg, color: s.color, fontWeight: '600' }}>
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
