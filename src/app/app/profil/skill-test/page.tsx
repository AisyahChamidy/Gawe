'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { FileText, Target, Clock, Lightbulb } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme
const STATUS_RED = '#EF4444'

type SkillTest = {
  id: string; category: string; title: string; description: string
  duration_minutes: number; passing_score: number; questions: any[]
}
type Attempt = { test_id: string; score: number; passed: boolean; completed_at: string }

export default function SkillTestListPage() {
  const [tests, setTests] = useState<SkillTest[]>([])
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/masuk'); return }

      const [{ data: testsData }, { data: attemptsData }] = await Promise.all([
        supabase.from('skill_tests').select('*').eq('is_active', true).order('created_at'),
        supabase.from('skill_test_attempts').select('test_id, score, passed, completed_at')
          .eq('user_id', user.id).order('completed_at', { ascending: false }),
      ])

      setTests(testsData || [])

      // Keep only best/latest attempt per test
      const map: Record<string, Attempt> = {}
      for (const a of (attemptsData || [])) {
        if (!map[a.test_id]) map[a.test_id] = a
        else if (a.passed && !map[a.test_id].passed) map[a.test_id] = a
      }
      setAttempts(map)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>Memuat...</div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <Navbar />
      <div style={{ padding: 'clamp(20px,5vw,40px) clamp(16px,4vw,32px)', maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <a href="/app/profil" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '13px' }}>← Kembali ke Profil</a>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginTop: '12px', marginBottom: '6px', fontFamily: theme.fonts.headline, color: C.textDark }}>Skill Test</h1>
          <p style={{ color: C.textMuted, fontSize: '14px' }}>Buktikan kemampuanmu. Setiap tes yang lulus menambah +5 Trust Score.</p>
        </div>

        {tests.length === 0 ? (
          <div style={{ backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '60px', textAlign: 'center', color: C.textMuted }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', opacity: 0.4 }}>
              <FileText size={40} strokeWidth={1.5} color={C.textMuted} />
            </div>
            <p style={{ margin: 0 }}>Belum ada skill test tersedia. Cek lagi nanti!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tests.map(test => {
              const attempt = attempts[test.id]
              const qCount = Array.isArray(test.questions) ? test.questions.length : 0
              return (
                <div key={test.id} style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ backgroundColor: C.primaryTint, border: `1px solid ${C.primaryBorder}`, color: C.primary, fontSize: '11px', padding: '3px 10px', borderRadius: R.pill, fontWeight: 600 }}>
                          {test.category}
                        </span>
                        {attempt && (
                          attempt.passed ? (
                            <span style={{ backgroundColor: C.successTint, border: `1px solid ${C.success}33`, color: C.success, fontSize: '11px', padding: '3px 10px', borderRadius: R.pill, fontWeight: 700 }}>
                              ✓ Lulus ({attempt.score}/100)
                            </span>
                          ) : (
                            <span style={{ backgroundColor: STATUS_RED + '18', border: `1px solid ${STATUS_RED}33`, color: STATUS_RED, fontSize: '11px', padding: '3px 10px', borderRadius: R.pill, fontWeight: 700 }}>
                              ✗ Tidak Lulus ({attempt.score}/100)
                            </span>
                          )
                        )}
                      </div>
                      <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px', color: C.textDark }}>{test.title}</h2>
                      <p style={{ color: C.textMuted, fontSize: '13px', lineHeight: '1.6', marginBottom: '14px' }}>{test.description}</p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: C.textMuted, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} strokeWidth={1.5} /> {test.duration_minutes} menit</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={12} strokeWidth={1.5} /> {qCount} soal</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Target size={12} strokeWidth={1.5} /> Lulus: {test.passing_score}/100</span>
                        <span style={{ color: C.primary, fontWeight: 600 }}>+5 Trust Score jika lulus</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <a href={`/app/profil/skill-test/${test.id}`} style={{
                        display: 'block', padding: '10px 20px',
                        backgroundColor: attempt?.passed ? C.bgLavenderSoft : C.primary,
                        color: attempt?.passed ? C.textMuted : 'white',
                        textDecoration: 'none', borderRadius: R.sm, fontSize: '13px',
                        fontWeight: 700, textAlign: 'center',
                        border: attempt?.passed ? `1px solid ${C.border}` : 'none',
                      }}>
                        {!attempt ? 'Mulai Tes' : attempt.passed ? 'Ulangi' : 'Coba Lagi'}
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: '32px', backgroundColor: C.primaryTint, border: `1px solid ${C.primaryBorder}`, borderRadius: R.md, padding: '20px 24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: C.primary, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px' }}>
            <Lightbulb size={16} strokeWidth={1.5} />
            Tentang Skill Test
          </h3>
          <p style={{ fontSize: '13px', color: C.textMuted, lineHeight: '1.7', margin: 0 }}>
            Setiap tes yang kamu lulus menambah <strong style={{ color: C.textDark }}>+5 Trust Score</strong> ke profil-mu. Trust Score yang tinggi membuat profil-mu lebih menarik di mata klien dan meningkatkan peluang diterima proyek.
          </p>
        </div>
      </div>
    </div>
  )
}
