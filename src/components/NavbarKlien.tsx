'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, Building2, Menu, X } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

type Notif = { id: string; type: string; title: string; body: string; action_url: string | null; read_at: string | null; created_at: string }

function relTime(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 2) return 'Baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

export default function NavbarKlien() {
  const [firstName, setFirstName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('client')
  const [showKonfirmasi, setShowKonfirmasi] = useState(false)
  const [aktivasi, setAktivasi] = useState(false)
  const [showBell, setShowBell] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
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
      const { data: notifs } = await supabase
        .from('notifications')
        .select('id, type, title, body, action_url, read_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (notifs) {
        setNotifications(notifs)
        setUnreadCount(notifs.filter((n: Notif) => !n.read_at).length)
      }
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleNotifClick(n: Notif) {
    if (!n.read_at) {
      const now = new Date().toISOString()
      await supabase.from('notifications').update({ read_at: now }).eq('id', n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read_at: now } : x))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setShowBell(false)
    if (n.action_url) router.push(n.action_url)
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
      {(showMenu || showBell) && (
        <div
          onClick={() => { setShowMenu(false); setShowBell(false) }}
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
            <button onClick={() => setShowBell(b => !b)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: C.textMuted }}>
              <Bell size={17} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444', color: 'white', fontSize: '9px', fontWeight: 700, minWidth: 14, height: 14, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px', pointerEvents: 'none' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showBell && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, width: '320px', zIndex: 200, boxShadow: theme.shadow.hover, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: C.textDark }}>Notifikasi</span>
                  {unreadCount > 0 && <span style={{ fontSize: '11px', color: C.primary, fontWeight: 600 }}>{unreadCount} baru</span>}
                </div>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '13px', color: C.textMuted, textAlign: 'center', padding: '20px 16px', margin: 0 }}>Belum ada notifikasi</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} onClick={() => handleNotifClick(n)}
                      style={{ padding: '12px 16px', backgroundColor: n.read_at ? C.bgWhite : C.bgLavenderSoft, cursor: 'pointer', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: n.read_at ? 'transparent' : C.primary, flexShrink: 0, marginTop: '5px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: n.read_at ? 400 : 600, color: C.textDark, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</p>
                        <p style={{ fontSize: '12px', color: C.textMuted, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</p>
                        <p style={{ fontSize: '11px', color: C.textTertiary, margin: 0 }}>{relTime(n.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
                <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
                  <a href="/notifikasi" onClick={() => setShowBell(false)} style={{ fontSize: '12px', color: C.primary, textDecoration: 'none', fontWeight: 500 }}>Lihat semua →</a>
                </div>
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
