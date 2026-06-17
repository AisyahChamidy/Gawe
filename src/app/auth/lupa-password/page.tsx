'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Mail, CheckCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

const STATUS_RED = '#EF4444'

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit() {
    if (!email.trim()) { setError('Masukkan email kamu'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://gawe.vercel.app/auth/reset-password',
    })
    if (error) {
      setError('Email tidak ditemukan atau terjadi kesalahan.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px 10px 38px',
    backgroundColor: C.bgWhite, border: `1px solid ${C.border}`,
    borderRadius: R.sm, color: C.textDark, fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgLavenderSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: theme.fonts.body }}>
      <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, padding: '40px', width: '100%', maxWidth: '400px', margin: '0 16px', boxShadow: theme.shadow.hover }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: C.textDark, fontFamily: theme.fonts.headline, marginBottom: '6px' }}>Gawe</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: C.textDark, marginBottom: '6px' }}>Lupa Password</h1>
          <p style={{ color: C.textMuted, fontSize: '14px' }}>
            Masukkan email kamu dan kami akan kirim link reset password.
          </p>
        </div>

        {sent ? (
          <div style={{ backgroundColor: C.successTint, border: `1px solid ${C.success}33`, borderRadius: R.sm, padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <CheckCircle size={40} strokeWidth={1.5} color={C.success} />
            </div>
            <p style={{ color: C.success, fontWeight: 700, marginBottom: '8px' }}>Email terkirim!</p>
            <p style={{ color: C.textMuted, fontSize: '13px' }}>Cek inbox {email} dan klik link reset password.</p>
            <p style={{ color: C.textMuted, fontSize: '12px', marginTop: '8px' }}>Tidak ada email? Cek folder spam.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: C.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Mail size={16} strokeWidth={1.5} color={C.textTertiary} />
                </div>
                <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="email@kamu.com" />
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: STATUS_RED + '18', border: `1px solid ${STATUS_RED}33`, borderRadius: R.sm, padding: '10px 14px', color: STATUS_RED, fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '13px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: R.sm, fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: '16px' }}>
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', color: C.textMuted, marginTop: '16px', fontSize: '14px' }}>
          <Link href="/auth/masuk" style={{ color: C.primary, textDecoration: 'none', fontWeight: 500 }}>← Kembali ke halaman masuk</Link>
        </p>
      </div>
    </div>
  )
}
