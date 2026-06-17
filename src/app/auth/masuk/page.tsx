'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

const STATUS_RED = '#EF4444'

export default function MasukPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  async function handleMasuk() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email atau password salah')
      setLoading(false)
    } else {
      // Cek role dari profiles
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      const role = profile?.role || 'freelancer'
      if (role === 'client') {
        router.push('/klien/dasbor')
      } else {
        router.push('/app/dasbor')
      }
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px 10px 38px',
    backgroundColor: C.bgWhite, border: `1px solid ${C.border}`,
    borderRadius: R.sm, color: C.textDark, fontSize: '14px',
    boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: C.bgLavenderSoft,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: theme.fonts.body, padding: '16px',
    }}>
      <div style={{
        backgroundColor: C.bgWhite, padding: 'clamp(24px, 5vw, 40px)',
        borderRadius: R.lg, width: '100%', maxWidth: '420px',
        border: `1px solid ${C.border}`, boxShadow: theme.shadow.hover,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: C.textDark, fontFamily: theme.fonts.headline, marginBottom: '6px' }}>
            Gawe
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: C.textDark, marginBottom: '6px' }}>
            Masuk ke akunmu
          </h1>
          <p style={{ color: C.textMuted, fontSize: '14px' }}>
            Lanjutkan perjalanan freelance-mu
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: STATUS_RED + '18', color: STATUS_RED,
            border: `1px solid ${STATUS_RED}33`,
            padding: '10px 14px', borderRadius: R.sm,
            marginBottom: '16px', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '14px' }}>
          <label style={{ color: C.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Mail size={16} strokeWidth={1.5} color={C.textTertiary} />
            </div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleMasuk()}
              placeholder="email@kamu.com" style={inp} />
          </div>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ color: C.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Lock size={16} strokeWidth={1.5} color={C.textTertiary} />
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleMasuk()}
              placeholder="Password kamu" style={inp} />
          </div>
        </div>

        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <Link href="/auth/lupa-password" style={{ color: C.primary, fontSize: '13px', textDecoration: 'none' }}>
            Lupa password?
          </Link>
        </div>

        <button onClick={handleMasuk} disabled={loading} style={{
          width: '100%', padding: '12px', backgroundColor: C.primary,
          color: 'white', border: 'none', borderRadius: R.sm,
          fontSize: '15px', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Masuk...' : 'Masuk'}
        </button>

        <p style={{ color: C.textMuted, textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Belum punya akun?{' '}
          <Link href="/auth/daftar" style={{ color: C.primary, fontWeight: 600, textDecoration: 'none' }}>
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
