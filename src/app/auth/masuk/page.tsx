'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email atau password salah')
      setLoading(false)
    } else {
      router.push('/app/dasbor')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0E1A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: '#131929',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #1e2d4a'
      }}>
        <h1 style={{ color: 'white', marginBottom: '8px', fontSize: '24px' }}>
          Masuk ke Gawe
        </h1>
        <p style={{ color: '#8892a4', marginBottom: '32px', fontSize: '14px' }}>
          Lanjutkan perjalanan freelance-mu
        </p>

        {error && (
          <div style={{
            backgroundColor: '#2d1515',
            color: '#ff6b6b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8892a4', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@kamu.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#0A0E1A',
              border: '1px solid #1e2d4a',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#8892a4', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password kamu"
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#0A0E1A',
              border: '1px solid #1e2d4a',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleMasuk}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4F6EF7',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Masuk...' : 'Masuk'}
        </button>

        <p style={{ color: '#8892a4', textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          Lupa password?{' '}
          <Link href="/auth/lupa-password" style={{ color: '#8892a4' }}>
            Reset di sini
          </Link>
        </p>
        <p style={{ textAlign: 'center', color: '#8892a4', marginTop: '12px', fontSize: '14px' }}>
          Belum punya akun?{' '}
          <Link href="/auth/daftar" style={{ color: '#4F6EF7' }}>
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}