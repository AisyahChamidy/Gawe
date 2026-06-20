'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, Building2, Menu, X } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

export default function NavbarKlien() {
  const [firstName, setFirstName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('client')
  const [showKonfirmasi, setShowKonfirmasi] = useState(false)
  const [aktivasi, setAktivasi] = useState(false)
  const [showBell, setShowBell] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
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
    <>
      <style>{`
        @media (max-width: 767px) {
          .nav-links-kl   { display: none !important; }
          .nav-right-kl   { display: none !important; }
          .nav-hamburger-kl { display: flex !important; }
        }
        @media (min-width: 768px) {
          .nav-hamburger-kl { display: none !important; }
          .nav-mobile-drawer-kl { display: none !important; }
        }
      `}</style>

      {/* Click-outside overlay to close drawer */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 48, background: 'transparent' }}
        />
      )}

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

        {/* Logo + mode badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/klien/dasbor" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: C.primary, fontFamily: 'Outfit, sans-serif' }}>Gawe</span>
          </a>
          <span style={{
            fontSize: '11px', padding: '3px 10px', borderRadius: R.pill,
            backgroundColor: C.primaryTint, color: C.primary,
            border: `1px solid ${C.primaryBorder}`, fontWeight: '600',
            display: 'inline-flex', alignItems: 'center', gap: '5px',
          }}><Building2 size={12} strokeWidth={1.5} /> Mode Klien</span>
        </div>

        {/* Nav links (desktop) */}
        <div className="nav-links-kl" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} style={{
              color: isActive(href) ? C.primary : C.textMuted,
              textDecoration: 'none', fontSize: '13px',
              fontWeight: isActive(href) ? '600' : '500',
              padding: '6px 14px', borderRadius: R.sm,
              backgroundColor: isActive(href) ? C.primaryTint : 'transparent',
            }}>{label}</a>
          ))}
          <a href="/klien/post-proyek" style={{
            marginLeft: '8px',
            padding: '7px 16px', backgroundColor: C.primary, color: 'white',
            textDecoration: 'none', borderRadius: R.sm, fontSize: '13px', fontWeight: '600',
          }}>+ Post Proyek</a>
        </div>

        {/* Right-side controls (desktop) */}
        <div className="nav-right-kl" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Mode switch */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleKeFreelancer}
              style={{
                fontSize: '12px', padding: '5px 12px', borderRadius: R.pill,
                border: `1px solid ${C.primaryBorder}`, color: C.primary,
                background: 'transparent', cursor: 'pointer', fontFamily: theme.fonts.body,
              }}
            >
              Ke Mode Freelancer →
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
                  Aktifkan juga mode Freelancer? Kamu bisa apply proyek setelah ini.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleAktifkanFreelancer}
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

        {/* Hamburger button (mobile only) */}
        <button
          className="nav-hamburger-kl"
          onClick={e => { e.stopPropagation(); setShowMenu(m => !m) }}
          style={{
            display: 'none',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px', color: C.textDark,
            alignItems: 'center', justifyContent: 'center',
            minWidth: 44, minHeight: 44,
          }}
          aria-label={showMenu ? 'Tutup menu' : 'Buka menu'}
        >
          {showMenu ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className="nav-mobile-drawer-kl"
        style={{
          position: 'sticky',
          top: 60,
          zIndex: 49,
          backgroundColor: C.bgWhite,
          borderBottom: `1px solid ${C.border}`,
          boxShadow: '0 8px 24px rgba(83,74,183,0.10)',
          display: showMenu ? 'block' : 'none',
        }}
      >
        {/* Nav links */}
        <div style={{ padding: '4px 16px' }}>
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} style={{
              display: 'block',
              color: isActive(href) ? C.primary : C.textDark,
              textDecoration: 'none', fontSize: '15px',
              fontWeight: isActive(href) ? '700' : '500',
              padding: '12px 4px',
              borderBottom: `1px solid ${C.border}`,
            }}>{label}</a>
          ))}
          <a href="/klien/post-proyek" style={{
            display: 'block',
            color: C.primary,
            textDecoration: 'none', fontSize: '15px',
            fontWeight: '700',
            padding: '12px 4px',
            borderBottom: `1px solid ${C.border}`,
          }}>+ Post Proyek</a>
        </div>

        {/* Bottom section: mode switch + user + logout */}
        <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => { setShowMenu(false); handleKeFreelancer() }}
            style={{
              width: '100%', padding: '11px 16px', borderRadius: R.sm,
              border: `1px solid ${C.primaryBorder}`, color: C.primary,
              background: 'transparent', cursor: 'pointer', fontFamily: theme.fonts.body,
              fontSize: '14px', fontWeight: 600, textAlign: 'left',
            }}
          >
            Ke Mode Freelancer →
          </button>

          {showKonfirmasi && (
            <div style={{
              backgroundColor: C.bgLavenderSoft,
              border: `1px solid ${C.border}`,
              borderRadius: R.md, padding: '14px',
            }}>
              <p style={{ color: C.textDark, fontSize: '13px', lineHeight: '1.5', marginBottom: '10px' }}>
                Aktifkan juga mode Freelancer? Kamu bisa apply proyek setelah ini.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAktifkanFreelancer}
                  disabled={aktivasi}
                  style={{
                    flex: 1, padding: '9px', backgroundColor: C.primary, color: 'white',
                    border: 'none', borderRadius: R.sm, fontSize: '13px',
                    fontWeight: '600', cursor: aktivasi ? 'not-allowed' : 'pointer',
                    opacity: aktivasi ? 0.7 : 1, fontFamily: theme.fonts.body,
                  }}
                >
                  {aktivasi ? 'Mengaktifkan...' : 'Ya, aktifkan'}
                </button>
                <button
                  onClick={() => setShowKonfirmasi(false)}
                  style={{
                    flex: 1, padding: '9px', backgroundColor: 'transparent',
                    color: C.textMuted, border: `1px solid ${C.border}`,
                    borderRadius: R.sm, fontSize: '13px', cursor: 'pointer',
                    fontFamily: theme.fonts.body,
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
            {firstName && (
              <span style={{ color: C.textMuted, fontSize: '14px' }}>{firstName}</span>
            )}
            <button onClick={handleLogout} style={{
              padding: '9px 18px', backgroundColor: 'transparent',
              border: `1px solid ${C.border}`, borderRadius: R.sm,
              color: C.textMuted, cursor: 'pointer', fontSize: '14px',
              fontFamily: theme.fonts.body, marginLeft: 'auto',
            }}>Keluar</button>
          </div>
        </div>
      </div>
    </>
  )
}
