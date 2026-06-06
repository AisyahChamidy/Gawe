'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const METODE = [
  { id: 'transfer', label: 'Transfer Bank', icon: '🏦', desc: 'BCA, Mandiri, BNI, BRI' },
  { id: 'gopay',    label: 'GoPay',         icon: '💚', desc: 'Bayar via GoPay' },
  { id: 'ovo',      label: 'OVO',           icon: '💜', desc: 'Bayar via OVO' },
  { id: 'qris',     label: 'QRIS',          icon: '📱', desc: 'Scan kode QR manapun' },
]

export default function BayarPage() {
  const params = useParams()
  const projectId = params.id as string
  const router = useRouter()
  const supabase = createClient()

  const [project,    setProject]    = useState<any>(null)
  const [freelancer, setFreelancer] = useState('')
  const [loading,    setLoading]    = useState(true)
  const [metode,     setMetode]     = useState('transfer')
  const [paying,     setPaying]     = useState(false)
  const [done,       setDone]       = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }

      const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).eq('client_id', user.id).single()
      if (!proj) { router.push('/klien/proyek'); return }
      setProject(proj)

      if (proj.selected_freelancer_id) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', proj.selected_freelancer_id).single()
        setFreelancer(profile?.full_name || 'Freelancer')
      }
      setLoading(false)
    }
    load()
  }, [projectId])

  async function handleBayar() {
    setPaying(true)
    await new Promise(r => setTimeout(r, 2000))
    await supabase.from('projects').update({
      status: 'in_progress',
      funded_at: new Date().toISOString(),
    }).eq('id', projectId)
    setDone(true)
    setPaying(false)
    setTimeout(() => router.push('/klien/proyek'), 2000)
  }

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <NavbarKlien />
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px) 80px' }}>

        <a href="/klien/proyek" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '13px' }}>← Kembali</a>

        {done ? (
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#10B981', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>Pembayaran Berhasil!</h1>
            <p style={{ color: '#8892a4', fontSize: '14px' }}>Proyek sudah didanai. Freelancer bisa mulai bekerja. Mengalihkan...</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '16px 0 4px', fontFamily: 'Outfit, sans-serif' }}>Danai Proyek</h1>
            <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '28px' }}>Dana akan disimpan di escrow Gawe hingga proyek selesai.</p>

            {/* Summary */}
            <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: '700', marginBottom: '16px', color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ringkasan</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8892a4' }}>Proyek</span>
                  <span style={{ fontWeight: '600', maxWidth: '220px', textAlign: 'right' }}>{project.title}</span>
                </div>
                {freelancer && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8892a4' }}>Freelancer</span>
                    <span style={{ fontWeight: '600' }}>{freelancer}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8892a4' }}>Budget</span>
                  <span style={{ color: '#22D3EE', fontWeight: '600' }}>{fmt(project.budget_min)} – {fmt(project.budget_max)}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #1e2d4a', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                  <span style={{ fontWeight: '700' }}>Total Bayar</span>
                  <span style={{ fontWeight: '800', color: '#22D3EE' }}>{fmt(project.budget_max)}</span>
                </div>
              </div>
            </div>

            {/* Pilih metode */}
            <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '14px', color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Metode Pembayaran</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {METODE.map(m => (
                  <button key={m.id} onClick={() => setMetode(m.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${metode === m.id ? '#4F6EF7' : '#1e2d4a'}`, backgroundColor: metode === m.id ? 'rgba(79,110,247,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '22px' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>{m.label}</div>
                      <div style={{ fontSize: '12px', color: '#8892a4' }}>{m.desc}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', border: `2px solid ${metode === m.id ? '#4F6EF7' : '#1e2d4a'}`, backgroundColor: metode === m.id ? '#4F6EF7' : 'transparent', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleBayar} disabled={paying}
              style={{ width: '100%', padding: '15px', backgroundColor: paying ? '#2a3a6a' : '#4F6EF7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '800', cursor: paying ? 'not-allowed' : 'pointer', marginBottom: '12px' }}>
              {paying ? '⏳ Memproses...' : `Bayar Sekarang ${fmt(project.budget_max)}`}
            </button>

            <p style={{ textAlign: 'center', fontSize: '11px', color: '#8892a4', lineHeight: '1.6' }}>
              * Ini adalah simulasi pembayaran untuk demo. Integrasi Midtrans akan ditambahkan di versi production.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
