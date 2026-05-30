'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function NavbarKlien() {
  const [firstName, setFirstName] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      const name = profile?.full_name || user.user_metadata?.full_name || user.email || ''
      setFirstName(name.split(' ')[0])
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const navLinks = [
    { href: '/klien/dasbor', label: 'Dashboard' },
    { href: '/klien/proyek', label: 'Proyekku' },
    { href: '/klien/keuangan', label: 'Keuangan' },
  ]

  return (
    <div style={{
      backgroundColor: '#0F1628',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 60,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a href="/klien/dasbor" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#4F6EF7', fontFamily: 'Outfit, sans-serif' }}>Gawe</span>
        </a>
        <span style={{
          fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
          backgroundColor: 'rgba(139,92,246,0.15)', color: '#8B5CF6',
          border: '1px solid rgba(139,92,246,0.3)', fontWeight: 'bold',
        }}>🏢 Mode Klien</span>
      </div>

      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {navLinks.map(({ href, label }) => (
          <a key={href} href={href} style={{
            color: isActive(href) ? 'white' : 'rgba(255,255,255,0.5)',
            textDecoration: 'none', fontSize: '13px',
            fontWeight: isActive(href) ? '600' : '500',
            padding: '6px 14px', borderRadius: '6px',
            backgroundColor: isActive(href) ? 'rgba(139,92,246,0.2)' : 'transparent',
          }}>{label}</a>
        ))}
        <a href="/klien/post-proyek" style={{
          marginLeft: '8px',
          padding: '7px 16px', backgroundColor: '#8B5CF6', color: 'white',
          textDecoration: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold',
        }}>+ Post Proyek</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <a href="/app/dasbor" style={{
          fontSize: '12px', padding: '4px 10px', borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
          textDecoration: 'none',
        }}>Ke Mode Freelancer →</a>
        <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        {firstName && (
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {firstName}
          </span>
        )}
        <button onClick={handleLogout} style={{
          padding: '6px 14px', backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px',
        }}>Keluar</button>
      </div>
    </div>
  )
}
