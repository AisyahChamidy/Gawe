'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

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

  const inp = { width: '100%', padding: '12px 14px', backgroundColor: '#0d1526', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#0d1526', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px', margin: '0 16px' }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Lupa Password</h1>
        <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '28px' }}>
          Masukkan email kamu dan kami akan kirim link reset password.
        </p>

        {sent ? (
          <div style={{ backgroundColor: '#152d1e', border: '1px solid #10B981', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📧</div>
            <p style={{ color: '#10B981', fontWeight: 'bold', marginBottom: '8px' }}>Email terkirim!</p>
            <p style={{ color: '#8892a4', fontSize: '13px' }}>Cek inbox {email} dan klik link reset password.</p>
            <p style={{ color: '#8892a4', fontSize: '12px', marginTop: '8px' }}>Tidak ada email? Cek folder spam.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#8892a4', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Email</label>
              <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="email@kamu.com" />
            </div>

            {error && <div style={{ backgroundColor: '#2d1515', border: '1px solid #EF4444', borderRadius: '8px', padding: '10px 14px', color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '13px', backgroundColor: loading ? '#2a3a6a' : '#4F6EF7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px' }}>
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', color: '#8892a4', marginTop: '16px', fontSize: '14px' }}>
          <Link href="/auth/masuk" style={{ color: '#4F6EF7', textDecoration: 'none' }}>← Kembali ke halaman masuk</Link>
        </p>
      </div>
    </div>
  )
}
