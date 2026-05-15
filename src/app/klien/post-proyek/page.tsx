'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const KATEGORI = [
  'Desain Grafis',
  'Web Development',
  'Social Media',
  'Penulisan',
  'Video Editing',
  'Fotografi',
  'Terjemahan',
  'Data Entry',
  'Marketing',
  'Lainnya',
]

export default function PostProyekPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')
  const [skillsInput, setSkillsInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  // Skills diinput sebagai teks dipisah koma, kita convert ke array
  // Contoh: "Figma, Illustrator, Logo Design" → ["Figma", "Illustrator", "Logo Design"]

  async function handleSubmit() {
    setLoading(true)
    setError('')

    // Cek user sudah login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/masuk')
      return
    }

    // Validasi sederhana
    if (!title || !description || !category || !budgetMin || !budgetMax || !estimatedDays) {
      setError('Semua field harus diisi')
      setLoading(false)
      return
    }

    // Convert skills string ke array
    const skillsArray = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    // Insert ke Supabase
    const { error } = await supabase.from('projects').insert({
      client_id: user.id,
      title,
      description,
      category,
      budget_min: parseInt(budgetMin),
      budget_max: parseInt(budgetMax),
      estimated_days: parseInt(estimatedDays),
      skills_required: skillsArray,
      status: 'open',
    })

    if (error) {
      setError('Gagal posting proyek: ' + error.message)
      setLoading(false)
    } else {
      // Berhasil → redirect ke halaman jelajah
      router.push('/klien/proyek')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0A0E1A',
    border: '1px solid #1e2d4a',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    color: '#8892a4',
    fontSize: '13px',
    display: 'block',
    marginBottom: '6px',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      {/* Navbar */}
      <div style={{
        backgroundColor: '#131929',
        borderBottom: '1px solid #1e2d4a',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4F6EF7' }}>Gawe</span>
        <span style={{ color: '#8892a4', fontSize: '14px' }}>Mode: Klien</span>
      </div>

      <div style={{ padding: '40px 32px', maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Post Proyek Baru</h1>
        <p style={{ color: '#8892a4', marginBottom: '32px', fontSize: '14px' }}>
          Isi detail proyekmu. Freelancer akan melihat dan melamar proyek ini.
        </p>

        {error && (
          <div style={{
            backgroundColor: '#2d1515', color: '#ff6b6b',
            padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Judul proyek</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="cth: Desain Logo untuk Toko Online"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Deskripsi lengkap</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Jelaskan apa yang kamu butuhkan, gaya yang diinginkan, referensi, dll."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Kategori</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Pilih kategori...</option>
              {KATEGORI.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Budget minimum (Rp)</label>
              <input
                type="number"
                value={budgetMin}
                onChange={e => setBudgetMin(e.target.value)}
                placeholder="200000"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Budget maksimum (Rp)</label>
              <input
                type="number"
                value={budgetMax}
                onChange={e => setBudgetMax(e.target.value)}
                placeholder="500000"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Estimasi waktu (hari)</label>
            <input
              type="number"
              value={estimatedDays}
              onChange={e => setEstimatedDays(e.target.value)}
              placeholder="7"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Skills yang dibutuhkan (pisah dengan koma)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={e => setSkillsInput(e.target.value)}
              placeholder="cth: Figma, Illustrator, Logo Design"
              style={inputStyle}
            />
            <span style={{ color: '#8892a4', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Opsional. Membantu freelancer yang tepat menemukan proyekmu.
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4F6EF7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '8px',
            }}
          >
            {loading ? 'Memposting...' : 'Post Proyek'}
          </button>
        </div>
      </div>
    </div>
  )
}