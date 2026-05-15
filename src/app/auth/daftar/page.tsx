'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DaftarPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'freelancer' | 'client'>('freelancer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  async function handleDaftar() {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role }
      }
    })

    if (error) {
      setError(error.message)
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
          Daftar ke Gawe
        </h1>
        <p style={{ color: '#8892a4', marginBottom: '32px', fontSize: '14px' }}>
          Mulai perjalanan freelance-mu hari ini
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
            Nama lengkap
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Budi Santoso"
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

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8892a4', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="budi@email.com"
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

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8892a4', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
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
            Saya daftar sebagai
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['freelancer', 'client'].map(r => (
              <button
                key={r}
                onClick={() => setRole(r as 'freelancer' | 'client')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: role === r ? '2px solid #4F6EF7' : '1px solid #1e2d4a',
                  backgroundColor: role === r ? '#1a2340' : '#0A0E1A',
                  color: role === r ? '#4F6EF7' : '#8892a4',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textTransform: 'capitalize'
                }}
              >
                {r === 'freelancer' ? 'Freelancer' : 'Klien'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleDaftar}
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
          {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
        </button>

        <p style={{ color: '#8892a4', textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          Sudah punya akun?{' '}
          <Link href="/auth/masuk" style={{ color: '#4F6EF7' }}>
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}