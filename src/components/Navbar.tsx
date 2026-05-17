'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  const linkStyle = (path: string) => ({
    color: isActive(path) ? 'white' : 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: isActive(path) ? '600' : '500',
    padding: '6px 14px',
    borderRadius: '6px',
    backgroundColor: isActive(path) ? 'rgba(79,110,247,0.15)' : 'transparent',
  } as React.CSSProperties)

  return (
    <div style={{
      backgroundColor: '#111827',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 60,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <a href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '18px', fontWeight: '800', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
          Gawe
        </span>
      </a>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <a href="/app/dasbor" style={linkStyle('/app/dasbor')}>Dashboard</a>
        <a href="/app/jelajah" style={linkStyle('/app/jelajah')}>Jelajah Proyek</a>
        <a href="/app/lamaran" style={linkStyle('/app/lamaran')}>Lamaranku</a>
        <a href="/app/profil" style={linkStyle('/app/profil')}>Profil</a>
        <a href="/klien/post-proyek" style={linkStyle('/klien/post-proyek')}>Post Proyek</a>
        <a href="/klien/proyek" style={linkStyle('/klien/proyek')}>Proyekku</a>

        <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

        {user && (
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.user_metadata?.full_name || user.email}
          </span>
        )}

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
  )
}
