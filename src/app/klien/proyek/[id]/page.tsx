'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'

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
      setUser(user)

      const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single()
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

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <NavbarKlien />
      <div style={{ flex: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: '32px 32px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {project && (
          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ backgroundColor: '#1a2340', color: '#4F6EF7', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', marginBottom: '8px', display: 'inline-block' }}>{project.category}</span>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '6px 0 4px' }}>{project.title}</h1>
                <span style={{ color: '#22D3EE', fontSize: '14px' }}>{fmt(project.budget_min)} – {fmt(project.budget_max)}</span>
              </div>
              <a href="/klien/proyek" style={{ color: '#8892a4', fontSize: '13px', textDecoration: 'none' }}>← Kembali</a>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '450px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d4a', fontSize: '14px', fontWeight: 'bold', color: '#8892a4' }}>
            💬 Pesan dengan Freelancer
          </div>
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#8892a4', padding: '40px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                <p>Belum ada pesan. Mulai diskusi dengan freelancer!</p>
              </div>
            ) : messages.map(m => {
              const isMe = m.sender_id === user?.id
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: isMe ? '#4F6EF7' : '#1e2d4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                    {(m.sender_name || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ maxWidth: '65%' }}>
                    {!isMe && <div style={{ fontSize: '11px', color: '#8892a4', marginBottom: '4px', marginLeft: '4px' }}>{m.sender_name}</div>}
                    <div style={{ backgroundColor: isMe ? '#4F6EF7' : '#0A0E1A', border: isMe ? 'none' : '1px solid #1e2d4a', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', fontSize: '14px', lineHeight: '1.5' }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8892a4', marginTop: '4px', textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : '4px' }}>
                      {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '16px 20px', borderTop: '1px solid #1e2d4a', display: 'flex', gap: '8px' }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Tulis pesan... (Enter untuk kirim)"
              style={{ flex: 1, padding: '10px 14px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }} />
            <button onClick={handleSend} disabled={sending || !input.trim()}
              style={{ padding: '10px 20px', backgroundColor: input.trim() ? '#4F6EF7' : '#1e2d4a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: input.trim() ? 'pointer' : 'default' }}>
              {sending ? '...' : 'Kirim'}
            </button>
          </div>
        </div>

      </div>
      <div style={{ height: 32 }} />
    </div>
  )
}
