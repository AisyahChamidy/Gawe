'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

  const inp = { width: '100%', padding: '12px 14px', backgroundColor: '#0d1526', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#0d1526', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px', margin: '0 16px' }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Reset Password</h1>
        <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '28px' }}>Masukkan password baru kamu.</p>

        {done ? (
          <div style={{ backgroundColor: '#152d1e', border: '1px solid #10B981', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <p style={{ color: '#10B981', fontWeight: 'bold' }}>Password berhasil diubah!</p>
            <p style={{ color: '#8892a4', fontSize: '13px', marginTop: '8px' }}>Mengalihkan ke halaman masuk...</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#8892a4', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Password Baru</label>
              <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#8892a4', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Konfirmasi Password</label>
              <input style={inp} type="password" value={konfirmasi} onChange={e => setKonfirmasi(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()} placeholder="Ulangi password baru" />
            </div>

            {error && <div style={{ backgroundColor: '#2d1515', border: '1px solid #EF4444', borderRadius: '8px', padding: '10px 14px', color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

            <button onClick={handleReset} disabled={loading} style={{ width: '100%', padding: '13px', backgroundColor: loading ? '#2a3a6a' : '#4F6EF7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
