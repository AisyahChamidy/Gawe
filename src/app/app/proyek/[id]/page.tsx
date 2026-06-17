'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Send, MessageCircle, Clock, Search, Banknote, Upload, Inbox, CheckCircle, PartyPopper } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

const STATUS_AMBER = '#F59E0B'

type Message = { id: string; content: string; sender_id: string; created_at: string; sender_name?: string }
type Project = {
  id: string; title: string; category: string; budget_min: number; budget_max: number
  status: string; client_id: string; selected_freelancer_id: string | null
  submission_note: string | null; revision_note: string | null
  estimated_days: number; description: string; skills_required: string[]
}

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const STATUS_STEPS = [
  { key: 'open',        label: 'Terbuka' },
  { key: 'in_review',   label: 'Seleksi' },
  { key: 'funded',      label: 'Didanai' },
  { key: 'in_progress', label: 'Dikerjakan' },
  { key: 'submitted',   label: 'Dikirim' },
  { key: 'completed',   label: 'Selesai' },
]
const STEP_MAP: Record<string, number> = {
  open: 0, in_review: 1, funded: 2,
  in_progress: 3, submitted: 4, revision: 3,
  completed: 5, cancelled: 0,
}
const stepIndex = (s: string) => STEP_MAP[s] ?? 0

