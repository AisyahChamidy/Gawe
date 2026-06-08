'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const SKILL_TAGS = ['Figma','Illustrator','Photoshop','React','Next.js','Node.js','WordPress','Instagram','TikTok','Copywriting','SEO','Translasi','Video Editing','Fotografi','Logo Design']

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ full_name: '', headline: '', bio: '', city: '', skills: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [trustScore, setTrustScore] = useState(10)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [myReviews, setMyReviews] = useState<any[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }
      setUser(user)
      const [{ data: p }, { data: revData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('reviews').select('rating, comment, created_at')
          .eq('reviewee_id', user.id).order('created_at', { ascending: false }),
      ])
      if (p) {
        setForm({ full_name: p.full_name || '', headline: p.headline || '', bio: p.bio || '', city: p.city || '', skills: (p.skills || []).join(', ') })
        setTrustScore(p.trust_score || 10)
        setAvatarUrl(p.avatar_url || null)
      }
      if (revData && revData.length > 0) {
        setMyReviews(revData)
        setAvgRating(Math.round((revData.reduce((s: number, r: any) => s + r.rating, 0) / revData.length) * 10) / 10)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = urlData.publicUrl
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    setAvatarUrl(publicUrl + '?t=' + Date.now())
    setUploadingAvatar(false)
  }

  async function handleSave() {
    setSaving(true)
    const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean)
    let score = 10
    if (form.full_name) score += 5
    if (form.headline) score += 5
    if (form.bio && form.bio.length > 50) score += 5
    if (form.city) score += 3
    if (skills.length > 0) score += 7
    await supabase.from('profiles').upsert({ id: user.id, full_name: form.full_name, headline: form.headline, bio: form.bio, city: form.city, skills, trust_score: score })
    setTrustScore(score)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  const addSkill = (k: string) => {
    const current = form.skills.split(',').map(s => s.trim()).filter(Boolean)
    if (!current.includes(k)) setForm(f => ({ ...f, skills: [...current, k].join(', ') }))
  }

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>

  const inp = { width: '100%', padding: '10px 14px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ padding: '40px 32px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar"
                  style={{ width: 72, height: 72, borderRadius: '12px', objectFit: 'cover', border: '2px solid #1e2d4a' }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: '12px', backgroundColor: '#4F6EF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: 'white' }}>
                  {(form.full_name || user?.email || '?')[0].toUpperCase()}
                </div>
              )}
              <label style={{ position: 'absolute', bottom: -6, right: -6, backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '6px', padding: '3px 7px', fontSize: '11px', color: '#4F6EF7', cursor: 'pointer', fontWeight: '600' }}>
                {uploadingAvatar ? '...' : 'Ganti'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Edit Profil</h1>
              <p style={{ color: '#8892a4', fontSize: '13px' }}>Profil lengkap = Trust Score tinggi</p>
            </div>
          </div>
          <div style={{ backgroundColor: '#131929', border: '1px solid rgba(34,211,238,0.4)', borderRadius: '12px', padding: '16px 20px', minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#22D3EE', fontFamily: 'Outfit, sans-serif' }}>{trustScore}</span>
              <span style={{ fontSize: '14px', color: '#8892a4' }}>/100</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#1e2d4a', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(trustScore, 100)}%`, height: '100%', backgroundColor: '#22D3EE', borderRadius: '2px' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#8892a4', lineHeight: '1.6' }}>
              <div>+10 dasar</div>
              {form.full_name && <div style={{ color: '#10B981' }}>+5 nama lengkap</div>}
              {form.headline && <div style={{ color: '#10B981' }}>+5 headline</div>}
              {form.bio && form.bio.length > 50 && <div style={{ color: '#10B981' }}>+5 bio</div>}
              {form.city && <div style={{ color: '#10B981' }}>+3 kota</div>}
              {form.skills && <div style={{ color: '#10B981' }}>+7 skills</div>}
            </div>
            <a href="/app/profil/skill-test" style={{ display: 'block', marginTop: '10px', fontSize: '11px', color: '#4F6EF7', textDecoration: 'none', fontWeight: '600' }}>
              + Ikuti Skill Test →
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { label: 'Nama lengkap', key: 'full_name', placeholder: 'Nama lengkapmu' },
            { label: 'Headline', key: 'headline', placeholder: 'cth: UI Designer untuk UMKM · Bandung' },
            { label: 'Kota', key: 'city', placeholder: 'cth: Bandung' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: '14px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>{f.label}</label>
              <input style={inp} value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: '14px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>Bio</label>
            <textarea style={{ ...inp, minHeight: '100px', resize: 'vertical' }} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Ceritakan pengalaman dan spesialisasimu..." />
          </div>

          <div>
            <label style={{ fontSize: '14px', color: '#8892a4', display: 'block', marginBottom: '8px' }}>Skills (pisah koma)</label>
            <input style={inp} value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="cth: Figma, Ilustrasi, React" />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {SKILL_TAGS.map(k => (
                <button key={k} onClick={() => addSkill(k)}
                  style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', border: '1px solid #1e2d4a', backgroundColor: 'transparent', color: '#8892a4' }}>
                  + {k}
                </button>
              ))}
            </div>
          </div>

          {saved && <div style={{ backgroundColor: '#152d1e', border: '1px solid #10B981', borderRadius: '8px', padding: '12px 16px', color: '#10B981', fontSize: '14px' }}>✓ Profil disimpan! Trust Score diperbarui ke {trustScore}.</div>}

          <button onClick={handleSave} disabled={saving}
            style={{ padding: '14px', backgroundColor: saving ? '#2a3a6a' : '#4F6EF7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>

        {/* Ulasan yang diterima */}
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Ulasan dari Klien</h2>
            {myReviews.length > 0 && (
              <span style={{ color: '#FBBF24', fontSize: '14px', fontWeight: '600' }}>
                ⭐ {avgRating} <span style={{ color: '#8892a4', fontWeight: '400' }}>({myReviews.length} ulasan)</span>
              </span>
            )}
          </div>
          {myReviews.length === 0 ? (
            <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#8892a4' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</div>
              <p style={{ fontSize: '14px' }}>Belum ada ulasan. Selesaikan proyek dan minta klien beri rating!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myReviews.map((r: any, i: number) => (
                <div key={i} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: r.comment ? '8px' : 0 }}>
                    <span style={{ color: '#FBBF24', fontSize: '15px' }}>{'⭐'.repeat(r.rating)}<span style={{ color: '#8892a4', fontSize: '12px', marginLeft: '6px' }}>{r.rating}/5</span></span>
                    <span style={{ color: '#8892a4', fontSize: '12px' }}>
                      {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {r.comment && <p style={{ color: '#c4cdd6', fontSize: '13px', lineHeight: '1.6' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
