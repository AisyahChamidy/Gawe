'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme
const STATUS_RED = '#EF4444'

const KATEGORI = [
  'Desain Grafis', 'Web Development', 'Social Media', 'Penulisan Konten',
  'Video Editing', 'Fotografi', 'Terjemahan', 'Data Entry', 'UI/UX Design', 'Lainnya'
]

export default function PostProyekPage() {
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    budget_min: 200000, budget_max: 500000,
    estimated_days: 7, skills_required: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (prof?.role !== 'client' && prof?.role !== 'both') { router.push('/app/dasbor'); return }
    }
    checkAccess()
  }, [])

  async function handleSubmit() {
    if (!form.title || !form.description || !form.category) {
      setError('Judul, deskripsi, dan kategori wajib diisi.')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/masuk'); return }

    const skills = form.skills_required
      ? form.skills_required.split(',').map(s => s.trim()).filter(Boolean)
      : []

    const { error: err } = await supabase.from('projects').insert({
      client_id: user.id,
      title: form.title,
      description: form.description,
      category: form.category,
      budget_min: form.budget_min,
      budget_max: form.budget_max,
      estimated_days: form.estimated_days,
      skills_required: skills,
      status: 'open',
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/klien/proyek')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    backgroundColor: C.bgLavenderSoft,
    border: `1px solid ${C.border}`,
    borderRadius: R.sm,
    color: C.textDark,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '14px', color: C.textMuted, display: 'block', marginBottom: '8px',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <NavbarKlien />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <a href="/klien/proyek" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '13px' }}>← Kembali ke Proyekku</a>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginTop: '12px', marginBottom: '6px', fontFamily: theme.fonts.headline, color: C.textDark }}>Post Proyek Baru</h1>
          <p style={{ color: C.textMuted, fontSize: '14px' }}>Isi detail proyekmu. Freelancer akan melihat dan melamar proyek ini.</p>
        </div>

        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '32px', boxShadow: theme.shadow.card }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Judul proyek</label>
              <input style={inputStyle} placeholder="cth: Desain Logo untuk Toko Online"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div>
              <label style={labelStyle}>Deskripsi lengkap</label>
              <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="Jelaskan apa yang kamu butuhkan, gaya yang diinginkan, referensi, dll."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div>
              <label style={labelStyle}>Kategori</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">Pilih kategori...</option>
                {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Budget minimum (Rp)</label>
                <input style={inputStyle} type="number"
                  value={form.budget_min} onChange={e => setForm(f => ({ ...f, budget_min: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={labelStyle}>Budget maksimum (Rp)</label>
                <input style={inputStyle} type="number"
                  value={form.budget_max} onChange={e => setForm(f => ({ ...f, budget_max: Number(e.target.value) }))} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Estimasi waktu (hari)</label>
              <input style={inputStyle} type="number"
                value={form.estimated_days} onChange={e => setForm(f => ({ ...f, estimated_days: Number(e.target.value) }))} />
            </div>

            <div>
              <label style={labelStyle}>Skills yang dibutuhkan (pisah dengan koma)</label>
              <input style={inputStyle} placeholder="cth: Figma, Illustrator, Logo Design"
                value={form.skills_required} onChange={e => setForm(f => ({ ...f, skills_required: e.target.value }))} />
              <p style={{ color: C.textMuted, fontSize: '12px', marginTop: '6px', marginBottom: 0 }}>Opsional. Membantu freelancer yang tepat menemukan proyekmu.</p>
            </div>

            {error && (
              <div style={{ backgroundColor: STATUS_RED + '18', border: `1px solid ${STATUS_RED}33`, borderRadius: R.sm, padding: '12px 16px', color: STATUS_RED, fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ padding: '14px', backgroundColor: loading ? C.bgLavenderStrong : C.primary, color: loading ? C.textMuted : 'white', border: 'none', borderRadius: R.sm, fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Memposting...' : 'Post Proyek'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
