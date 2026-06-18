'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Upload, Lock, CheckCircle2, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme
const STATUS_RED = '#EF4444'

export default function VerifikasiPage() {
  const router  = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [user,       setUser]       = useState<any>(null)
  const [verified,   setVerified]   = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [file,       setFile]       = useState<File | null>(null)
  const [preview,    setPreview]    = useState<string | null>(null)
  const [uploading,  setUploading]  = useState(false)
  const [done,       setDone]       = useState(false)
  const [dragOver,   setDragOver]   = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth/masuk'); return }
      setUser(u)
      const { data: p } = await supabase.from('profiles').select('ktp_status').eq('id', u.id).single()
      if (p?.ktp_status === 'verified') setVerified(true)
      setLoading(false)
    }
    load()
  }, [])

  function handleFileChange(f: File) {
    setFile(f)
    setError('')
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  async function handleVerifikasi() {
    if (!file || !user) return
    setUploading(true)
    setError('')

    const ext  = file.name.split('.').pop() || 'jpg'
    const path = `${user.id}/ktp.${ext}`

    console.log('[KYC] user.id:', user.id)
    console.log('[KYC] upload path:', path)
    console.log('[KYC] file name:', file.name, '| size:', file.size, '| type:', file.type)

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadErr) {
      console.error('[KYC] Upload error detail:', JSON.stringify(uploadErr, null, 2))
      console.error('[KYC] Error message:', uploadErr?.message)
      console.error('[KYC] Error statusCode:', (uploadErr as any)?.statusCode)
      console.error('[KYC] Error error:', (uploadErr as any)?.error)
      setError(`Gagal upload: ${uploadErr.message}`)
      setUploading(false)
      return
    }

    console.log('[KYC] upload sukses, mengambil URL...')
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    console.log('[KYC] publicUrl:', urlData.publicUrl)

    const { data: prof } = await supabase.from('profiles').select('trust_score').eq('id', user.id).single()
    const currentScore = prof?.trust_score || 10
    console.log('[KYC] current trust_score:', currentScore)

    const { error: updateErr } = await supabase.from('profiles').update({
      ktp_status:  'verified',
      ktp_url:     urlData.publicUrl,
      trust_score: currentScore + 10,
    }).eq('id', user.id)

    if (updateErr) {
      console.error('[KYC] Profile update error:', JSON.stringify(updateErr, null, 2))
      setError(`Gagal menyimpan verifikasi: ${updateErr.message}`)
      setUploading(false)
      return
    }

    console.log('[KYC] verifikasi berhasil!')
    setDone(true)
    setUploading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>
      Memuat...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <Navbar />
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px) 80px' }}>

        <a href="/app/profil" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '13px' }}>← Kembali ke Profil</a>

        <AnimatePresence mode="wait">
          {/* ── STATE: SUDAH VERIFIED ── */}
          {(verified || done) ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginTop: '28px', backgroundColor: C.successTint, border: `1px solid ${C.success}33`, borderRadius: R.md, padding: '40px 32px', textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
                style={{ display: 'inline-flex', marginBottom: '20px' }}
              >
                <CheckCircle2 size={56} color={C.success} strokeWidth={1.5} />
              </motion.div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: C.success, marginBottom: '10px', fontFamily: theme.fonts.headline }}>
                Identitas Kamu Sudah Terverifikasi!
              </h1>
              <p style={{ color: C.textMuted, fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>
                Badge <strong style={{ color: C.success }}>Identitas Terverifikasi</strong> sudah tampil di profil kamu. Trust Score kamu sudah dapat +10 poin dari verifikasi ini.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: C.successTint, border: `1px solid ${C.success}33`, borderRadius: R.pill, padding: '6px 16px' }}>
                <ShieldCheck size={14} color={C.success} strokeWidth={1.5} />
                <span style={{ color: C.success, fontSize: '13px', fontWeight: 600 }}>Identitas Terverifikasi · +10 Trust Score</span>
              </div>
              <div style={{ marginTop: '24px' }}>
                <a href="/app/profil" style={{ display: 'inline-block', padding: '10px 24px', backgroundColor: C.primary, color: 'white', textDecoration: 'none', borderRadius: R.sm, fontSize: '14px', fontWeight: 700 }}>
                  Lihat Profil →
                </a>
              </div>
            </motion.div>

          ) : (
            /* ── STATE: BELUM VERIFIED ── */
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ marginTop: '24px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <ShieldCheck size={28} color={C.primary} strokeWidth={1.5} />
                  <h1 style={{ fontSize: '22px', fontWeight: 800, fontFamily: theme.fonts.headline, color: C.textDark }}>Verifikasi Identitas</h1>
                </div>
                <p style={{ color: C.textMuted, fontSize: '14px', lineHeight: '1.7' }}>
                  Upload foto KTP kamu untuk mendapatkan badge <strong style={{ color: C.textDark }}>Identitas Terverifikasi</strong> dan menambah +10 Trust Score.
                </p>
              </div>

              {/* Info card */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', backgroundColor: C.primaryTint, border: `1px solid ${C.primaryBorder}`, borderRadius: R.sm, padding: '12px 16px', marginBottom: '24px' }}>
                <Lock size={15} color={C.primary} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '13px', color: C.textMuted, lineHeight: '1.6', margin: 0 }}>
                  Foto KTP kamu hanya digunakan untuk verifikasi dan <strong style={{ color: C.textDark }}>tidak ditampilkan ke publik</strong> maupun klien.
                </p>
              </div>

              {/* Upload area */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f) }}
                style={{
                  border: `2px dashed ${dragOver ? C.primary : preview ? C.success + '7A' : C.primaryBorder}`,
                  borderRadius: R.md, padding: '32px 24px', textAlign: 'center',
                  cursor: 'pointer', marginBottom: '20px',
                  backgroundColor: dragOver ? C.primaryTint : C.bgLavenderSoft,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {preview ? (
                  <div>
                    <img src={preview} alt="Preview KTP" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: R.sm, objectFit: 'contain', marginBottom: '12px' }} />
                    <p style={{ fontSize: '13px', color: C.success, fontWeight: 600 }}>✓ {file?.name}</p>
                    <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '4px' }}>Klik untuk ganti foto</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} color={C.primary} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: C.textDark }}>Klik atau drag foto KTP ke sini</p>
                    <p style={{ fontSize: '12px', color: C.textMuted }}>PNG, JPG, JPEG · Maks 5MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }} />
              </div>

              {error && (
                <div style={{ backgroundColor: STATUS_RED + '18', border: `1px solid ${STATUS_RED}33`, borderRadius: R.sm, padding: '12px 16px', color: STATUS_RED, fontSize: '13px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifikasi}
                disabled={!file || uploading}
                style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: R.sm,
                  fontSize: '15px', fontWeight: 700,
                  backgroundColor: file && !uploading ? C.primary : C.bgLavenderStrong,
                  color: file ? 'white' : C.textMuted,
                  cursor: file && !uploading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                    Memverifikasi...
                  </>
                ) : 'Verifikasi Sekarang'}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
