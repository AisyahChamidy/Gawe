'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

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
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat...</div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ padding: 'clamp(20px,5vw,40px) clamp(16px,4vw,32px)', maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <a href="/app/profil" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '13px' }}>← Kembali ke Profil</a>
          <h1 style={{ fontSize: '26px', fontWeight: '800', marginTop: '12px', marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>Skill Test</h1>
          <p style={{ color: '#8892a4', fontSize: '14px' }}>Buktikan kemampuanmu. Setiap tes yang lulus menambah +5 Trust Score.</p>
        </div>

        {tests.length === 0 ? (
          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#8892a4' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
            <p>Belum ada skill test tersedia. Cek lagi nanti!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tests.map(test => {
              const attempt = attempts[test.id]
              const qCount = Array.isArray(test.questions) ? test.questions.length : 0
              return (
                <div key={test.id} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ backgroundColor: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.2)', color: '#4F6EF7', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>
                          {test.category}
                        </span>
                        {attempt && (
                          attempt.passed ? (
                            <span style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', color: '#10B981', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
                              ✓ Lulus ({attempt.score}/100)
                            </span>
                          ) : (
                            <span style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
                              ✗ Tidak Lulus ({attempt.score}/100)
                            </span>
                          )
                        )}
                      </div>
                      <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>{test.title}</h2>
                      <p style={{ color: '#8892a4', fontSize: '13px', lineHeight: '1.6', marginBottom: '14px' }}>{test.description}</p>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#8892a4' }}>
                        <span>⏱ {test.duration_minutes} menit</span>
                        <span>📝 {qCount} soal</span>
                        <span>🎯 Nilai lulus: {test.passing_score}/100</span>
                        <span style={{ color: '#22D3EE', fontWeight: '600' }}>+5 Trust Score jika lulus</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <a href={`/app/profil/skill-test/${test.id}`} style={{
                        display: 'block', padding: '10px 20px', backgroundColor: attempt?.passed ? '#131929' : '#4F6EF7',
                        color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '13px',
                        fontWeight: '700', textAlign: 'center',
                        border: attempt?.passed ? '1px solid #1e2d4a' : 'none',
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

        <div style={{ marginTop: '32px', backgroundColor: '#131929', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '12px', padding: '20px 24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#22D3EE', marginBottom: '8px' }}>💡 Tentang Skill Test</h3>
          <p style={{ fontSize: '13px', color: '#8892a4', lineHeight: '1.7' }}>
            Setiap tes yang kamu lulus menambah <strong style={{ color: 'white' }}>+5 Trust Score</strong> ke profil-mu. Trust Score yang tinggi membuat profil-mu lebih menarik di mata klien dan meningkatkan peluang diterima proyek.
          </p>
        </div>
      </div>
    </div>
  )
}
