'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export default function KeuanganKlienPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }

      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('created_at', { ascending: false })

      setTransactions(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const totalBulanIni = transactions
    .filter(t => {
      const d = new Date(t.created_at)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.status === 'completed'
    })
    .reduce((s, t) => s + t.amount, 0)

  const totalLifetime = transactions
    .filter(t => t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0)

  const pending = transactions.filter(t => t.status === 'pending')
  const totalPending = pending.reduce((s, t) => s + t.amount, 0)

  const stats = [
    { icon: '📅', label: 'Pengeluaran Bulan Ini', value: fmt(totalBulanIni), color: '#EF4444' },
    { icon: '✅', label: 'Sudah Dibayar', value: fmt(totalLifetime), color: '#10B981' },
    { icon: '⏳', label: 'Menunggu Proses', value: fmt(totalPending), color: '#FBBF24' },
    { icon: '📋', label: 'Total Proyek', value: String(transactions.length), color: '#4F6EF7' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <NavbarKlien />
      <div style={{ padding: '40px 32px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>Keuangan</h1>
        <p style={{ color: '#8892a4', marginBottom: '32px' }}>Pantau pengeluaran dan riwayat pembayaran proyekmu</p>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
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
          ) : transactions.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#8892a4' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💳</div>
              <p>Belum ada riwayat pembayaran.</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Pembayaran akan muncul setelah kamu mendanai proyek.</p>
            </div>
          ) : transactions.map(t => (
            <div key={t.id} style={{ padding: '16px 24px', borderBottom: '1px solid #0d1526', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: '#2d1515', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  ↓
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{t.description}</div>
                  <div style={{ color: '#8892a4', fontSize: '12px' }}>{t.category} · {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#EF4444' }}>-{fmt(t.amount)}</div>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', backgroundColor: t.status === 'completed' ? '#152d1e' : '#2a2a00', color: t.status === 'completed' ? '#10B981' : '#FBBF24' }}>
                  {t.status === 'completed' ? 'Selesai' : 'Menunggu'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
