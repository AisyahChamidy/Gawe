'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import NavbarKlien from '@/components/NavbarKlien'
import { Bell, CheckCheck } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

type Notif = {
  id: string
  type: string
  title: string
  body: string
  action_url: string | null
  read_at: string | null
  created_at: string
}

function relTime(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 2) return 'Baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const days = Math.floor(h / 24)
  if (days < 30) return `${days} hari lalu`
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [loading, setLoading]             = useState(true)
  const [role, setRole]                   = useState<string | null>(null)
  const [markingAll, setMarkingAll]       = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }

      const [{ data: profile }, { data: notifs }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).single(),
        supabase
          .from('notifications')
          .select('id, type, title, body, action_url, read_at, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      setRole(profile?.role || 'freelancer')
      setNotifications(notifs || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleClick(n: Notif) {
    if (!n.read_at) {
      const now = new Date().toISOString()
      await supabase.from('notifications').update({ read_at: now }).eq('id', n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read_at: now } : x))
    }
    if (n.action_url) router.push(n.action_url)
  }

  async function handleMarkAll() {
    setMarkingAll(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const now = new Date().toISOString()
      await supabase.from('notifications').update({ read_at: now }).eq('user_id', user.id).is('read_at', null)
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? now })))
    }
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter(n => !n.read_at).length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      {role === 'client' ? <NavbarKlien /> : role ? <Navbar /> : null}

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px) 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 800, margin: 0, color: C.textDark, fontFamily: theme.fonts.headline }}>
              Notifikasi
            </h1>
            {!loading && unreadCount > 0 && (
              <p style={{ color: C.textMuted, marginTop: '4px', marginBottom: 0, fontSize: '14px' }}>
                {unreadCount} belum dibaca
              </p>
            )}
          </div>
          {!loading && unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={markingAll}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', backgroundColor: C.primaryTint, color: C.primary,
                border: `1px solid ${C.primaryBorder}`, borderRadius: R.sm,
                fontSize: '13px', fontWeight: 600, cursor: markingAll ? 'not-allowed' : 'pointer',
                opacity: markingAll ? 0.7 : 1, fontFamily: theme.fonts.body,
              }}
            >
              <CheckCheck size={14} strokeWidth={1.5} />
              {markingAll ? 'Menandai...' : 'Tandai semua dibaca'}
            </button>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ textAlign: 'center', color: C.textMuted, padding: '60px' }}>Memuat...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: C.bgLavenderSoft, borderRadius: R.lg, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.25 }}>
              <Bell size={48} strokeWidth={1} color={C.textDark} />
            </div>
            <p style={{ color: C.textMuted, fontSize: '15px', margin: 0 }}>Belum ada notifikasi</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: C.border, borderRadius: R.md, overflow: 'hidden', boxShadow: theme.shadow.card }}>
            {notifications.map(n => {
              const isUnread = !n.read_at
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    padding: '16px 20px',
                    backgroundColor: isUnread ? C.bgLavenderSoft : C.bgWhite,
                    cursor: n.action_url ? 'pointer' : 'default',
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => {
                    if (n.action_url) e.currentTarget.style.backgroundColor = isUnread ? C.primaryTint : C.bgLavenderSoft
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = isUnread ? C.bgLavenderSoft : C.bgWhite
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: '4px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isUnread ? C.primary : C.border }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: isUnread ? 600 : 400, color: C.textDark, margin: '0 0 3px' }}>
                      {n.title}
                    </p>
                    <p style={{ fontSize: '13px', color: C.textMuted, lineHeight: '1.5', margin: '0 0 5px' }}>
                      {n.body}
                    </p>
                    <p style={{ fontSize: '11px', color: C.textTertiary, margin: 0 }}>
                      {relTime(n.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
