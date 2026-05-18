'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function NavbarKlien() {
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

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const link = (href: string, label: string) => (
    <a href={href} style={{
      color: isActive(href) ? 'white' : 'rgba(255,255,255,0.5)',
      textDecoration: 'none', fontSize: '13px',
      fontWeight: isActive(href) ? '600' : '500',
      padding: '6px 14px', borderRadius: '6px',
      backgroundColor: isActive(href) ? 'rgba(79,110,247,0.15)' : 'transparent',
    }}>{label}</a>
  )

  return (
    <div style={{
      backgroundColor: '#111827', borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 32px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', height: 60, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <a href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '18px', fontWeight: '800', color: 'white', fontFamily: 'Outfit, sans-serif' }}>Gawe</span>
      </a>
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {link('/klien/dasbor', 'Dashboard')}
        {link('/klien/proyek', 'Proyekku')}
        {link('/klien/keuangan', 'Keuangan')}
        {link('/klien/post-proyek', '+ Post Proyek')}
        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)', fontWeight: 'bold' }}>
          🏢 Mode Klien
        </span>
        <a href="/app/dasbor" style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginRight: '4px' }}>
          Ke Mode Freelancer →
        </a>
        <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.user_metadata?.full_name || user?.email}
        </span>
        <a href="/app/dasbor" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', textDecoration: 'none', marginLeft: '4px' }}>
          Mode Freelancer
        </a>
        <button onClick={handleLogout} style={{
          padding: '6px 14px', backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px', marginLeft: '4px',
        }}>Keluar</button>
      </div>
    </div>
  )
}
