'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'
import { PartyPopper, Banknote, Smartphone, Wallet, QrCode } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme
const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const METODE = [
  { id: 'transfer', label: 'Transfer Bank', desc: 'BCA, Mandiri, BNI, BRI' },
  { id: 'gopay',    label: 'GoPay',         desc: 'Bayar via GoPay' },
  { id: 'ovo',      label: 'OVO',           desc: 'Bayar via OVO' },
  { id: 'qris',     label: 'QRIS',          desc: 'Scan kode QR manapun' },
]

const MetodeIcon = ({ id, color }: { id: string; color: string }) => {
  const props = { size: 22, strokeWidth: 1.5, color }
  if (id === 'transfer') return <Banknote {...props} />
  if (id === 'gopay')    return <Smartphone {...props} />
  if (id === 'ovo')      return <Wallet {...props} />
  return <QrCode {...props} />
}

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

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>
      Memuat...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <NavbarKlien />
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px) 80px' }}>

        <a href="/klien/proyek" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '13px' }}>← Kembali</a>

        {done ? (
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <PartyPopper size={56} strokeWidth={1.5} color={C.success} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: C.success, marginBottom: '8px', fontFamily: theme.fonts.headline }}>Pembayaran Berhasil!</h1>
            <p style={{ color: C.textMuted, fontSize: '14px' }}>Proyek sudah didanai. Freelancer bisa mulai bekerja. Mengalihkan...</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '16px 0 4px', fontFamily: theme.fonts.headline, color: C.textDark }}>Danai Proyek</h1>
            <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '28px' }}>Dana akan disimpan di escrow Gawe hingga proyek selesai.</p>

            {/* Summary */}
            <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px 24px', marginBottom: '20px', boxShadow: theme.shadow.card }}>
              <h2 style={{ fontSize: '11px', fontWeight: '700', marginBottom: '16px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ringkasan</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.textMuted }}>Proyek</span>
                  <span style={{ fontWeight: '600', maxWidth: '220px', textAlign: 'right', color: C.textDark }}>{project.title}</span>
                </div>
                {freelancer && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: C.textMuted }}>Freelancer</span>
                    <span style={{ fontWeight: '600', color: C.textDark }}>{freelancer}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.textMuted }}>Budget</span>
                  <span style={{ color: C.primary, fontWeight: '600', fontFamily: theme.fonts.mono }}>{fmt(project.budget_min)} – {fmt(project.budget_max)}</span>
                </div>
                <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                  <span style={{ fontWeight: '700', color: C.textDark }}>Total Bayar</span>
                  <span style={{ fontWeight: '800', color: C.primary, fontFamily: theme.fonts.mono }}>{fmt(project.budget_max)}</span>
                </div>
              </div>
            </div>

            {/* Pilih metode */}
            <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px 24px', marginBottom: '20px', boxShadow: theme.shadow.card }}>
              <h2 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '14px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Metode Pembayaran</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {METODE.map(m => (
                  <button key={m.id} onClick={() => setMetode(m.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: R.sm, border: `1px solid ${metode === m.id ? C.primary : C.border}`, backgroundColor: metode === m.id ? C.primaryTint : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                    <MetodeIcon id={m.id} color={metode === m.id ? C.primary : C.textMuted} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: C.textDark }}>{m.label}</div>
                      <div style={{ fontSize: '12px', color: C.textMuted }}>{m.desc}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', border: `2px solid ${metode === m.id ? C.primary : C.border}`, backgroundColor: metode === m.id ? C.primary : 'transparent', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleBayar} disabled={paying}
              style={{ width: '100%', padding: '15px', backgroundColor: paying ? C.bgLavenderStrong : C.primary, color: paying ? C.textMuted : 'white', border: 'none', borderRadius: R.sm, fontSize: '16px', fontWeight: '800', cursor: paying ? 'not-allowed' : 'pointer', marginBottom: '12px' }}>
              {paying ? 'Memproses...' : `Bayar Sekarang ${fmt(project.budget_max)}`}
            </button>

            <p style={{ textAlign: 'center', fontSize: '11px', color: C.textMuted, lineHeight: '1.6' }}>
              * Ini adalah simulasi pembayaran untuk demo. Integrasi Midtrans akan ditambahkan di versi production.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
