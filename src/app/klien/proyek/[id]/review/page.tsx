'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'
import { CheckCircle2, Inbox } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme
const STATUS_AMBER = '#F59E0B'
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

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>
      Memuat...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <NavbarKlien />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px) 80px' }}>

        <a href="/klien/proyek" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '13px' }}>← Kembali ke Proyekku</a>

        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '16px 0 4px', fontFamily: theme.fonts.headline, color: C.textDark }}>Review Hasil Kerja</h1>
        <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '28px' }}>Periksa hasil kerja freelancer dan berikan keputusan.</p>

        {/* Project info */}
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px 24px', marginBottom: '20px', boxShadow: theme.shadow.card }}>
          <span style={{ backgroundColor: C.primaryTint, color: C.primary, fontSize: '11px', padding: '2px 8px', borderRadius: R.pill }}>{project.category}</span>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '8px 0 6px', color: C.textDark }}>{project.title}</h2>
          <span style={{ color: C.primary, fontSize: '14px', fontFamily: theme.fonts.mono }}>{fmt(project.budget_min)} – {fmt(project.budget_max)}</span>
        </div>

        {project.status === 'completed' ? (
          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.success}33`, borderRadius: R.lg, padding: '36px', textAlign: 'center', boxShadow: theme.shadow.card }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <CheckCircle2 size={48} strokeWidth={1.5} color={C.success} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: C.success, marginBottom: '8px', fontFamily: theme.fonts.headline }}>Proyek Selesai!</h2>
            <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '24px' }}>Kamu sudah menyetujui hasil kerja freelancer. Proyek ini telah selesai.</p>
            <a href="/klien/proyek" style={{ display: 'inline-block', padding: '10px 24px', backgroundColor: C.primary, color: 'white', textDecoration: 'none', borderRadius: R.sm, fontSize: '14px', fontWeight: '700' }}>
              Kembali ke Proyekku
            </a>
          </div>
        ) : (
          <>
            {/* Submission note */}
            <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', marginBottom: '20px', boxShadow: theme.shadow.card }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: C.textDark, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Inbox size={16} strokeWidth={1.5} color={C.textMuted} /> Catatan dari Freelancer
              </h3>
              {project.submission_note ? (
                <div style={{ backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.sm, padding: '14px 16px', fontSize: '14px', color: C.textDark, lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                  {project.submission_note}
                </div>
              ) : (
                <p style={{ color: C.textMuted, fontSize: '13px' }}>Freelancer tidak menyertakan catatan.</p>
              )}
            </div>

            {/* Konfirmasi revisi terkirim */}
            {revisionSent && (
              <div style={{ backgroundColor: STATUS_AMBER + '18', border: `1px solid ${STATUS_AMBER}66`, borderRadius: R.md, padding: '20px 24px', marginBottom: '20px' }}>
                <div style={{ color: STATUS_AMBER, fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>
                  ✓ Permintaan revisi berhasil dikirim ke freelancer
                </div>
                <div style={{ backgroundColor: C.bgLavenderSoft, border: `1px solid ${STATUS_AMBER}33`, borderRadius: R.sm, padding: '12px 14px', fontSize: '13px', color: C.textDark, lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', color: STATUS_AMBER, display: 'block', marginBottom: '4px', fontWeight: '600' }}>Catatan yang dikirim:</span>
                  {sentNote}
                </div>
                <a href="/klien/proyek" style={{ display: 'inline-block', padding: '8px 18px', backgroundColor: C.primary, color: 'white', textDecoration: 'none', borderRadius: R.sm, fontSize: '13px', fontWeight: '700' }}>
                  ← Kembali ke Proyekku
                </a>
              </div>
            )}

            {/* Actions */}
            {!revisionSent && !showRevForm ? (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={handleSetujui} disabled={action !== 'idle'}
                  style={{ flex: 1, minWidth: '160px', padding: '14px', backgroundColor: action === 'approving' ? C.success + 'CC' : C.success, color: 'white', border: 'none', borderRadius: R.sm, fontSize: '15px', fontWeight: '700', cursor: action !== 'idle' ? 'not-allowed' : 'pointer', opacity: action !== 'idle' ? 0.7 : 1 }}>
                  {action === 'approving' ? 'Menyetujui...' : '✓ Setujui & Selesaikan'}
                </button>
                <button onClick={() => setShowRevForm(true)} disabled={action !== 'idle'}
                  style={{ flex: 1, minWidth: '160px', padding: '14px', backgroundColor: 'transparent', color: STATUS_AMBER, border: `1px solid ${STATUS_AMBER}`, borderRadius: R.sm, fontSize: '15px', fontWeight: '700', cursor: action !== 'idle' ? 'not-allowed' : 'pointer', opacity: action !== 'idle' ? 0.7 : 1 }}>
                  ↩ Minta Revisi
                </button>
              </div>
            ) : !revisionSent && (
              <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${STATUS_AMBER}66`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: STATUS_AMBER }}>↩ Alasan revisi untuk freelancer</h3>
                <p style={{ color: C.textMuted, fontSize: '13px', marginBottom: '14px' }}>Jelaskan apa yang perlu diperbaiki agar freelancer bisa segera mengerjakan ulang.</p>
                <textarea
                  value={revNote}
                  onChange={e => setRevNote(e.target.value)}
                  placeholder="cth: Warna background perlu diganti ke biru, font headline terlalu kecil..."
                  style={{ width: '100%', padding: '12px 14px', backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textDark, fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleRevisi} disabled={action !== 'idle' || !revNote.trim()}
                    style={{ padding: '10px 20px', backgroundColor: revNote.trim() && action === 'idle' ? STATUS_AMBER : C.bgLavenderStrong, color: revNote.trim() ? C.textDark : C.textMuted, border: 'none', borderRadius: R.sm, fontSize: '13px', fontWeight: '700', cursor: revNote.trim() && action === 'idle' ? 'pointer' : 'not-allowed' }}>
                    {action === 'revising' ? 'Mengirim...' : 'Kirim Revisi'}
                  </button>
                  <button onClick={() => setShowRevForm(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: R.sm, fontSize: '13px', cursor: 'pointer' }}>
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
