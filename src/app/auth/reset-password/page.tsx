'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

const STATUS_RED = '#EF4444'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleReset() {
    if (password.length < 6) { setError('Password minimal 6 karakter'); return }
    if (password !== konfirmasi) { setError('Password tidak cocok'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Gagal reset password. Coba minta link baru.')
    } else {
      setDone(true)
      setTimeout(() => router.push('/auth/masuk'), 3000)
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
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: C.textDark, marginBottom: '6px' }}>Reset Password</h1>
          <p style={{ color: C.textMuted, fontSize: '14px' }}>Masukkan password baru kamu.</p>
        </div>

        {done ? (
          <div style={{ backgroundColor: C.successTint, border: `1px solid ${C.success}33`, borderRadius: R.sm, padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <CheckCircle size={40} strokeWidth={1.5} color={C.success} />
            </div>
            <p style={{ color: C.success, fontWeight: 700, marginBottom: '8px' }}>Password berhasil diubah!</p>
            <p style={{ color: C.textMuted, fontSize: '13px', marginTop: '8px' }}>Mengalihkan ke halaman masuk...</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: C.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Password Baru</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Lock size={16} strokeWidth={1.5} color={C.textTertiary} />
                </div>
                <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: C.textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Konfirmasi Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Lock size={16} strokeWidth={1.5} color={C.textTertiary} />
                </div>
                <input style={inp} type="password" value={konfirmasi} onChange={e => setKonfirmasi(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()} placeholder="Ulangi password baru" />
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: STATUS_RED + '18', border: `1px solid ${STATUS_RED}33`, borderRadius: R.sm, padding: '10px 14px', color: STATUS_RED, fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button onClick={handleReset} disabled={loading} style={{ width: '100%', padding: '13px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: R.sm, fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
