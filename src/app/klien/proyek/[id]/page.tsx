'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'
import { Send, MessageCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

type Message = { id: string; content: string; sender_id: string; created_at: string; sender_name?: string }
type Project = { id: string; title: string; category: string; budget_min: number; budget_max: number; status: string }

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function KlienProyekDetailPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }

      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (prof?.role !== 'client' && prof?.role !== 'both') { router.push('/app/dasbor'); return }

      setUser(user)

      const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).eq('client_id', user.id).single()
      if (!proj) { router.push('/klien/proyek'); return }
      setProject(proj)
      await loadMessages()
      setLoading(false)

      const channel = supabase
        .channel('klien-messages-' + projectId)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'project_id=eq.' + projectId },
          () => loadMessages())
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    load()
  }, [projectId])

  async function loadMessages() {
    const { data } = await supabase
      .from('messages').select('id, content, sender_id, created_at')
      .eq('project_id', projectId).order('created_at', { ascending: true })

    if (!data) return
    const ids = [...new Set(data.map(m => m.sender_id))]
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids)
    const nameMap: Record<string, string> = {}
    ;(profiles || []).forEach((p: any) => { nameMap[p.id] = p.full_name || 'Pengguna' })
    setMessages(data.map(m => ({ ...m, sender_name: nameMap[m.sender_id] || 'Pengguna' })))
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function handleSend() {
    if (!input.trim() || sending) return
    setSending(true)
    await supabase.from('messages').insert({ project_id: projectId, sender_id: user.id, content: input.trim() })
    setInput('')
    setSending(false)
    loadMessages()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>
      Memuat...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark, display: 'flex', flexDirection: 'column' }}>
      <NavbarKlien />
      <div style={{ flex: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 32px) 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {project && (
          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px 24px', boxShadow: theme.shadow.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ backgroundColor: C.primaryTint, color: C.primary, fontSize: '11px', padding: '2px 8px', borderRadius: '20px', marginBottom: '8px', display: 'inline-block' }}>{project.category}</span>
                <h1 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 700, margin: '6px 0 4px', color: C.textDark, fontFamily: theme.fonts.headline }}>{project.title}</h1>
                <span style={{ color: C.primary, fontSize: '14px', fontFamily: theme.fonts.mono }}>{fmt(project.budget_min)} – {fmt(project.budget_max)}</span>
              </div>
              <a href="/klien/proyek" style={{ color: C.textMuted, fontSize: '13px', textDecoration: 'none', flexShrink: 0, paddingTop: '4px' }}>← Kembali</a>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '450px', boxShadow: theme.shadow.card }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, fontSize: '14px', fontWeight: 700, color: C.textDark, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={16} strokeWidth={1.5} color={C.primary} />
            Pesan dengan Freelancer
          </div>
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', backgroundColor: C.bgLavenderSoft }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.textMuted, padding: '40px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', opacity: 0.3 }}>
                  <MessageCircle size={32} strokeWidth={1} color={C.textDark} />
                </div>
                <p style={{ margin: 0 }}>Belum ada pesan. Mulai diskusi dengan freelancer!</p>
              </div>
            ) : messages.map(m => {
              const isMe = m.sender_id === user?.id
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: isMe ? C.primary : C.bgLavenderStrong, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, color: isMe ? 'white' : C.textMuted }}>
                    {(m.sender_name || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ maxWidth: '65%' }}>
                    {!isMe && <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '4px', marginLeft: '4px' }}>{m.sender_name}</div>}
                    <div style={{ backgroundColor: isMe ? C.primary : C.bgWhite, border: isMe ? 'none' : `1px solid ${C.border}`, borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', fontSize: '14px', lineHeight: '1.5', color: isMe ? 'white' : C.textDark }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: '10px', color: C.textTertiary, marginTop: '4px', textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : '4px' }}>
                      {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '8px', backgroundColor: C.bgWhite }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Tulis pesan... (Enter untuk kirim)"
              style={{ flex: 1, padding: '10px 14px', backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textDark, fontSize: '14px', outline: 'none' }} />
            <button onClick={handleSend} disabled={sending || !input.trim()} style={{
              padding: '10px 16px', backgroundColor: input.trim() ? C.primary : C.bgLavenderStrong,
              color: input.trim() ? 'white' : C.textMuted,
              border: 'none', borderRadius: R.sm, cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {sending ? '...' : <Send size={16} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

      </div>
      <div style={{ height: 32 }} />
    </div>
  )
}
