'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Lamaran = {
  id: string
  status: string
  created_at: string
  projects: {
    title: string
    category: string
    budget_min: number
    budget_max: number
    estimated_days: number
  }
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending:  { label: 'Menunggu', bg: '#2d2a15', color: '#F59E0B' },
    accepted: { label: 'Diterima', bg: '#152d1e', color: '#10B981' },
    rejected: { label: 'Ditolak',  bg: '#2d1515', color: '#EF4444' },
  }[status] || { label: status, bg: '#1a2340', color: '#8892a4' }

  return (
    <span style={{
      backgroundColor: config.bg,
      color: config.color,
      fontSize: '12px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontWeight: 'bold',
    }}>
      {config.label}
    </span>
  )
}

export default function LamaranPage() {
  const [lamaran, setLamaran] = useState<Lamaran[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchLamaran() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/masuk')
        return
      }

      const { data } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          projects (
            title,
            category,
            budget_min,
            budget_max,
            estimated_days
          )
        `)
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false })

      setLamaran((data as any) || [])
      setLoading(false)
    }
    fetchLamaran()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      {/* Navbar */}
      <div style={{
        backgroundColor: '#131929',
        borderBottom: '1px solid #1e2d4a',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4F6EF7' }}>Gawe</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="/app/dasbor" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '14px' }}>Dashboard</a>
          <a href="/app/jelajah" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '14px' }}>Jelajah Proyek</a>
          <a href="/app/lamaran" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Lamaranku</a>
        </div>
      </div>

      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Lamaranku</h1>
        <p style={{ color: '#8892a4', marginBottom: '32px' }}>
          {loading ? 'Memuat...' : `${lamaran.length} lamaran terkirim`}
        </p>

        {loading ? (
          <div style={{ color: '#8892a4', textAlign: 'center', padding: '60px' }}>Memuat...</div>
        ) : lamaran.length === 0 ? (
          <div style={{
            backgroundColor: '#131929',
            border: '1px solid #1e2d4a',
            borderRadius: '12px',
            padding: '60px',
            textAlign: 'center',
            color: '#8892a4'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
            <p>Belum ada lamaran. Yuk jelajahi proyek!</p>
            <a href="/app/jelajah" style={{
              display: 'inline-block',
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: '#4F6EF7',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 'bold',
            }}>
              Jelajah Proyek
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lamaran.map(item => (
              <div key={item.id} style={{
                backgroundColor: '#131929',
                border: '1px solid #1e2d4a',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{
                      backgroundColor: '#1a2340',
                      color: '#4F6EF7',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      marginRight: '8px',
                    }}>
                      {item.projects?.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '8px 0 4px' }}>
                    {item.projects?.title}
                  </h3>
                  <span style={{ color: '#22D3EE', fontSize: '14px' }}>
                    {formatRupiah(item.projects?.budget_min)} – {formatRupiah(item.projects?.budget_max)}
                  </span>
                  <span style={{ color: '#8892a4', fontSize: '12px', marginLeft: '12px' }}>
                    {item.projects?.estimated_days} hari
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={item.status} />
                  <div style={{ color: '#8892a4', fontSize: '11px', marginTop: '8px' }}>
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}