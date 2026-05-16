'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DasborPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/masuk')
      } else {
        setUser(user)
        setLoading(false)
      }
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0A0E1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'sans-serif'
      }}>
        Memuat...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0E1A',
      fontFamily: 'sans-serif',
      color: 'white'
    }}>
      {/* Navbar */}
      <div style={{
        backgroundColor: '#111827',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 60,
      }}>
        <span style={{ fontSize: '18px', fontWeight: '800', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
          Gawe
        </span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <a href="/app/dasbor" style={{ color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: '600', padding: '6px 14px', borderRadius: '6px', backgroundColor: 'rgba(79,110,247,0.15)' }}>
            Dashboard
          </a>
          <a href="/app/jelajah" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: '500', padding: '6px 14px', borderRadius: '6px' }}>
            Jelajah Proyek
          </a>
          <a href="/app/lamaran" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: '500', padding: '6px 14px', borderRadius: '6px' }}>
            Lamaranku
          </a>
          <a href="/klien/post-proyek" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: '500', padding: '6px 14px', borderRadius: '6px' }}>
            Post Proyek
          </a>
          <a href="/klien/proyek" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: '500', padding: '6px 14px', borderRadius: '6px' }}>
            Proyekku
          </a>
          <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            {user?.user_metadata?.full_name || user?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 14px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: '13px',
              marginLeft: '4px',
            }}
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 32px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>
          Selamat datang, {user?.user_metadata?.full_name || 'Pengguna'}! 👋
        </h1>
        <p style={{ color: '#8892a4', marginBottom: '40px' }}>
          Dashboard kamu sedang dibangun. Ini akan jadi pusat kendali freelance-mu.
        </p>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Proyek Aktif', value: '0', color: '#4F6EF7' },
            { label: 'Lamaran Terkirim', value: '0', color: '#8B5CF6' },
            { label: 'Trust Score', value: '10', color: '#22D3EE' },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor: '#131929',
              border: '1px solid #1e2d4a',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ color: '#8892a4', fontSize: '14px', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div style={{
          backgroundColor: '#131929',
          border: '1px solid #1e2d4a',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#8892a4'
        }}>
          🚧 Fitur lengkap sedang dibangun. Pantau terus!
        </div>
      </div>
    </div>
  )
}