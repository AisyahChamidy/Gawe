'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function ReviewPage() {
  const params = useParams()
  const projectId = params.id as string
  const router = useRouter()
  const supabase = createClient()

  const [project,  setProject]  = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const [action,   setAction]   = useState<'idle' | 'approving' | 'revising'>('idle')
  const [revNote,  setRevNote]  = useState('')
  const [showRevForm, setShowRevForm] = useState(false)
  const [revisionSent, setRevisionSent] = useState(false)
  const [sentNote, setSentNote] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }

      const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).eq('client_id', user.id).single()
      if (!proj) { router.push('/klien/proyek'); return }
      setProject(proj)
      setLoading(false)
    }
    load()
  }, [projectId])

  async function handleSetujui() {
    setAction('approving')
    await supabase.from('projects').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', projectId)
    setProject((p: any) => ({ ...p, status: 'completed' }))
    setAction('idle')
  }

  async function handleRevisi() {
    if (!revNote.trim()) return
    setAction('revising')
    await supabase.from('projects').update({
      status: 'revision',
      revision_note: revNote.trim(),
    }).eq('id', projectId)
    const note = revNote.trim()
    setProject((p: any) => ({ ...p, status: 'revision', revision_note: note }))
    setSentNote(note)
    setRevisionSent(true)
    setShowRevForm(false)
    setRevNote('')
    setAction('idle')
  }

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <NavbarKlien />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px) 80px' }}>

        <a href="/klien/proyek" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '13px' }}>← Kembali ke Proyekku</a>

        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '16px 0 4px', fontFamily: 'Outfit, sans-serif' }}>Review Hasil Kerja</h1>
        <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '28px' }}>Periksa hasil kerja freelancer dan berikan keputusan.</p>

        {/* Project info */}
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <span style={{ backgroundColor: '#1a2340', color: '#4F6EF7', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>{project.category}</span>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '8px 0 6px' }}>{project.title}</h2>
          <span style={{ color: '#22D3EE', fontSize: '14px' }}>{fmt(project.budget_min)} – {fmt(project.budget_max)}</span>
        </div>

        {project.status === 'completed' ? (
          <div style={{ backgroundColor: '#131929', border: '1px solid #10B981', borderRadius: '16px', padding: '36px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#10B981', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>Proyek Selesai!</h2>
            <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '24px' }}>Kamu sudah menyetujui hasil kerja freelancer. Proyek ini telah selesai.</p>
            <a href="/klien/proyek" style={{ display: 'inline-block', padding: '10px 24px', backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }}>
              Kembali ke Proyekku
            </a>
          </div>
        ) : (
          <>
            {/* Submission note */}
            <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>📬 Catatan dari Freelancer</h3>
              {project.submission_note ? (
                <div style={{ backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', padding: '14px 16px', fontSize: '14px', color: '#c4cdd6', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                  {project.submission_note}
                </div>
              ) : (
                <p style={{ color: '#8892a4', fontSize: '13px' }}>Freelancer tidak menyertakan catatan.</p>
              )}
            </div>

            {/* Konfirmasi revisi terkirim */}
            {revisionSent && (
              <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
                <div style={{ color: '#f59e0b', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>
                  ✓ Permintaan revisi berhasil dikirim ke freelancer
                </div>
                <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#c4cdd6', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', color: '#f59e0b', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Catatan yang dikirim:</span>
                  {sentNote}
                </div>
                <a href="/klien/proyek" style={{ display: 'inline-block', padding: '8px 18px', backgroundColor: '#4F6EF7', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                  ← Kembali ke Proyekku
                </a>
              </div>
            )}

            {/* Actions */}
            {!revisionSent && !showRevForm ? (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={handleSetujui} disabled={action !== 'idle'}
                  style={{ flex: 1, minWidth: '160px', padding: '14px', backgroundColor: action === 'approving' ? '#0d7a57' : '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: action !== 'idle' ? 'not-allowed' : 'pointer', opacity: action !== 'idle' ? 0.7 : 1 }}>
                  {action === 'approving' ? 'Menyetujui...' : '✓ Setujui & Selesaikan'}
                </button>
                <button onClick={() => setShowRevForm(true)} disabled={action !== 'idle'}
                  style={{ flex: 1, minWidth: '160px', padding: '14px', backgroundColor: 'transparent', color: '#FBBF24', border: '1px solid #FBBF24', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: action !== 'idle' ? 'not-allowed' : 'pointer', opacity: action !== 'idle' ? 0.7 : 1 }}>
                  ↩ Minta Revisi
                </button>
              </div>
            ) : !revisionSent && (
              <div style={{ backgroundColor: '#131929', border: '1px solid #f59e0b', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: '#f59e0b' }}>↩ Alasan revisi untuk freelancer</h3>
                <p style={{ color: '#8892a4', fontSize: '13px', marginBottom: '14px' }}>Jelaskan apa yang perlu diperbaiki agar freelancer bisa segera mengerjakan ulang.</p>
                <textarea
                  value={revNote}
                  onChange={e => setRevNote(e.target.value)}
                  placeholder="cth: Warna background perlu diganti ke biru, font headline terlalu kecil..."
                  style={{ width: '100%', padding: '12px 14px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleRevisi} disabled={action !== 'idle' || !revNote.trim()}
                    style={{ padding: '10px 20px', backgroundColor: revNote.trim() && action === 'idle' ? '#f59e0b' : '#1e2d4a', color: revNote.trim() ? '#0A0E1A' : '#8892a4', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: revNote.trim() && action === 'idle' ? 'pointer' : 'not-allowed' }}>
                    {action === 'revising' ? 'Mengirim...' : 'Kirim Revisi'}
                  </button>
                  <button onClick={() => setShowRevForm(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#8892a4', border: '1px solid #1e2d4a', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    Batal
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
