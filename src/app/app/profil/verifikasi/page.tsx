'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Upload, Lock, CheckCircle2, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'

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
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      Memuat...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px) 80px' }}>

        <a href="/app/profil" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '13px' }}>← Kembali ke Profil</a>

        <AnimatePresence mode="wait">
          {/* ── STATE: SUDAH VERIFIED ── */}
          {(verified || done) ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginTop: '28px', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '40px 32px', textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
                style={{ display: 'inline-flex', marginBottom: '20px' }}
              >
                <CheckCircle2 size={56} color="#10B981" strokeWidth={1.5} />
              </motion.div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10B981', marginBottom: '10px', fontFamily: 'Outfit, sans-serif' }}>
                Identitas Kamu Sudah Terverifikasi!
              </h1>
              <p style={{ color: '#8892a4', fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>
                Badge <strong style={{ color: '#10B981' }}>Identitas Terverifikasi</strong> sudah tampil di profil kamu. Trust Score kamu sudah dapat +10 poin dari verifikasi ini.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '6px 16px' }}>
                <ShieldCheck size={14} color="#10B981" strokeWidth={1.5} />
                <span style={{ color: '#10B981', fontSize: '13px', fontWeight: '600' }}>Identitas Terverifikasi · +10 Trust Score</span>
              </div>
              <div style={{ marginTop: '24px' }}>
                <a href="/app/profil" style={{ display: 'inline-block', padding: '10px 24px', backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }}>
                  Lihat Profil →
                </a>
              </div>
            </motion.div>

          ) : (
            /* ── STATE: BELUM VERIFIED ── */
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ marginTop: '24px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <ShieldCheck size={28} color="#4F6EF7" strokeWidth={1.5} />
                  <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>Verifikasi Identitas</h1>
                </div>
                <p style={{ color: '#8892a4', fontSize: '14px', lineHeight: '1.7' }}>
                  Upload foto KTP kamu untuk mendapatkan badge <strong style={{ color: 'white' }}>Identitas Terverifikasi</strong> dan menambah +10 Trust Score.
                </p>
              </div>

              {/* Info card */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', backgroundColor: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.15)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px' }}>
                <Lock size={15} color="#4F6EF7" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '13px', color: '#8892a4', lineHeight: '1.6' }}>
                  Foto KTP kamu hanya digunakan untuk verifikasi dan <strong style={{ color: 'white' }}>tidak ditampilkan ke publik</strong> maupun klien.
                </p>
              </div>

              {/* Upload area */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f) }}
                style={{
                  border: `2px dashed ${dragOver ? '#4F6EF7' : preview ? 'rgba(16,185,129,0.5)' : 'rgba(79,110,247,0.4)'}`,
                  borderRadius: '12px', padding: '32px 24px', textAlign: 'center',
                  cursor: 'pointer', marginBottom: '20px',
                  backgroundColor: dragOver ? 'rgba(79,110,247,0.04)' : 'rgba(255,255,255,0.02)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {preview ? (
                  <div>
                    <img src={preview} alt="Preview KTP" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain', marginBottom: '12px' }} />
                    <p style={{ fontSize: '13px', color: '#10B981', fontWeight: '600' }}>✓ {file?.name}</p>
                    <p style={{ fontSize: '12px', color: '#8892a4', marginTop: '4px' }}>Klik untuk ganti foto</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} color="#4F6EF7" strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Klik atau drag foto KTP ke sini</p>
                    <p style={{ fontSize: '12px', color: '#8892a4' }}>PNG, JPG, JPEG · Maks 5MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }} />
              </div>

              {error && (
                <div style={{ backgroundColor: '#2d1515', border: '1px solid #EF4444', borderRadius: '8px', padding: '12px 16px', color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifikasi}
                disabled={!file || uploading}
                style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
                  fontSize: '15px', fontWeight: '700',
                  backgroundColor: file && !uploading ? '#4F6EF7' : '#1e2d4a',
                  color: file ? 'white' : '#8892a4',
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
