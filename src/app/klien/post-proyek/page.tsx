'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavbarKlien from '@/components/NavbarKlien'

const KATEGORI = [
  'Desain Grafis', 'Web Development', 'Social Media', 'Penulisan Konten',
  'Video Editing', 'Fotografi', 'Translasi', 'Data Entry', 'UI/UX Design', 'Lainnya'
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

  const inputStyle = {
    width: '100%', padding: '12px 16px', backgroundColor: '#131929',
    border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <NavbarKlien />
      <div style={{ padding: '40px 32px', maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Post Proyek Baru</h1>
        <p style={{ color: '#8892a4', marginBottom: '32px' }}>Isi detail proyekmu. Freelancer akan melihat dan melamar proyek ini.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '14px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>Judul proyek</label>
            <input style={inputStyle} placeholder="cth: Desain Logo untuk Toko Online"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div>
            <label style={{ fontSize: '14px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>Deskripsi lengkap</label>
            <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
              placeholder="Jelaskan apa yang kamu butuhkan, gaya yang diinginkan, referensi, dll."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div>
            <label style={{ fontSize: '14px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>Kategori</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Pilih kategori...</option>
              {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>Budget minimum (Rp)</label>
              <input style={inputStyle} type="number"
                value={form.budget_min} onChange={e => setForm(f => ({ ...f, budget_min: Number(e.target.value) }))} />
            </div>
            <div>
              <label style={{ fontSize: '14px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>Budget maksimum (Rp)</label>
              <input style={inputStyle} type="number"
                value={form.budget_max} onChange={e => setForm(f => ({ ...f, budget_max: Number(e.target.value) }))} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '14px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>Estimasi waktu (hari)</label>
            <input style={inputStyle} type="number"
              value={form.estimated_days} onChange={e => setForm(f => ({ ...f, estimated_days: Number(e.target.value) }))} />
          </div>

          <div>
            <label style={{ fontSize: '14px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>Skills yang dibutuhkan (pisah dengan koma)</label>
            <input style={inputStyle} placeholder="cth: Figma, Illustrator, Logo Design"
              value={form.skills_required} onChange={e => setForm(f => ({ ...f, skills_required: e.target.value }))} />
            <p style={{ color: '#8892a4', fontSize: '12px', marginTop: '6px' }}>Opsional. Membantu freelancer yang tepat menemukan proyekmu.</p>
          </div>

          {error && <div style={{ backgroundColor: '#2d1515', border: '1px solid #EF4444', borderRadius: '8px', padding: '12px 16px', color: '#EF4444', fontSize: '14px' }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: '14px', backgroundColor: loading ? '#2a3a6a' : '#4F6EF7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Memposting...' : 'Post Proyek'}
          </button>
        </div>
      </div>
    </div>
  )
}
