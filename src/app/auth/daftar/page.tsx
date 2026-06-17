'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, Laptop, Building2 } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

const STATUS_RED = '#EF4444'

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
        backgroundColor: C.bgWhite, padding: 'clamp(24px, 5vw, 40px)', borderRadius: R.lg,
        width: '100%', maxWidth: step === 'pilih-peran' ? '480px' : '420px',
        border: `1px solid ${C.border}`, boxShadow: theme.shadow.hover,
      }}>

        {step === 'pilih-peran' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: C.textDark, fontFamily: theme.fonts.headline, marginBottom: '6px' }}>
                Gawe
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: C.textDark, marginBottom: '6px' }}>Daftar ke Gawe</h1>
              <p style={{ color: C.textMuted, fontSize: '14px' }}>Kamu bergabung sebagai apa?</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => handlePilihPeran('freelancer')}
                style={{
                  padding: '20px 24px', borderRadius: R.md, border: `2px solid ${C.border}`,
                  backgroundColor: C.bgLavenderSoft, cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primaryBorder; e.currentTarget.style.backgroundColor = C.primaryTint }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.backgroundColor = C.bgLavenderSoft }}
              >
                <div style={{ marginBottom: '12px' }}><Laptop size={28} strokeWidth={1.5} color={C.primary} /></div>
                <div style={{ color: C.textDark, fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Saya Freelancer</div>
                <div style={{ color: C.textMuted, fontSize: '13px' }}>Cari proyek, bangun portofolio, dan kembangkan skill-mu</div>
              </button>

              <button
                onClick={() => handlePilihPeran('client')}
                style={{
                  padding: '20px 24px', borderRadius: R.md, border: `2px solid ${C.border}`,
                  backgroundColor: C.bgLavenderSoft, cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primaryBorder; e.currentTarget.style.backgroundColor = C.primaryTint }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.backgroundColor = C.bgLavenderSoft }}
              >
                <div style={{ marginBottom: '12px' }}><Building2 size={28} strokeWidth={1.5} color={C.primary} /></div>
                <div style={{ color: C.textDark, fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Saya Klien / Bisnis</div>
                <div style={{ color: C.textMuted, fontSize: '13px' }}>Post proyek dan temukan freelancer yang tepat untuk bisnismu</div>
              </button>
            </div>

            <p style={{ color: C.textMuted, textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
              Sudah punya akun?{' '}
              <Link href="/auth/masuk" style={{ color: C.primary, fontWeight: 600, textDecoration: 'none' }}>Masuk</Link>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep('pilih-peran')}
              style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '20px' }}
            >
              ← Ganti peran
            </button>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: C.primaryTint, border: `1px solid ${C.primaryBorder}`,
              borderRadius: '20px', padding: '4px 12px', marginBottom: '20px',
            }}>
              {selectedRole === 'client' ? <Building2 size={14} strokeWidth={1.5} color={C.primary} /> : <Laptop size={14} strokeWidth={1.5} color={C.primary} />}
              <span style={{ color: C.primary, fontSize: '13px', fontWeight: 700 }}>
                {selectedRole === 'client' ? 'Klien / Bisnis' : 'Freelancer'}
              </span>
            </div>

            <h1 style={{ color: C.textDark, marginBottom: '4px', fontSize: '20px', fontWeight: 700 }}>Buat akun</h1>
            <p style={{ color: C.textMuted, marginBottom: '24px', fontSize: '14px' }}>Mulai perjalananmu di Gawe</p>

            {error && (
              <div style={{ backgroundColor: STATUS_RED + '18', color: STATUS_RED, border: `1px solid ${STATUS_RED}33`, padding: '10px 14px', borderRadius: R.sm, marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: C.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nama lengkap</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <User size={16} strokeWidth={1.5} color={C.textTertiary} />
                </div>
                <input type="text" style={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Budi Santoso" />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: C.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Mail size={16} strokeWidth={1.5} color={C.textTertiary} />
                </div>
                <input type="email" style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="budi@email.com" />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: C.textMuted, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Lock size={16} strokeWidth={1.5} color={C.textTertiary} />
                </div>
                <input type="password" style={inp} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
              </div>
            </div>

            <button onClick={handleDaftar} disabled={loading} style={{
              width: '100%', padding: '12px', color: 'white', border: 'none',
              borderRadius: R.sm, fontSize: '15px', fontWeight: 700,
              backgroundColor: C.primary,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>

            <p style={{ color: C.textMuted, textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
              Sudah punya akun?{' '}
              <Link href="/auth/masuk" style={{ color: C.primary, fontWeight: 600, textDecoration: 'none' }}>Masuk</Link>
            </p>
          </>
        )}

      </div>
    </div>
  )
}
