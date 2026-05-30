'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function NavbarKlien() {
  const [firstName, setFirstName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('client')
  const [showKonfirmasi, setShowKonfirmasi] = useState(false)
  const [aktivasi, setAktivasi] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
      const name = profile?.full_name || user.user_metadata?.full_name || user.email || ''
      setFirstName(name.split(' ')[0])
      setUserRole(profile?.role || 'client')
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleKeFreelancer() {
    if (userRole === 'freelancer' || userRole === 'both') {
      router.push('/app/dasbor')
    } else {
      setShowKonfirmasi(true)
    }
  }

  async function handleAktifkanFreelancer() {
    setAktivasi(true)
    console.log('[NavbarKlien] handleAktifkanFreelancer - userId:', userId)
    if (!userId) {
      console.error('[NavbarKlien] userId null, batalkan aktivasi')
      setAktivasi(false)
      return
    }
    const { data, error } = await supabase.from('profiles').update({ role: 'both' }).eq('id', userId)
    console.log('[NavbarKlien] update result - data:', data, 'error:', error)
    if (!error) setUserRole('both')
    router.push('/app/dasbor')
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
      padding: '0 clamp(16px, 4vw, 32px)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 60,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <style>{`
        @media (max-width: 768px) {
          .nav-links-kl { display: none !important; }
          .nav-mode-kl { display: none !important; }
        }
      `}</style>
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

      <div className="nav-links-kl" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
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
        {/* Tombol mode switch + konfirmasi */}
        <div className="nav-mode-kl" style={{ position: 'relative' }}>
          <button
            onClick={handleKeFreelancer}
            style={{
              fontSize: '12px', padding: '4px 10px', borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
              background: 'transparent', cursor: 'pointer',
            }}
          >
            Ke Mode Freelancer →
          </button>

          {showKonfirmasi && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              backgroundColor: '#131929', border: '1px solid #1e2d4a',
              borderRadius: '12px', padding: '16px', width: '280px',
              zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <p style={{ color: 'white', fontSize: '13px', lineHeight: '1.5', marginBottom: '12px' }}>
                Aktifkan juga mode Freelancer? Kamu bisa apply proyek setelah ini.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAktifkanFreelancer}
                  disabled={aktivasi}
                  style={{
                    flex: 1, padding: '8px', backgroundColor: '#4F6EF7', color: 'white',
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
