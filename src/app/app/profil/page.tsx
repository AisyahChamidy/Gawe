'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { MapPin } from 'lucide-react'

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
  const [ktpVerified, setKtpVerified] = useState(false)
  const [skillTestsPassed, setSkillTestsPassed] = useState(0)
  const [customSkill, setCustomSkill] = useState('')
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
        setKtpVerified(p.ktp_status === 'verified')
        setSkillTestsPassed(p.skill_tests_passed || 0)
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
    if (ktpVerified) score += 10
    await supabase.from('profiles').upsert({ id: user.id, full_name: form.full_name, headline: form.headline, bio: form.bio, city: form.city, skills, trust_score: score })
    setTrustScore(score)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  const skillList = form.skills.split(',').map(s => s.trim()).filter(Boolean)

  function addSkill(k: string) {
    if (!skillList.includes(k)) setForm(f => ({ ...f, skills: [...skillList, k].join(', ') }))
  }

  function removeSkill(k: string) {
    setForm(f => ({ ...f, skills: skillList.filter(s => s !== k).join(', ') }))
  }

  function addCustomSkill() {
    const t = customSkill.trim()
    if (t && !skillList.includes(t)) { setForm(f => ({ ...f, skills: [...skillList, t].join(', ') })); setCustomSkill('') }
  }

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }

  const initial = (form.full_name || user?.email || '?')[0].toUpperCase()

  const scoreBreakdown = [
    { label: '+10 dasar',                  active: true                              },
    { label: '+5 nama lengkap',            active: !!form.full_name                  },
    { label: '+5 headline',                active: !!form.headline                   },
    { label: '+5 bio (min. 50 karakter)',  active: !!(form.bio && form.bio.length > 50) },
    { label: '+3 kota',                    active: !!form.city                       },
    { label: '+7 skills',                  active: skillList.length > 0              },
    { label: '+10 identitas terverifikasi',active: ktpVerified                       },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <style>{`
        @media (max-width: 768px) {
          .profil-layout { flex-direction: column !important; }
          .profil-sticky { position: static !important; }
          .profil-left  { width: 100% !important; }
          .profil-right { width: 100% !important; }
        }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
      <Navbar />
      <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, margin: 0 }}>Edit Profil</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px', marginBottom: 0, fontSize: '14px' }}>
            Profil lengkap meningkatkan Trust Score dan peluang diterima.
          </p>
        </div>

        <div className="profil-layout" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* ── LEFT: Preview card ──────────────────────────────────────── */}
          <div className="profil-left" style={{ width: '35%', flexShrink: 0 }}>
            <div className="profil-sticky" style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>

                {/* Avatar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ position: 'relative', marginBottom: '14px' }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar"
                        style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(79,110,247,0.4)' }} />
                    ) : (
                      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #4F6EF7 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, color: 'white', border: '2px solid rgba(79,110,247,0.4)' }}>
                        {initial}
                      </div>
                    )}
                    <label style={{ position: 'absolute', bottom: 0, right: -4, background: '#131929', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '3px 7px', fontSize: '11px', color: '#4F6EF7', cursor: 'pointer', fontWeight: 600 }}>
                      {uploadingAvatar ? '...' : 'Ganti'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                    </label>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                      {form.full_name
                        ? form.full_name
                        : <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', fontSize: '15px' }}>Nama belum diisi</span>
                      }
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '6px', lineHeight: 1.4 }}>
                      {form.headline
                        ? form.headline
                        : <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Headline belum diisi</span>
                      }
                    </div>
                    {form.city && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        <MapPin size={12} strokeWidth={1.5} />
                        {form.city}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 16px' }} />

                {/* Trust Score */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Trust Score</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: '#22D3EE', fontFamily: 'monospace', lineHeight: 1 }}>{trustScore}</span>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>/100</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(trustScore, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #4F6EF7 0%, #22D3EE 100%)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                {/* Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
                  {scoreBreakdown.map(({ label, active }) => (
                    <div key={label} style={{ fontSize: '11px', color: active ? '#10B981' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ flexShrink: 0 }}>{active ? '✓' : '○'}</span>
                      {label}
                    </div>
                  ))}
                </div>

                {/* Verified badge */}
                {ktpVerified && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '4px 10px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px' }}>🛡️</span>
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Identitas Terverifikasi</span>
                  </div>
                )}

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 12px' }} />

                {/* Public profile link */}
                {user && (
                  <a href={`/freelancer/${user.id}`}
                    style={{ display: 'block', textAlign: 'center', fontSize: '13px', color: '#4F6EF7', textDecoration: 'none', fontWeight: 500 }}>
                    Lihat profil publik →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Form ─────────────────────────────────────────────── */}
          <div className="profil-right" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Section 1: Informasi Dasar */}
              <div style={{ paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: '16px' }}>
                  Informasi Dasar
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'Nama lengkap', key: 'full_name', placeholder: 'Nama lengkapmu' },
                    { label: 'Headline',     key: 'headline',  placeholder: 'cth: UI Designer untuk UMKM · Bandung' },
                    { label: 'Kota',         key: 'city',      placeholder: 'cth: Bandung' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                      <input style={inp} value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: '6px' }}>Bio</label>
                    <textarea style={{ ...inp, minHeight: '100px', resize: 'vertical' }} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Ceritakan pengalaman dan spesialisasimu..." />
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                      {form.bio.length} karakter{form.bio.length < 50 ? ' · min. 50 karakter untuk +5 poin' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Keahlian */}
              <div style={{ paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: '16px' }}>
                  Keahlian
                </div>

                {/* Active skill tags */}
                {skillList.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {skillList.map(skill => (
                      <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.25)', color: '#4F6EF7', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 500 }}>
                        {skill}
                        <button onClick={() => removeSkill(skill)}
                          style={{ background: 'none', border: 'none', color: 'rgba(79,110,247,0.6)', cursor: 'pointer', padding: 0, fontSize: '15px', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom skill input */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill() } }}
                    placeholder="Tambah skill kustom (Enter untuk tambah)"
                    style={{ ...inp, flex: 1 }}
                  />
                  <button onClick={addCustomSkill}
                    style={{ padding: '10px 14px', background: 'rgba(79,110,247,0.15)', border: '1px solid rgba(79,110,247,0.3)', color: '#4F6EF7', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    + Tambah
                  </button>
                </div>

                {/* Quick-add */}
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>Pilih cepat:</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {SKILL_TAGS.filter(k => !skillList.includes(k)).map(k => (
                    <button key={k} onClick={() => addSkill(k)}
                      style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.5)' }}>
                      + {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 3: Verifikasi */}
              <div style={{ paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: '16px' }}>
                  Verifikasi
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>Verifikasi Identitas (KTP)</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>+10 Trust Score</div>
                    </div>
                    {ktpVerified ? (
                      <span style={{ fontSize: '12px', color: '#10B981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '4px 12px', fontWeight: 600 }}>
                        ✓ Terverifikasi
                      </span>
                    ) : (
                      <a href="/app/profil/verifikasi"
                        style={{ fontSize: '12px', color: '#4F6EF7', background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.25)', borderRadius: '20px', padding: '5px 12px', textDecoration: 'none', fontWeight: 500 }}>
                        Verifikasi →
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>Skill Test</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        {skillTestsPassed > 0 ? `${skillTestsPassed} tes lulus` : 'Belum ikut tes'}
                      </div>
                    </div>
                    <a href="/app/profil/skill-test"
                      style={{ fontSize: '12px', color: '#8B5CF6', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '20px', padding: '5px 12px', textDecoration: 'none', fontWeight: 500 }}>
                      {skillTestsPassed > 0 ? 'Ikut lagi →' : 'Mulai tes →'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Success banner */}
              {saved && (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#10B981', fontSize: '14px' }}>
                  ✓ Profil disimpan! Trust Score diperbarui ke {trustScore}.
                </div>
              )}

              {/* Save button */}
              <button onClick={handleSave} disabled={saving}
                style={{ width: '100%', padding: '12px', background: saving ? 'rgba(79,110,247,0.5)' : '#4F6EF7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Reviews ──────────────────────────────────────────────────── */}
        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Ulasan dari Klien</h2>
            {myReviews.length > 0 && (
              <span style={{ color: '#FBBF24', fontSize: '14px', fontWeight: 600 }}>
                ⭐ {avgRating} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>({myReviews.length} ulasan)</span>
              </span>
            )}
          </div>
          {myReviews.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</div>
              <p style={{ fontSize: '14px', margin: 0 }}>Belum ada ulasan. Selesaikan proyek dan minta klien beri rating!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myReviews.map((r: any, i: number) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: r.comment ? '8px' : 0 }}>
                    <span style={{ color: '#FBBF24', fontSize: '15px' }}>
                      {'⭐'.repeat(r.rating)}
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginLeft: '6px' }}>{r.rating}/5</span>
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                      {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {r.comment && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
