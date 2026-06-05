'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

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
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>
  )
  if (!test) return null

  const questions: Question[] = test.questions

  // ── INTRO ──
  if (phase === 'intro') return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(32px,6vw,60px) clamp(16px,4vw,32px)' }}>
        <a href="/app/profil/skill-test" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '13px' }}>← Semua Skill Test</a>
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '36px', marginTop: '20px' }}>
          <span style={{ backgroundColor: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.2)', color: '#4F6EF7', fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
            {test.category}
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '16px 0 12px', fontFamily: 'Outfit, sans-serif' }}>{test.title}</h1>
          <p style={{ color: '#8892a4', fontSize: '14px', lineHeight: '1.7', marginBottom: '28px' }}>{test.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '12px', marginBottom: '28px' }}>
            {[
              { icon: '📝', label: 'Jumlah Soal', value: `${questions.length} soal` },
              { icon: '⏱', label: 'Durasi', value: `${test.duration_minutes} menit` },
              { icon: '🎯', label: 'Nilai Lulus', value: `${test.passing_score}/100` },
              { icon: '⭐', label: 'Bonus Lulus', value: '+5 Trust Score' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '2px' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#8892a4' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.15)', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px', fontSize: '13px', color: '#8892a4', lineHeight: '1.6' }}>
            💡 Pilih satu jawaban untuk setiap soal. Kamu bisa mengubah jawaban sebelum submit. Hasil langsung tampil setelah submit.
          </div>

          <button onClick={() => setPhase('quiz')} style={{ width: '100%', padding: '14px', backgroundColor: '#4F6EF7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
            Mulai Tes →
          </button>
        </div>
      </div>
    </div>
  )

  // ── QUIZ ──
  if (phase === 'quiz') return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,32px) 80px' }}>

        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '14px', color: '#8892a4' }}>{test.title}</span>
          <span style={{ fontSize: '13px', color: '#4F6EF7', fontWeight: '600' }}>
            {Object.keys(answers).length}/{questions.length} dijawab
          </span>
        </div>
        <div style={{ width: '100%', height: '3px', backgroundColor: '#1e2d4a', borderRadius: '2px', marginBottom: '32px', overflow: 'hidden' }}>
          <div style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%`, height: '100%', backgroundColor: '#4F6EF7', borderRadius: '2px', transition: 'width 0.3s' }} />
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {questions.map((q, idx) => (
            <div key={q.id} style={{ backgroundColor: '#131929', border: `1px solid ${answers[q.id] !== undefined ? 'rgba(79,110,247,0.3)' : '#1e2d4a'}`, borderRadius: '12px', padding: '24px' }}>
              <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', lineHeight: '1.5' }}>
                <span style={{ color: '#4F6EF7', marginRight: '8px' }}>#{idx + 1}</span>
                {q.question}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i
                  return (
                    <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}
                      style={{
                        padding: '12px 16px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer',
                        fontSize: '14px', border: '1px solid', fontWeight: selected ? '600' : '400',
                        borderColor: selected ? '#4F6EF7' : '#1e2d4a',
                        backgroundColor: selected ? 'rgba(79,110,247,0.12)' : '#0A0E1A',
                        color: selected ? 'white' : 'rgba(255,255,255,0.7)',
                        transition: 'all 0.15s',
                      }}>
                      <span style={{ color: selected ? '#4F6EF7' : '#8892a4', marginRight: '10px', fontWeight: '700' }}>
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

        {/* Submit */}
        <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#0A0E1A', borderTop: '1px solid #1e2d4a', padding: '16px 0', marginTop: '32px' }}>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ width: '100%', padding: '14px', backgroundColor: submitting ? '#2a3a6a' : '#4F6EF7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer' }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(32px,6vw,60px) clamp(16px,4vw,32px) 80px' }}>

        {/* Result card */}
        <div style={{ backgroundColor: '#131929', border: `1px solid ${passed ? '#10B981' : '#EF4444'}`, borderRadius: '16px', padding: '36px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>{passed ? '🎉' : '😔'}</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', fontFamily: 'Outfit, sans-serif', color: passed ? '#10B981' : '#EF4444' }}>
            {passed ? 'Selamat, Kamu Lulus!' : 'Belum Lulus'}
          </h1>
          <p style={{ color: '#8892a4', fontSize: '14px', marginBottom: '24px' }}>
            {passed ? `Trust Score kamu naik +5 poin!` : `Nilai minimum lulus: ${test.passing_score}. Kamu bisa coba lagi.`}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '40px', fontWeight: '800', color: passed ? '#10B981' : '#EF4444', fontFamily: 'Outfit, sans-serif' }}>{result.score}</div>
              <div style={{ fontSize: '12px', color: '#8892a4' }}>Skor</div>
            </div>
            <div>
              <div style={{ fontSize: '40px', fontWeight: '800', color: 'white', fontFamily: 'Outfit, sans-serif' }}>{result.correctCount}/{questions.length}</div>
              <div style={{ fontSize: '12px', color: '#8892a4' }}>Benar</div>
            </div>
            {passed && (
              <div>
                <div style={{ fontSize: '40px', fontWeight: '800', color: '#22D3EE', fontFamily: 'Outfit, sans-serif' }}>+5</div>
                <div style={{ fontSize: '12px', color: '#8892a4' }}>Trust Score</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/app/profil/skill-test" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #1e2d4a', color: '#8892a4', textDecoration: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
              ← Semua Skill Test
            </a>
            <button onClick={() => { setPhase('quiz'); setAnswers({}); setResult(null) }}
              style={{ padding: '10px 20px', backgroundColor: '#4F6EF7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              Ulangi Tes
            </button>
            <a href="/app/profil" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: passed ? '#10B981' : 'transparent', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: passed ? 'none' : '1px solid #1e2d4a' }}>
              Lihat Profil
            </a>
          </div>
        </div>

        {/* Pembahasan */}
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Pembahasan Jawaban</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questions.map((q, idx) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correct
            return (
              <div key={q.id} style={{ backgroundColor: '#131929', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '10px', padding: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', lineHeight: '1.5' }}>
                  <span style={{ color: isCorrect ? '#10B981' : '#EF4444', marginRight: '8px' }}>{isCorrect ? '✓' : '✗'}</span>
                  #{idx + 1}. {q.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {q.options.map((opt, i) => {
                    const isUserChoice = userAnswer === i
                    const isCorrectAns = q.correct === i
                    let bg = 'transparent', border = '#1e2d4a', color = 'rgba(255,255,255,0.5)'
                    if (isCorrectAns) { bg = 'rgba(16,185,129,0.1)'; border = '#10B981'; color = '#10B981' }
                    else if (isUserChoice && !isCorrectAns) { bg = 'rgba(239,68,68,0.1)'; border = '#EF4444'; color = '#EF4444' }
                    return (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', border: `1px solid ${border}`, backgroundColor: bg, color }}>
                        <span style={{ fontWeight: '700', marginRight: '8px' }}>{String.fromCharCode(65 + i)}.</span>
                        {opt}
                        {isCorrectAns && <span style={{ marginLeft: '8px', fontSize: '11px' }}>✓ Jawaban benar</span>}
                        {isUserChoice && !isCorrectAns && <span style={{ marginLeft: '8px', fontSize: '11px' }}>← Jawaban kamu</span>}
                      </div>
                    )
                  })}
                </div>
                {q.explanation && (
                  <div style={{ backgroundColor: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.15)', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: '#8892a4', lineHeight: '1.6' }}>
                    💡 {q.explanation}
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
