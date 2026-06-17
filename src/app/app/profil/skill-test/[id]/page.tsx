'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { FileText, Clock, Target, Star, Lightbulb, PartyPopper } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme
const STATUS_RED = '#EF4444'

type Question = { id: string; question: string; options: string[]; correct: number; explanation: string }
type SkillTest = { id: string; category: string; title: string; description: string; duration_minutes: number; passing_score: number; questions: Question[] }
type Phase = 'intro' | 'quiz' | 'result'

export default function SkillTestPage() {
  const params = useParams()
  const testId = params.id as string
  const router = useRouter()
  const supabase = createClient()

  const [test, setTest]     = useState<SkillTest | null>(null)
  const [user, setUser]     = useState<any>(null)
  const [currentTrust, setCurrentTrust] = useState(0)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase]   = useState<Phase>('intro')

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean; correctCount: number } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth/masuk'); return }
      setUser(u)

      const [{ data: testData }, { data: profile }] = await Promise.all([
        supabase.from('skill_tests').select('*').eq('id', testId).single(),
        supabase.from('profiles').select('trust_score').eq('id', u.id).single(),
      ])
      if (!testData) { router.push('/app/profil/skill-test'); return }
      setTest(testData)
      setCurrentTrust(profile?.trust_score || 10)
      setLoading(false)
    }
    load()
  }, [testId])

  async function handleSubmit() {
    if (!test || !user) return
    const questions: Question[] = test.questions
    const unanswered = questions.filter(q => answers[q.id] === undefined)
    if (unanswered.length > 0) {
      alert(`Masih ada ${unanswered.length} soal yang belum dijawab.`)
      return
    }

    setSubmitting(true)
    const correctCount = questions.filter(q => answers[q.id] === q.correct).length
    const score = Math.round((correctCount / questions.length) * 100)
    const passed = score >= test.passing_score

    await supabase.from('skill_test_attempts').insert({
      user_id: user.id,
      test_id: test.id,
      score,
      passed,
      answers,
      completed_at: new Date().toISOString(),
    })

    if (passed) {
      await supabase.from('profiles').update({ trust_score: currentTrust + 5 }).eq('id', user.id)
    }

    setResult({ score, passed, correctCount })
    setPhase('result')
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontFamily: theme.fonts.body }}>Memuat...</div>
  )
  if (!test) return null

  const questions: Question[] = test.questions

  const statItems = [
    { Icon: FileText, label: 'Jumlah Soal', value: `${questions.length} soal` },
    { Icon: Clock,    label: 'Durasi',      value: `${test.duration_minutes} menit` },
    { Icon: Target,   label: 'Nilai Lulus', value: `${test.passing_score}/100` },
    { Icon: Star,     label: 'Bonus Lulus', value: '+5 Trust Score' },
  ]

  // ── INTRO ──
  if (phase === 'intro') return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <Navbar />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(32px,6vw,60px) clamp(16px,4vw,32px)' }}>
        <a href="/app/profil/skill-test" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '13px' }}>← Semua Skill Test</a>
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '36px', marginTop: '20px', boxShadow: theme.shadow.card }}>
          <span style={{ backgroundColor: C.primaryTint, border: `1px solid ${C.primaryBorder}`, color: C.primary, fontSize: '12px', padding: '4px 12px', borderRadius: R.pill, fontWeight: 600 }}>
            {test.category}
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '16px 0 12px', fontFamily: theme.fonts.headline, color: C.textDark }}>{test.title}</h1>
          <p style={{ color: C.textMuted, fontSize: '14px', lineHeight: '1.7', marginBottom: '28px' }}>{test.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '12px', marginBottom: '28px' }}>
            {statItems.map(s => (
              <div key={s.label} style={{ backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, borderRadius: R.sm, padding: '14px' }}>
                <div style={{ marginBottom: '8px' }}><s.Icon size={20} strokeWidth={1.5} color={C.primary} /></div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: C.textDark, marginBottom: '2px', fontFamily: theme.fonts.mono }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: C.textMuted }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: C.primaryTint, border: `1px solid ${C.primaryBorder}`, borderRadius: R.sm, padding: '14px 16px', marginBottom: '24px', fontSize: '13px', color: C.textMuted, lineHeight: '1.6', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Lightbulb size={14} strokeWidth={1.5} color={C.primary} style={{ flexShrink: 0, marginTop: '2px' }} />
            Pilih satu jawaban untuk setiap soal. Kamu bisa mengubah jawaban sebelum submit. Hasil langsung tampil setelah submit.
          </div>

          <button onClick={() => setPhase('quiz')} style={{ width: '100%', padding: '14px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: R.sm, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
            Mulai Tes →
          </button>
        </div>
      </div>
    </div>
  )

  // ── QUIZ ──
  if (phase === 'quiz') return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <Navbar />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,32px) 80px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '14px', color: C.textMuted }}>{test.title}</span>
          <span style={{ fontSize: '13px', color: C.primary, fontWeight: 600 }}>
            {Object.keys(answers).length}/{questions.length} dijawab
          </span>
        </div>
        <div style={{ width: '100%', height: '3px', backgroundColor: C.bgLavenderStrong, borderRadius: '2px', marginBottom: '32px', overflow: 'hidden' }}>
          <div style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%`, height: '100%', backgroundColor: C.primary, borderRadius: '2px', transition: 'width 0.3s' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {questions.map((q, idx) => (
            <div key={q.id} style={{ backgroundColor: C.bgWhite, border: `1px solid ${answers[q.id] !== undefined ? C.primaryBorder : C.border}`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
              <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', lineHeight: '1.5', color: C.textDark }}>
                <span style={{ color: C.primary, marginRight: '8px' }}>#{idx + 1}</span>
                {q.question}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i
                  return (
                    <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}
                      style={{
                        padding: '12px 16px', borderRadius: R.sm, textAlign: 'left', cursor: 'pointer',
                        fontSize: '14px', border: '1px solid', fontWeight: selected ? 600 : 400,
                        borderColor: selected ? C.primary : C.border,
                        backgroundColor: selected ? C.primaryTint : C.bgLavenderSoft,
                        color: selected ? C.textDark : C.textMuted,
                        transition: 'all 0.15s',
                      }}>
                      <span style={{ color: selected ? C.primary : C.textTertiary, marginRight: '10px', fontWeight: 700 }}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'sticky', bottom: 0, backgroundColor: C.bgWhite, borderTop: `1px solid ${C.border}`, padding: '16px 0', marginTop: '32px' }}>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ width: '100%', padding: '14px', backgroundColor: submitting ? C.bgLavenderStrong : C.primary, color: submitting ? C.textMuted : 'white', border: 'none', borderRadius: R.sm, fontSize: '15px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Menghitung...' : `Submit Jawaban (${Object.keys(answers).length}/${questions.length} dijawab)`}
          </button>
        </div>
      </div>
    </div>
  )

  // ── RESULT ──
  if (!result) return null
  const passed = result.passed
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <Navbar />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(32px,6vw,60px) clamp(16px,4vw,32px) 80px' }}>

        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${passed ? C.success + '33' : STATUS_RED + '33'}`, borderRadius: R.md, padding: '36px', marginBottom: '24px', textAlign: 'center', boxShadow: theme.shadow.card }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            {passed
              ? <PartyPopper size={56} strokeWidth={1.5} color={C.success} />
              : <span style={{ fontSize: '56px' }}>😔</span>
            }
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', fontFamily: theme.fonts.headline, color: passed ? C.success : STATUS_RED }}>
            {passed ? 'Selamat, Kamu Lulus!' : 'Belum Lulus'}
          </h1>
          <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '24px' }}>
            {passed ? 'Trust Score kamu naik +5 poin!' : `Nilai minimum lulus: ${test.passing_score}. Kamu bisa coba lagi.`}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '40px', fontWeight: 800, color: passed ? C.success : STATUS_RED, fontFamily: theme.fonts.mono }}>{result.score}</div>
              <div style={{ fontSize: '12px', color: C.textMuted }}>Skor</div>
            </div>
            <div>
              <div style={{ fontSize: '40px', fontWeight: 800, color: C.textDark, fontFamily: theme.fonts.mono }}>{result.correctCount}/{questions.length}</div>
              <div style={{ fontSize: '12px', color: C.textMuted }}>Benar</div>
            </div>
            {passed && (
              <div>
                <div style={{ fontSize: '40px', fontWeight: 800, color: C.primary, fontFamily: theme.fonts.mono }}>+5</div>
                <div style={{ fontSize: '12px', color: C.textMuted }}>Trust Score</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/app/profil/skill-test" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: C.bgLavenderSoft, border: `1px solid ${C.border}`, color: C.textMuted, textDecoration: 'none', borderRadius: R.sm, fontSize: '13px', fontWeight: 600 }}>
              ← Semua Skill Test
            </a>
            <button onClick={() => { setPhase('quiz'); setAnswers({}); setResult(null) }}
              style={{ padding: '10px 20px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: R.sm, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Ulangi Tes
            </button>
            <a href="/app/profil" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: passed ? C.success : C.bgLavenderSoft, color: passed ? 'white' : C.textMuted, textDecoration: 'none', borderRadius: R.sm, fontSize: '13px', fontWeight: 600, border: passed ? 'none' : `1px solid ${C.border}` }}>
              Lihat Profil
            </a>
          </div>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: C.textDark }}>Pembahasan Jawaban</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questions.map((q, idx) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correct
            return (
              <div key={q.id} style={{ backgroundColor: C.bgWhite, border: `1px solid ${isCorrect ? C.success + '4D' : STATUS_RED + '4D'}`, borderRadius: R.sm, padding: '20px', boxShadow: theme.shadow.card }}>
                <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', lineHeight: '1.5', color: C.textDark }}>
                  <span style={{ color: isCorrect ? C.success : STATUS_RED, marginRight: '8px' }}>{isCorrect ? '✓' : '✗'}</span>
                  #{idx + 1}. {q.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {q.options.map((opt, i) => {
                    const isUserChoice = userAnswer === i
                    const isCorrectAns = q.correct === i
                    let bg = 'transparent', border = C.border, color = C.textMuted
                    if (isCorrectAns) { bg = C.successTint; border = C.success + '66'; color = C.success }
                    else if (isUserChoice && !isCorrectAns) { bg = STATUS_RED + '18'; border = STATUS_RED + '66'; color = STATUS_RED }
                    return (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: R.sm, fontSize: '13px', border: `1px solid ${border}`, backgroundColor: bg, color }}>
                        <span style={{ fontWeight: 700, marginRight: '8px' }}>{String.fromCharCode(65 + i)}.</span>
                        {opt}
                        {isCorrectAns && <span style={{ marginLeft: '8px', fontSize: '11px' }}>✓ Jawaban benar</span>}
                        {isUserChoice && !isCorrectAns && <span style={{ marginLeft: '8px', fontSize: '11px' }}>← Jawaban kamu</span>}
                      </div>
                    )
                  })}
                </div>
                {q.explanation && (
                  <div style={{ backgroundColor: C.primaryTint, border: `1px solid ${C.primaryBorder}`, borderRadius: R.sm, padding: '10px 12px', fontSize: '12px', color: C.textMuted, lineHeight: '1.6', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <Lightbulb size={12} strokeWidth={1.5} color={C.primary} style={{ flexShrink: 0, marginTop: '2px' }} />
                    {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