export default function WorkspacePage() {
  const params  = useParams()
  const projectId = params.id as string
  const router  = useRouter()
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [project,  setProject]  = useState<Project | null>(null)
  const [user,     setUser]     = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading,  setLoading]  = useState(true)
  const [note,     setNote]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth/masuk'); return }
      setUser(u)

      const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single()
      setProject(proj)
      await loadMessages(u)
      setLoading(false)

      const ch = supabase.channel('ws-msg-' + projectId)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'project_id=eq.' + projectId },
          () => loadMessages(u))
        .subscribe()
      return () => { supabase.removeChannel(ch) }
    }
    load()
  }, [projectId])

  async function loadMessages(u?: any) {
    const { data } = await supabase.from('messages').select('id, content, sender_id, created_at')
      .eq('project_id', projectId).order('created_at', { ascending: true })
    if (!data) return
    const ids = [...new Set(data.map(m => m.sender_id))]
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids)
    const nameMap: Record<string, string> = {}
    ;(profiles || []).forEach((p: any) => { nameMap[p.id] = p.full_name || 'Pengguna' })
    setMessages(data.map(m => ({ ...m, sender_name: nameMap[m.sender_id] || 'Pengguna' })))
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function handleSubmitHasil() {
    if (!note.trim()) return
    setSubmitting(true)
    await supabase.from('projects').update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submission_note: note,
    }).eq('id', projectId)
    setProject(p => p ? { ...p, status: 'submitted', submission_note: note } : p)
    setSubmitted(true)
    setSubmitting(false)
  }

  async function handleSend() {
    if (!input.trim() || sending) return
    setSending(true)
    await supabase.from('messages').insert({ project_id: projectId, sender_id: user.id, content: input.trim() })
    setInput('')
    setSending(false)
    loadMessages(user)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>
      Memuat...
    </div>
  )
  if (!project) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>
      Proyek tidak ditemukan.
    </div>
  )

  const curStep = stepIndex(project.status)

  const textarea: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`,
    borderRadius: R.sm, color: C.textDark, fontSize: '13px',
    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(20px,4vw,32px) clamp(16px,4vw,32px) 60px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Back link */}
        <div>
          <a href="/app/lamaran" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '13px' }}>← Lamaranku</a>
        </div>

        {/* Project card */}
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
          <span style={{ backgroundColor: C.primaryTint, color: C.primary, fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>{project.category}</span>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '10px 0 6px', fontFamily: theme.fonts.headline, color: C.textDark }}>{project.title}</h1>
          <span style={{ color: C.primary, fontSize: '15px', fontWeight: 600, fontFamily: theme.fonts.mono }}>{fmt(project.budget_min)} – {fmt(project.budget_max)}</span>
          {project.description && <p style={{ color: C.textMuted, fontSize: '13px', lineHeight: '1.6', marginTop: '10px' }}>{project.description}</p>}
        </div>

        {/* Progress steps */}
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px 24px', boxShadow: theme.shadow.card }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Proyek</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: '4px' }}>
            {STATUS_STEPS.map((step, i) => {
              const done    = i < curStep
              const current = i === curStep
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, flexShrink: 0,
                      backgroundColor: done ? C.success : current ? C.primary : C.bgLavenderStrong,
                      color: done || current ? 'white' : C.textMuted,
                      border: current ? `2px solid ${C.primary}` : 'none',
                      boxShadow: current ? `0 0 0 3px ${C.primary}22` : 'none',
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '10px', color: done ? C.success : current ? C.primary : C.textMuted, fontWeight: current ? 700 : 500, whiteSpace: 'nowrap' }}>
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: '2px', backgroundColor: done ? C.success : C.bgLavenderStrong, marginBottom: '20px', minWidth: '20px' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Status action: open */}
        {project.status === 'open' && (
          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${STATUS_AMBER}33`, borderRadius: R.md, padding: '20px 24px', boxShadow: theme.shadow.card }}>
            <div style={{ fontSize: '14px', color: STATUS_AMBER, fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} strokeWidth={1.5} />
              Menunggu Konfirmasi
            </div>
            <p style={{ color: C.textMuted, fontSize: '13px', margin: 0 }}>Lamaranmu sedang dipertimbangkan klien. Notifikasi akan muncul saat kamu dipilih.</p>
          </div>
        )}

        {/* Status action: in_review */}
        {project.status === 'in_review' && (
          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.primaryBorder}`, borderRadius: R.md, padding: '20px 24px', boxShadow: theme.shadow.card }}>
            <div style={{ fontSize: '14px', color: C.primary, fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={14} strokeWidth={1.5} />
              Kamu Dipilih!
            </div>
            <p style={{ color: C.textMuted, fontSize: '13px', margin: 0 }}>Lamaranmu diterima. Menunggu klien mendanai proyek sebelum kamu bisa mulai bekerja.</p>
          </div>
        )}

        {/* Status action: funded */}
        {project.status === 'funded' && (
          <div style={{ backgroundColor: C.successTint, border: `1px solid ${C.success}33`, borderRadius: R.md, padding: '20px 24px' }}>
            <div style={{ fontSize: '14px', color: C.success, fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Banknote size={14} strokeWidth={1.5} />
              Proyek Didanai!
            </div>
            <p style={{ color: C.textMuted, fontSize: '13px', margin: 0 }}>Dana klien sudah tersimpan di escrow Gawe. Kamu bisa mulai mengerjakan proyek ini.</p>
          </div>
        )}

        {/* Status action: in_progress — submit form */}
        {project.status === 'in_progress' && !submitted && (
          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: C.textDark, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={16} strokeWidth={1.5} color={C.primary} />
              Submit Hasil Kerja
            </h2>
            <p style={{ color: C.textMuted, fontSize: '13px', marginBottom: '16px' }}>Jelaskan apa yang sudah kamu kerjakan dan kirimkan ke klien untuk direview.</p>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Ceritakan hasil kerja kamu: apa yang sudah dibuat, link file, dll."
              style={{ ...textarea, minHeight: '100px', marginBottom: '12px' }} />
            <button onClick={handleSubmitHasil} disabled={submitting || !note.trim()} style={{
              padding: '11px 24px',
              backgroundColor: note.trim() && !submitting ? C.primary : C.bgLavenderStrong,
              color: note.trim() && !submitting ? 'white' : C.textMuted,
              border: 'none', borderRadius: R.sm, fontSize: '14px', fontWeight: 700,
              cursor: note.trim() && !submitting ? 'pointer' : 'not-allowed',
            }}>
              {submitting ? 'Mengirim...' : 'Submit Hasil →'}
            </button>
          </div>
        )}

        {/* Status action: submitted */}
        {(project.status === 'submitted' || submitted) && (
          <div style={{ backgroundColor: C.primaryTint, border: `1px solid ${C.primaryBorder}`, borderRadius: R.md, padding: '20px 24px' }}>
            <div style={{ fontSize: '14px', color: C.primary, fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Inbox size={14} strokeWidth={1.5} />
              Hasil Dikirim — Menunggu Review Klien
            </div>
            <p style={{ color: C.textMuted, fontSize: '13px', margin: 0 }}>Klien akan mereview pekerjaanmu. Kamu akan mendapat notifikasi hasilnya.</p>
            {project.submission_note && (
              <div style={{ marginTop: '12px', backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.sm, padding: '12px 14px', fontSize: '13px', color: C.textDark, lineHeight: '1.6' }}>
                <span style={{ fontSize: '11px', color: C.textMuted, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Catatan yang kamu kirim:</span>
                {project.submission_note}
              </div>
            )}
          </div>
        )}

        {/* Status action: revision */}
        {project.status === 'revision' && (
          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${STATUS_AMBER}33`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
            <div style={{ fontSize: '14px', color: STATUS_AMBER, fontWeight: 700, marginBottom: '8px' }}>↩ Revisi Diminta</div>
            {project.revision_note && (
              <div style={{ backgroundColor: STATUS_AMBER + '12', border: `1px solid ${STATUS_AMBER}33`, borderRadius: R.sm, padding: '12px 16px', marginBottom: '16px' }}>
                <div style={{ color: STATUS_AMBER, fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Catatan revisi dari klien:</div>
                <div style={{ color: C.textDark, fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{project.revision_note}</div>
              </div>
            )}
            <p style={{ color: C.textMuted, fontSize: '13px', marginBottom: '16px' }}>Perbaiki dan submit ulang hasilmu.</p>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Jelaskan revisi yang sudah dilakukan..."
              style={{ ...textarea, minHeight: '80px', marginBottom: '12px' }} />
            <button onClick={handleSubmitHasil} disabled={submitting || !note.trim()} style={{
              padding: '11px 24px',
              backgroundColor: note.trim() && !submitting ? C.primary : C.bgLavenderStrong,
              color: note.trim() && !submitting ? 'white' : C.textMuted,
              border: 'none', borderRadius: R.sm, fontSize: '14px', fontWeight: 700,
              cursor: note.trim() && !submitting ? 'pointer' : 'not-allowed',
            }}>
              {submitting ? 'Mengirim...' : 'Submit Revisi →'}
            </button>
          </div>
        )}

        {/* Status action: completed */}
        {project.status === 'completed' && (
          <div style={{ backgroundColor: C.successTint, border: `1px solid ${C.success}33`, borderRadius: R.lg, padding: '32px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><PartyPopper size={48} strokeWidth={1.5} color={C.success} /></div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: C.success, marginBottom: '8px', fontFamily: theme.fonts.headline }}>Proyek Selesai!</h2>
            <p style={{ color: C.textMuted, fontSize: '14px', margin: 0 }}>Klien sudah menyetujui hasil kerjamu. Pembayaran segera diproses. Kerja bagus!</p>
          </div>
        )}

        {/* Chat */}
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '360px', boxShadow: theme.shadow.card }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontSize: '14px', fontWeight: 700, color: C.textDark, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={16} strokeWidth={1.5} color={C.primary} />
            Chat dengan Klien
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', backgroundColor: C.bgLavenderSoft }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.textMuted, padding: '40px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', opacity: 0.3 }}>
                  <MessageCircle size={32} strokeWidth={1} color={C.textDark} />
                </div>
                <p style={{ fontSize: '13px', margin: 0 }}>Belum ada pesan. Mulai diskusi!</p>
              </div>
            ) : messages.map(m => {
              const isMe = m.sender_id === user?.id
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: isMe ? C.primary : C.bgLavenderStrong, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, color: isMe ? 'white' : C.textMuted }}>
                    {(m.sender_name || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ maxWidth: '65%' }}>
                    {!isMe && <div style={{ fontSize: '10px', color: C.textMuted, marginBottom: '3px', marginLeft: '4px' }}>{m.sender_name}</div>}
                    <div style={{ backgroundColor: isMe ? C.primary : C.bgWhite, border: isMe ? 'none' : `1px solid ${C.border}`, borderRadius: isMe ? '14px 14px 3px 14px' : '14px 14px 14px 3px', padding: '9px 13px', fontSize: '13px', lineHeight: '1.5', color: isMe ? 'white' : C.textDark }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: '10px', color: C.textTertiary, marginTop: '3px', textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : '4px' }}>
                      {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '8px', backgroundColor: C.bgWhite }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Tulis pesan..."
              style={{ flex: 1, padding: '9px 13px', backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textDark, fontSize: '13px', outline: 'none' }} />
            <button onClick={handleSend} disabled={sending || !input.trim()} style={{
              padding: '9px 14px', backgroundColor: input.trim() ? C.primary : C.bgLavenderStrong,
              color: input.trim() ? 'white' : C.textMuted,
              border: 'none', borderRadius: R.sm, cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {sending ? '...' : <Send size={16} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
