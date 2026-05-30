'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [firstName, setFirstName] = useState('')
  const [userRole, setUserRole] = useState<string>('freelancer')
  const [showKonfirmasi, setShowKonfirmasi] = useState(false)
  const [aktivasi, setAktivasi] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
      const name = profile?.full_name || user.user_metadata?.full_name || user.email || ''
      setFirstName(name.split(' ')[0])
      setUserRole(profile?.role || 'freelancer')
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleKeKlien() {
    if (userRole === 'client' || userRole === 'both') {
      router.push('/klien/dasbor')
    } else {
      setShowKonfirmasi(true)
    }
  }

  async function handleAktifkanKlien() {
    setAktivasi(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ role: 'both' }).eq('id', user.id)
    }
    router.push('/klien/dasbor')
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const navLinks = [
    { href: '/app/dasbor', label: 'Dashboard' },
    { href: '/app/jelajah', label: 'Jelajah Proyek' },
    { href: '/app/lamaran', label: 'Lamaranku' },
    { href: '/app/profil', label: 'Profil' },
    { href: '/app/keuangan', label: 'Keuangan' },
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
        <a href="/app/dasbor" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#4F6EF7', fontFamily: 'Outfit, sans-serif' }}>Gawe</span>
        </a>
        <span style={{
          fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
          backgroundColor: 'rgba(79,110,247,0.15)', color: '#4F6EF7',
          border: '1px solid rgba(79,110,247,0.3)', fontWeight: 'bold',
        }}>👨‍💻 Mode Freelancer</span>
      </div>

      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {navLinks.map(({ href, label }) => (
          <a key={href} href={href} style={{
            color: isActive(href) ? 'white' : 'rgba(255,255,255,0.5)',
            textDecoration: 'none', fontSize: '13px',
            fontWeight: isActive(href) ? '600' : '500',
            padding: '6px 14px', borderRadius: '6px',
            backgroundColor: isActive(href) ? 'rgba(79,110,247,0.2)' : 'transparent',
          }}>{label}</a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Tombol mode switch + konfirmasi */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleKeKlien}
            style={{
              fontSize: '12px', padding: '4px 10px', borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
              background: 'transparent', cursor: 'pointer',
            }}
          >
            Ke Mode Klien →
          </button>

          {showKonfirmasi && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              backgroundColor: '#131929', border: '1px solid #1e2d4a',
              borderRadius: '12px', padding: '16px', width: '280px',
              zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <p style={{ color: 'white', fontSize: '13px', lineHeight: '1.5', marginBottom: '12px' }}>
                Aktifkan juga mode Klien di akun ini? Kamu bisa post proyek setelah ini.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAktifkanKlien}
                  disabled={aktivasi}
                  style={{
                    flex: 1, padding: '8px', backgroundColor: '#8B5CF6', color: 'white',
                    border: 'none', borderRadius: '6px', fontSize: '12px',
                    fontWeight: 'bold', cursor: aktivasi ? 'not-allowed' : 'pointer',
                    opacity: aktivasi ? 0.7 : 1,
                  }}
                >
                  {aktivasi ? 'Mengaktifkan...' : 'Ya, aktifkan'}
                </button>
                <button
                  onClick={() => setShowKonfirmasi(false)}
                  style={{
                    flex: 1, padding: '8px', backgroundColor: 'transparent',
                    color: '#8892a4', border: '1px solid #1e2d4a',
                    borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

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
