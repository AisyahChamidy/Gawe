'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

type Message = { id: string; content: string; sender_id: string; created_at: string; sender_name?: string }
type Project = {
  id: string; title: string; category: string; budget_min: number; budget_max: number
  status: string; client_id: string; selected_freelancer_id: string | null
  submission_note: string | null; estimated_days: number
  description: string; skills_required: string[]
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
const stepIndex = (s: string) => STATUS_STEPS.findIndex(x => x.key === s)

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

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>
  if (!project) return <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Proyek tidak ditemukan.</div>

  const curStep = stepIndex(project.status)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(20px,4vw,32px) clamp(16px,4vw,32px) 60px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <a href="/app/lamaran" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '13px' }}>← Lamaranku</a>
        </div>

        {/* Project card */}
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
          <span style={{ backgroundColor: '#1a2340', color: '#4F6EF7', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>{project.category}</span>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '10px 0 6px', fontFamily: 'Outfit, sans-serif' }}>{project.title}</h1>
          <span style={{ color: '#22D3EE', fontSize: '15px', fontWeight: '600' }}>{fmt(project.budget_min)} – {fmt(project.budget_max)}</span>
          {project.description && <p style={{ color: '#8892a4', fontSize: '13px', lineHeight: '1.6', marginTop: '10px' }}>{project.description}</p>}
        </div>

        {/* Progress bar status */}
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px 24px' }}>
          <div style={{ fontSize: '12px', color: '#8892a4', marginBottom: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Proyek</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: '4px' }}>
            {STATUS_STEPS.map((step, i) => {
              const done    = i < curStep
              const current = i === curStep
              const future  = i > curStep
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: '700', flexShrink: 0,
                      backgroundColor: done ? '#10B981' : current ? '#4F6EF7' : '#1e2d4a',
                      color: done || current ? 'white' : '#8892a4',
                      border: current ? '2px solid #4F6EF7' : 'none',
                      boxShadow: current ? '0 0 0 3px rgba(79,110,247,0.2)' : 'none',
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '10px', color: done ? '#10B981' : current ? '#4F6EF7' : '#8892a4', fontWeight: current ? '700' : '500', whiteSpace: 'nowrap' }}>
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: '2px', backgroundColor: done ? '#10B981' : '#1e2d4a', marginBottom: '20px', minWidth: '20px' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Status-based action section */}
        {project.status === 'open' && (
          <div style={{ backgroundColor: '#131929', border: '1px solid #FBBF24', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ fontSize: '14px', color: '#FBBF24', fontWeight: '700', marginBottom: '4px' }}>⏳ Menunggu Konfirmasi</div>
            <p style={{ color: '#8892a4', fontSize: '13px' }}>Lamaranmu sedang dipertimbangkan klien. Notifikasi akan muncul saat kamu dipilih.</p>
          </div>
        )}
        {project.status === 'in_review' && (
          <div style={{ backgroundColor: '#131929', border: '1px solid #4F6EF7', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ fontSize: '14px', color: '#4F6EF7', fontWeight: '700', marginBottom: '4px' }}>🔍 Kamu Dipilih!</div>
            <p style={{ color: '#8892a4', fontSize: '13px' }}>Lamaranmu diterima. Menunggu klien mendanai proyek sebelum kamu bisa mulai bekerja.</p>
          </div>
        )}
        {project.status === 'funded' && (
          <div style={{ backgroundColor: '#131929', border: '1px solid #10B981', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ fontSize: '14px', color: '#10B981', fontWeight: '700', marginBottom: '4px' }}>💰 Proyek Didanai!</div>
            <p style={{ color: '#8892a4', fontSize: '13px' }}>Dana klien sudah tersimpan di escrow Gawe. Kamu bisa mulai mengerjakan proyek ini.</p>
          </div>
        )}
        {project.status === 'in_progress' && !submitted && (
          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>🚀 Submit Hasil Kerja</h2>
            <p style={{ color: '#8892a4', fontSize: '13px', marginBottom: '16px' }}>Jelaskan apa yang sudah kamu kerjakan dan kirimkan ke klien untuk direview.</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ceritakan hasil kerja kamu: apa yang sudah dibuat, link file, dll."
              style={{ width: '100%', padding: '12px 14px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '100px', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            <button onClick={handleSubmitHasil} disabled={submitting || !note.trim()}
              style={{ padding: '11px 24px', backgroundColor: note.trim() && !submitting ? '#4F6EF7' : '#1e2d4a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: note.trim() && !submitting ? 'pointer' : 'not-allowed' }}>
              {submitting ? 'Mengirim...' : 'Submit Hasil →'}
            </button>
          </div>
        )}
        {(project.status === 'submitted' || submitted) && (
          <div style={{ backgroundColor: '#131929', border: '1px solid rgba(79,110,247,0.4)', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ fontSize: '14px', color: '#4F6EF7', fontWeight: '700', marginBottom: '4px' }}>📬 Hasil Dikirim — Menunggu Review Klien</div>
            <p style={{ color: '#8892a4', fontSize: '13px' }}>Klien akan mereview pekerjaanmu. Kamu akan mendapat notifikasi hasilnya.</p>
            {project.submission_note && (
              <div style={{ marginTop: '12px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#c4cdd6', lineHeight: '1.6' }}>
                <span style={{ fontSize: '11px', color: '#8892a4', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Catatan yang kamu kirim:</span>
                {project.submission_note}
              </div>
            )}
          </div>
        )}
        {project.status === 'revision' && (
          <div style={{ backgroundColor: '#131929', border: '1px solid #FBBF24', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '14px', color: '#FBBF24', fontWeight: '700', marginBottom: '8px' }}>↩ Revisi Diminta</div>
            <p style={{ color: '#8892a4', fontSize: '13px', marginBottom: '16px' }}>Klien meminta revisi. Perbaiki dan submit ulang hasilmu.</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Jelaskan revisi yang sudah dilakukan..."
              style={{ width: '100%', padding: '12px 14px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            <button onClick={handleSubmitHasil} disabled={submitting || !note.trim()}
              style={{ padding: '11px 24px', backgroundColor: note.trim() && !submitting ? '#4F6EF7' : '#1e2d4a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: note.trim() && !submitting ? 'pointer' : 'not-allowed' }}>
              {submitting ? 'Mengirim...' : 'Submit Revisi →'}
            </button>
          </div>
        )}
        {project.status === 'completed' && (
          <div style={{ backgroundColor: '#131929', border: '1px solid #10B981', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#10B981', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>Proyek Selesai!</h2>
            <p style={{ color: '#8892a4', fontSize: '14px' }}>Klien sudah menyetujui hasil kerjamu. Pembayaran segera diproses. Kerja bagus!</p>
          </div>
        )}

        {/* Chat */}
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '360px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e2d4a', fontSize: '14px', fontWeight: '700', color: '#8892a4' }}>
            💬 Chat dengan Klien
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#8892a4', padding: '40px 0' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
                <p style={{ fontSize: '13px' }}>Belum ada pesan. Mulai diskusi!</p>
              </div>
            ) : messages.map(m => {
              const isMe = m.sender_id === user?.id
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: isMe ? '#4F6EF7' : '#1e2d4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                    {(m.sender_name || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ maxWidth: '65%' }}>
                    {!isMe && <div style={{ fontSize: '10px', color: '#8892a4', marginBottom: '3px', marginLeft: '4px' }}>{m.sender_name}</div>}
                    <div style={{ backgroundColor: isMe ? '#4F6EF7' : '#0A0E1A', border: isMe ? 'none' : '1px solid #1e2d4a', borderRadius: isMe ? '14px 14px 3px 14px' : '14px 14px 14px 3px', padding: '9px 13px', fontSize: '13px', lineHeight: '1.5' }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8892a4', marginTop: '3px', textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : '4px' }}>
                      {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1e2d4a', display: 'flex', gap: '8px' }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Tulis pesan..."
              style={{ flex: 1, padding: '9px 13px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }} />
            <button onClick={handleSend} disabled={sending || !input.trim()}
              style={{ padding: '9px 18px', backgroundColor: input.trim() ? '#4F6EF7' : '#1e2d4a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: input.trim() ? 'pointer' : 'default' }}>
              {sending ? '...' : 'Kirim'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
