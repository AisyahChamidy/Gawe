'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, Laptop } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

export default function Navbar() {
  const [firstName, setFirstName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('freelancer')
  const [showKonfirmasi, setShowKonfirmasi] = useState(false)
  const [aktivasi, setAktivasi] = useState(false)
  const [showBell, setShowBell] = useState(false)
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
    console.log('[Navbar] handleAktifkanKlien - userId:', userId)
    if (!userId) {
      console.error('[Navbar] userId null, batalkan aktivasi')
      setAktivasi(false)
      return
    }
    const { data, error } = await supabase.from('profiles').update({ role: 'both' }).eq('id', userId)
    console.log('[Navbar] update result - data:', data, 'error:', error)
    if (!error) setUserRole('both')
    router.push('/klien/dasbor')
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const navLinks = [
    { href: '/app/dasbor', label: 'Dashboard' },
    { href: '/app/jelajah', label: 'Jelajah Proyek' },
    { href: '/app/lamaran', label: 'Lamaranku' },
    { href: '/app/profil', label: 'Profil' },
    { href: '/app/profil/skill-test', label: 'Skill Test' },
    { href: '/app/keuangan', label: 'Keuangan' },
  ]

  return (
    <div style={{
      backgroundColor: C.bgWhite,
      borderBottom: `0.5px solid ${C.border}`,
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
          .nav-links-fl { display: none !important; }
          .nav-mode-fl { display: none !important; }
        }
      `}</style>

      {/* Logo + mode badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a href="/app/dasbor" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: C.primary, fontFamily: 'Outfit, sans-serif' }}>Gawe</span>
        </a>
        <span style={{
          fontSize: '11px', padding: '3px 10px', borderRadius: R.pill,
          backgroundColor: C.primaryTint, color: C.primary,
          border: `1px solid ${C.primaryBorder}`, fontWeight: '600',
          display: 'inline-flex', alignItems: 'center', gap: '5px',
        }}><Laptop size={12} strokeWidth={1.5} /> Mode Freelancer</span>
      </div>

      {/* Nav links */}
      <div className="nav-links-fl" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {navLinks.map(({ href, label }) => (
          <a key={href} href={href} style={{
            color: isActive(href) ? C.primary : C.textMuted,
            textDecoration: 'none', fontSize: '13px',
            fontWeight: isActive(href) ? '600' : '500',
            padding: '6px 14px', borderRadius: R.sm,
            backgroundColor: isActive(href) ? C.primaryTint : 'transparent',
          }}>{label}</a>
        ))}
      </div>

      {/* Right-side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Mode switch */}
        <div className="nav-mode-fl" style={{ position: 'relative' }}>
          <button
            onClick={handleKeKlien}
            style={{
              fontSize: '12px', padding: '5px 12px', borderRadius: R.pill,
              border: `1px solid ${C.primaryBorder}`, color: C.primary,
              background: 'transparent', cursor: 'pointer', fontFamily: theme.fonts.body,
            }}
          >
            Ke Mode Klien →
          </button>

          {showKonfirmasi && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              backgroundColor: C.bgWhite,
              border: `1px solid ${C.border}`,
              borderRadius: R.md, padding: '16px', width: '280px',
              zIndex: 200, boxShadow: theme.shadow.hover,
            }}>
              <p style={{ color: C.textDark, fontSize: '13px', lineHeight: '1.5', marginBottom: '12px' }}>
                Aktifkan juga mode Klien di akun ini? Kamu bisa post proyek setelah ini.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAktifkanKlien}
                  disabled={aktivasi}
                  style={{
                    flex: 1, padding: '8px', backgroundColor: C.primary, color: 'white',
                    border: 'none', borderRadius: R.sm, fontSize: '12px',
                    fontWeight: '600', cursor: aktivasi ? 'not-allowed' : 'pointer',
                    opacity: aktivasi ? 0.7 : 1, fontFamily: theme.fonts.body,
                  }}
                >
                  {aktivasi ? 'Mengaktifkan...' : 'Ya, aktifkan'}
                </button>
                <button
                  onClick={() => setShowKonfirmasi(false)}
                  style={{
                    flex: 1, padding: '8px', backgroundColor: 'transparent',
                    color: C.textMuted, border: `1px solid ${C.border}`,
                    borderRadius: R.sm, fontSize: '12px', cursor: 'pointer',
                    fontFamily: theme.fonts.body,
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

        {firstName && (
          <span style={{ color: C.textMuted, fontSize: '13px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {firstName}
          </span>
        )}

        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowBell(b => !b)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: C.textMuted }}>
            <Bell size={17} strokeWidth={1.8} />
          </button>
          {showBell && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              backgroundColor: C.bgWhite, border: `1px solid ${C.border}`,
              borderRadius: R.md, padding: '16px', width: '240px',
              zIndex: 200, boxShadow: theme.shadow.hover,
            }}>
              <p style={{ fontSize: '13px', color: C.textMuted, textAlign: 'center' }}>🔔 Sistem notifikasi akan segera hadir</p>
            </div>
          )}
        </div>

        <button onClick={handleLogout} style={{
          padding: '6px 14px', backgroundColor: 'transparent',
          border: `1px solid ${C.border}`, borderRadius: R.sm,
          color: C.textMuted, cursor: 'pointer', fontSize: '13px',
          fontFamily: theme.fonts.body,
        }}>Keluar</button>
      </div>
    </div>
  )
}
