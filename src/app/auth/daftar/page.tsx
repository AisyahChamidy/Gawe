'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Role = 'freelancer' | 'client'

export default function DaftarPage() {
  const [step, setStep] = useState<'pilih-peran' | 'form'>('pilih-peran')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  function handlePilihPeran(role: Role) {
    setSelectedRole(role)
    setStep('form')
  }

  async function handleDaftar() {
    if (!selectedRole) return
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: selectedRole } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        role: selectedRole,
      })
    }

    if (selectedRole === 'client') {
      router.push('/klien/dasbor')
    } else {
      router.push('/app/dasbor')
    }
  }

  const inp = {
    width: '100%', padding: '10px 12px', backgroundColor: '#0A0E1A',
    border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white',
    fontSize: '14px', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0A0E1A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        backgroundColor: '#131929', padding: '40px', borderRadius: '12px',
        width: '100%', maxWidth: step === 'pilih-peran' ? '480px' : '420px',
        border: '1px solid #1e2d4a',
      }}>

        {step === 'pilih-peran' ? (
          <>
            <h1 style={{ color: 'white', marginBottom: '8px', fontSize: '24px' }}>Daftar ke Gawe</h1>
            <p style={{ color: '#8892a4', marginBottom: '32px', fontSize: '14px' }}>Kamu bergabung sebagai apa?</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => handlePilihPeran('freelancer')}
                style={{
                  padding: '20px 24px', borderRadius: '12px', border: '2px solid #1e2d4a',
                  backgroundColor: '#0A0E1A', cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#4F6EF7')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e2d4a')}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>👨‍💻</div>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>Saya Freelancer</div>
                <div style={{ color: '#8892a4', fontSize: '13px' }}>Cari proyek, bangun portofolio, dan kembangkan skill-mu</div>
              </button>

              <button
                onClick={() => handlePilihPeran('client')}
                style={{
                  padding: '20px 24px', borderRadius: '12px', border: '2px solid #1e2d4a',
                  backgroundColor: '#0A0E1A', cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#8B5CF6')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e2d4a')}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏢</div>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>Saya Klien / Bisnis</div>
                <div style={{ color: '#8892a4', fontSize: '13px' }}>Post proyek dan temukan freelancer yang tepat untuk bisnismu</div>
              </button>
            </div>

            <p style={{ color: '#8892a4', textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
              Sudah punya akun?{' '}
              <Link href="/auth/masuk" style={{ color: '#4F6EF7' }}>Masuk</Link>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep('pilih-peran')}
              style={{ background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '20px' }}
            >
              ← Ganti peran
            </button>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: selectedRole === 'client' ? 'rgba(139,92,246,0.15)' : 'rgba(79,110,247,0.15)',
              border: `1px solid ${selectedRole === 'client' ? 'rgba(139,92,246,0.3)' : 'rgba(79,110,247,0.3)'}`,
              borderRadius: '20px', padding: '4px 12px', marginBottom: '20px',
            }}>
              <span style={{ fontSize: '13px' }}>{selectedRole === 'client' ? '🏢' : '👨‍💻'}</span>
              <span style={{ color: selectedRole === 'client' ? '#8B5CF6' : '#4F6EF7', fontSize: '13px', fontWeight: 'bold' }}>
                {selectedRole === 'client' ? 'Klien / Bisnis' : 'Freelancer'}
              </span>
            </div>

            <h1 style={{ color: 'white', marginBottom: '4px', fontSize: '22px' }}>Buat akun</h1>
            <p style={{ color: '#8892a4', marginBottom: '28px', fontSize: '14px' }}>Mulai perjalananmu di Gawe</p>

            {error && (
              <div style={{ backgroundColor: '#2d1515', color: '#ff6b6b', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#8892a4', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nama lengkap</label>
              <input type="text" style={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Budi Santoso" />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#8892a4', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="budi@email.com" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#8892a4', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Password</label>
              <input type="password" style={inp} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
            </div>

            <button
              onClick={handleDaftar}
              disabled={loading}
              style={{
                width: '100%', padding: '12px', color: 'white', border: 'none',
                borderRadius: '8px', fontSize: '15px', fontWeight: 'bold',
                backgroundColor: selectedRole === 'client' ? '#8B5CF6' : '#4F6EF7',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>

            <p style={{ color: '#8892a4', textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
              Sudah punya akun?{' '}
              <Link href="/auth/masuk" style={{ color: '#4F6EF7' }}>Masuk</Link>
            </p>
          </>
        )}

      </div>
    </div>
  )
}
