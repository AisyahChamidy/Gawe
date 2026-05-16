'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function DasborPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/masuk')
      else { setUser(user); setLoading(false) }
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      Memuat...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ padding: '40px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>
          Selamat datang, {user?.user_metadata?.full_name || 'Pengguna'}! 👋
        </h1>
        <p style={{ color: '#8892a4', marginBottom: '40px' }}>
          Dashboard kamu sedang dibangun. Ini akan jadi pusat kendali freelance-mu.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Proyek Aktif', value: '0', color: '#4F6EF7' },
            { label: 'Lamaran Terkirim', value: '0', color: '#8B5CF6' },
            { label: 'Trust Score', value: '10', color: '#22D3EE' },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
              <div style={{ color: '#8892a4', fontSize: '14px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#8892a4' }}>
          🚧 Fitur lengkap sedang dibangun. Pantau terus!
        </div>
      </div>
    </div>
  )
}
