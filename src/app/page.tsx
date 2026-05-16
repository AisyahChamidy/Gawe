'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ShieldCheck, Zap, Wallet, ArrowRight, CheckCircle2,
  Briefcase, Star, Lock, TrendingUp, Clock, ArrowUpRight
} from 'lucide-react'

function useCounter(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let t0: number | null = null
    const raf = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 4)) * target))
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [start, target, duration])
  return count
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); o.disconnect() } }, { threshold })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [threshold])
  return { ref, inView }
}

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = size * 0.37, c = 2 * Math.PI * r
  const off = c - (score / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F6EF7" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#g1)" strokeWidth="5"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)' }} />
      <text x={size/2} y={size/2+5} textAnchor="middle" fill="white" fontSize={size*0.22} fontWeight="800" fontFamily="Syne">{score}</text>
    </svg>
  )
}

const TICKER = [
  { cat: 'Desain', label: 'Logo Brand', price: 'Rp200rb' },
  { cat: 'Konten', label: 'Caption IG', price: 'Rp150rb' },
  { cat: 'Admin', label: 'Data Entry', price: 'Rp100rb' },
  { cat: 'Video', label: 'Edit Reels', price: 'Rp350rb' },
  { cat: 'Bahasa', label: 'Terjemahan', price: 'Rp180rb' },
  { cat: 'Web', label: 'Landing Page', price: 'Rp500rb' },
  { cat: 'Ilustrasi', label: 'Karakter Digital', price: 'Rp300rb' },
  { cat: 'Marketing', label: 'Kelola Sosmed', price: 'Rp400rb' },
]

export default function LandingPage() {
  const { ref: heroRef, inView: heroInView } = useInView(0.2)
  const trust = useCounter(87, 1800, heroInView)
  const projects = useCounter(100, 2000, heroInView)
  const members = useCounter(500, 2200, heroInView)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080f', color: 'white', fontFamily: "'Syne', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #05080f;
          --indigo: #4F6EF7;
          --violet: #8B5CF6;
          --cyan: #22D3EE;
          --green: #10D9A0;
          --glass: rgba(255,255,255,0.03);
          --glass-border: rgba(255,255,255,0.07);
          --text-muted: rgba(255,255,255,0.4);
          --text-secondary: rgba(255,255,255,0.65);
        }

        @keyframes ticker { to { transform: translateX(-50%); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blob { 0%,100% { border-radius:60% 40% 30% 70%/60% 30% 70% 40%; } 50% { border-radius:30% 60% 70% 40%/50% 60% 30% 60%; } }
        @keyframes glowPulse { 0%,100% { opacity:0.5; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.05); } }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .fade-up { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.15s; }
        .d3 { animation-delay: 0.25s; }
        .d4 { animation-delay: 0.38s; }
        .d5 { animation-delay: 0.5s; }

        .bento-card {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s ease, border-color 0.35s ease;
          overflow: hidden;
          position: relative;
        }
        .bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(16,217,160,0.04), transparent 40%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }
        .bento-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 0 0 1px rgba(16,217,160,0.2), 0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(16,217,160,0.06);
          border-color: rgba(16,217,160,0.2);
        }
        .bento-card:hover::before { opacity: 1; }

        .nav-pill {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 100px;
          transition: color 0.2s, background 0.2s;
          font-family: 'Instrument Sans', sans-serif;
        }
        .nav-pill:hover { color: white; background: rgba(255,255,255,0.06); }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, var(--indigo), var(--violet));
          color: white; text-decoration: none;
          padding: 14px 28px; border-radius: 100px;
          font-size: 14px; font-weight: 700;
          font-family: 'Instrument Sans', sans-serif;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 32px rgba(79,110,247,0.3);
          white-space: nowrap;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 48px rgba(79,110,247,0.45); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary); text-decoration: none;
          padding: 14px 28px; border-radius: 100px;
          font-size: 14px; font-weight: 600;
          font-family: 'Instrument Sans', sans-serif;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); color: white; }

        .shimmer-text {
          background: linear-gradient(90deg, var(--cyan) 0%, var(--green) 33%, var(--indigo) 66%, var(--cyan) 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .ticker-wrap { overflow: hidden; position: relative; }
        .ticker-track { display: flex; width: max-content; animation: ticker 28s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        padding: '0 40px',
        background: 'rgba(5,8,15,0.7)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <nav style={{ maxWidth: 1280, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 12px var(--green)' }} />
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>Gawe</span>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <a href="#cara-kerja" className="nav-pill">Cara Kerja</a>
            <Link href="/app/jelajah" className="nav-pill">Proyek</Link>
            <Link href="/auth/masuk" className="nav-pill">Masuk</Link>
            <Link href="/auth/daftar" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13, marginLeft: 8 }}>
              Daftar Gratis <ArrowRight size={14} />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ maxWidth: 1280, margin: '0 auto', padding: '120px 40px 80px', position: 'relative' }}>
        {/* Ambient blobs */}
        <div style={{
          position: 'absolute', top: '5%', left: '5%', width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(79,110,247,0.12) 0%, transparent 65%)',
          filter: 'blur(80px)', pointerEvents: 'none', animation: 'glowPulse 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '0%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(16,217,160,0.08) 0%, transparent 65%)',
          filter: 'blur(60px)', pointerEvents: 'none', animation: 'glowPulse 8s ease-in-out infinite reverse',
        }} />

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 440px', gap: 64, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <div className="fade-up d1" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(16,217,160,0.07)',
              border: '1px solid rgba(16,217,160,0.15)',
              borderRadius: 100, padding: '5px 14px',
              fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: 'var(--green)', marginBottom: 36,
              fontFamily: 'Instrument Sans',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
              Platform Freelance Pemula Indonesia
            </div>

            <h1 className="fade-up d2" style={{
              fontSize: 'clamp(52px, 6.5vw, 88px)',
              fontWeight: 800, lineHeight: 0.95,
              letterSpacing: '-4px', marginBottom: 32,
            }}>
              <span style={{ display: 'block', color: 'white' }}>Skill ada,</span>
              <span style={{ display: 'block' }} className="shimmer-text">klien belum ada?</span>
              <span style={{ display: 'block', color: 'white' }}>Yuk gawe bareng.</span>
            </h1>

            <p className="fade-up d3" style={{
              fontSize: 17, lineHeight: 1.75,
              color: 'var(--text-secondary)',
              maxWidth: 480, marginBottom: 40,
              fontFamily: 'Instrument Sans',
            }}>
              Gawe menggantikan portofolio dengan <strong style={{ color: 'white', fontWeight: 600 }}>Trust Score</strong> —
              sistem reputasi yang membuktikan kemampuanmu dari hari pertama,
              tanpa klien sebelumnya.
            </p>

            <div className="fade-up d4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/auth/daftar" className="btn-primary">
                Mulai Cari Kerja <ArrowRight size={15} />
              </Link>
              <Link href="/klien/post-proyek" className="btn-ghost">
                <Briefcase size={15} /> Post Proyek
              </Link>
            </div>

            {/* Social proof */}
            <div className="fade-up d5" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex' }}>
                {['#4F6EF7','#8B5CF6','#10D9A0','#22D3EE','#F59E0B'].map((c, i) => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: c, border: '2px solid #05080f',
                    marginLeft: i > 0 ? -10 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800,
                  }}>
                    {['R','S','D','A','F'][i]}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: 'Instrument Sans' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  <strong style={{ color: 'white' }}>{members}+</strong> freelancer pemula tervalidasi
                </span>
              </div>
            </div>
          </div>

          {/* Right — glass card */}
          <div className="fade-up d3 bento-card" style={{
            padding: 28,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 28,
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, var(--indigo), var(--green))',
              borderRadius: '28px 28px 0 0',
            }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'Instrument Sans' }}>
                Live Platform Stats
              </p>

              {/* Trust score */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 20, marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <ScoreRing score={trust} size={72} />
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'Instrument Sans' }}>Trust Score rata-rata</p>
                  <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
                    {trust}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 4, fontFamily: 'Instrument Sans' }}>↑ dari skill test + KYC</p>
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Proyek', value: `${projects}+`, icon: <Briefcase size={14} color="var(--indigo)" />, color: 'var(--indigo)' },
                  { label: 'Freelancer', value: `${members}+`, icon: <TrendingUp size={14} color="var(--green)" />, color: 'var(--green)' },
                  { label: 'Komisi', value: '10%', icon: <Wallet size={14} color="var(--violet)" />, color: 'var(--violet)' },
                  { label: 'Respon', value: '<2 jam', icon: <Clock size={14} color="var(--cyan)" />, color: 'var(--cyan)' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 12, padding: '14px 16px',
                  }}>
                    <div style={{ marginBottom: 8 }}>{s.icon}</div>
                    <p style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Instrument Sans' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Freelancer previews */}
              {[
                { name: 'Reza A.', role: 'UI Designer · Bandung', score: 82, color: 'var(--indigo)' },
                { name: 'Siti N.', role: 'Content Writer · Surabaya', score: 76, color: 'var(--violet)' },
              ].map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 12, marginBottom: 8,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: p.color, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                  }}>
                    {p.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Instrument Sans' }}>{p.role}</p>
                  </div>
                  <ScoreRing score={p.score} size={42} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '14px 0', background: 'rgba(255,255,255,0.015)', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(90deg, #05080f, transparent)', zIndex: 2 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(-90deg, #05080f, transparent)', zIndex: 2 }} />
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...TICKER,...TICKER,...TICKER].map((item, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '4px 28px', borderRight: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', background: 'rgba(16,217,160,0.08)', border: '1px solid rgba(16,217,160,0.12)', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.5px', fontFamily: 'Instrument Sans' }}>
                  {item.cat}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Instrument Sans' }}>{item.label}</span>
                <span style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 700, fontFamily: 'Instrument Sans' }}>{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BENTO FEATURES ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '140px 40px' }}>
        <div style={{ marginBottom: 80 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 16, fontFamily: 'Instrument Sans' }}>
            Kenapa Gawe?
          </p>
          <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-3px', lineHeight: 0.95, maxWidth: 700 }}>
            Dirancang untuk yang baru mulai.
          </h2>
        </div>

        {/* Bento Grid — asymmetric */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'auto', gap: 16 }}>

          {/* Card 1 — Trust Score (spans 5 cols, 2 rows) */}
          <div className="bento-card" style={{ gridColumn: 'span 5', gridRow: 'span 2', padding: 40, minHeight: 460 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(79,110,247,0.2), rgba(34,211,238,0.2))',
                border: '1px solid rgba(79,110,247,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
              }}>
                <ShieldCheck size={22} color="var(--indigo)" />
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--indigo)', marginBottom: 12, fontFamily: 'Instrument Sans' }}>
                Trust Score
              </p>
              <h3 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
                Reputasi dari hari pertama, tanpa portofolio.
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 36, fontFamily: 'Instrument Sans' }}>
                Skill test terverifikasi + KYC identitas = skor nyata yang bisa dilihat klien sebelum mereka hire.
              </p>

              {/* Score visualization */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
                <ScoreRing score={82} size={100} />
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'Instrument Sans' }}>Komponen skor</p>
                  {[
                    { label: 'Skill Test', val: 25, color: 'var(--indigo)' },
                    { label: 'KYC Verified', val: 20, color: 'var(--green)' },
                    { label: 'Profil Lengkap', val: 15, color: 'var(--violet)' },
                    { label: 'Respon Cepat', val: 10, color: 'var(--cyan)' },
                    { label: 'Proyek Selesai', val: 12, color: '#F59E0B' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${(s.val/30)*100}%`, height: '100%', background: s.color, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Instrument Sans', width: 60 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['KTP Verified', 'Skill Tested', 'Quick Responder'].map((tag, i) => (
                  <span key={i} style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100,
                    background: 'rgba(16,217,160,0.06)', border: '1px solid rgba(16,217,160,0.12)',
                    color: 'var(--green)', fontFamily: 'Instrument Sans',
                  }}>
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 — Jaminan Pembayaran (spans 4 cols) */}
          <div className="bento-card" style={{ gridColumn: 'span 4', padding: 36 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(16,217,160,0.1)', border: '1px solid rgba(16,217,160,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              }}>
                <Wallet size={20} color="var(--green)" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.2 }}>
                Jaminan Pembayaran Otomatis
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 20, fontFamily: 'Instrument Sans' }}>
                Dana klien masuk ke rekening bersama Gawe <em>sebelum</em> kamu mulai kerja. Bukan escrow yang rumit — ini sederhana dan aman.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Klien bayar dulu', 'Kamu kerja tenang', 'Dana cair otomatis'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Instrument Sans' }}>
                    <CheckCircle2 size={14} color="var(--green)" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3 — Komisi (spans 3 cols) */}
          <div className="bento-card" style={{ gridColumn: 'span 3', padding: 36, background: 'rgba(79,110,247,0.04)' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--indigo)', marginBottom: 16, fontFamily: 'Instrument Sans' }}>
                Komisi platform
              </p>
              <p style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-4px', lineHeight: 1, color: 'var(--indigo)', marginBottom: 8 }}>
                10<span style={{ fontSize: 32 }}>%</span>
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'Instrument Sans' }}>
                Sudah termasuk invoice otomatis, jaminan bayar, dan mediasi gratis.
              </p>
            </div>
          </div>

          {/* Card 4 — Proyek mikro (spans 4 cols) */}
          <div className="bento-card" style={{ gridColumn: 'span 4', padding: 36 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              }}>
                <Zap size={20} color="var(--violet)" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.2 }}>
                Proyek Mikro Mulai Rp100rb
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', fontFamily: 'Instrument Sans' }}>
                Sempurna untuk UMKM yang butuh hasil cepat, dan freelancer yang butuh pengalaman nyata.
              </p>
              <div style={{ marginTop: 20, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Logo', 'Caption', 'Data Entry', 'Edit Video', 'Terjemahan'].map((t, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 100,
                    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.12)',
                    color: 'var(--violet)', fontFamily: 'Instrument Sans', fontWeight: 600,
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 5 — Anti-zonk (spans 3 cols) */}
          <div className="bento-card" style={{ gridColumn: 'span 3', padding: 36, background: 'rgba(16,217,160,0.02)' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              }}>
                <Lock size={20} color="var(--cyan)" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.2 }}>
                Anti-Zonk untuk Klien
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', fontFamily: 'Instrument Sans' }}>
                Hire freelancer yang sudah lulus Skill Test, bukan yang cuma modal janji.
              </p>
            </div>
          </div>

          {/* Card 6 — CTA wide (spans 5 cols) */}
          <div className="bento-card" style={{
            gridColumn: 'span 5', padding: 40,
            background: 'linear-gradient(135deg, rgba(79,110,247,0.08), rgba(16,217,160,0.04))',
            border: '1px solid rgba(79,110,247,0.12)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12, lineHeight: 1.1 }}>
                Siap mulai?<br />
                <span className="shimmer-text">Daftar sekarang, gratis.</span>
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Instrument Sans' }}>
                Tidak perlu kartu kredit. Tidak perlu portofolio. Cukup semangat dan 2 menit untuk daftar.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/auth/daftar" className="btn-primary">
                  Mulai Sekarang <ArrowRight size={14} />
                </Link>
                <Link href="/app/jelajah" className="btn-ghost" style={{ padding: '12px 20px' }}>
                  Lihat Proyek <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '140px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div style={{ position: 'sticky', top: 100 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 16, fontFamily: 'Instrument Sans' }}>
                Cara Kerja
              </p>
              <h2 style={{ fontSize: 'clamp(40px, 4.5vw, 60px)', fontWeight: 800, letterSpacing: '-3px', lineHeight: 0.95, marginBottom: 24 }}>
                Dari daftar ke bayaran pertama.
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, fontFamily: 'Instrument Sans' }}>
                Tiga langkah yang jelas. Tanpa ribet, tanpa drama.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                {
                  num: '01', color: 'var(--indigo)', icon: <Star size={20} color="var(--indigo)" />,
                  title: 'Daftar & buktikan skillmu',
                  desc: 'Buat akun gratis dalam 2 menit. Ambil skill test dan verifikasi KTP. Trust Score-mu langsung terbentuk — bukti nyata yang bisa dilihat klien sebelum mereka hire.',
                  result: 'Dapat Trust Score tanpa portofolio sebelumnya.',
                },
                {
                  num: '02', color: 'var(--violet)', icon: <Zap size={20} color="var(--violet)" />,
                  title: 'Temukan & lamar proyek',
                  desc: 'Platform mencocokkan proyek berdasarkan skillmu. Lamar dengan satu klik — tidak perlu proposal panjang untuk mulai.',
                  result: 'Proyek mikro mulai Rp100rb, hasil nyata dalam hari.',
                },
                {
                  num: '03', color: 'var(--green)', icon: <Wallet size={20} color="var(--green)" />,
                  title: 'Kerjakan & terima bayaran',
                  desc: 'Dana sudah aman di Jaminan Pembayaran sebelum kamu mulai kerja. Klien approve, dana langsung masuk wallet.',
                  result: 'Bayaran 100% terjamin. Tidak ada risiko kerja sia-sia.',
                },
              ].map((step, i) => (
                <div key={i} className="bento-card" style={{ padding: 36, marginBottom: 0, borderRadius: 20 }}>
                  <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1 }}>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-3px', lineHeight: 1, color: step.color, opacity: 0.15, marginBottom: 8 }}>
                        {step.num}
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${step.color}15`, border: `1px solid ${step.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {step.icon}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 10 }}>{step.title}</h3>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 14, fontFamily: 'Instrument Sans' }}>{step.desc}</p>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 600, color: step.color,
                        background: `${step.color}08`,
                        border: `1px solid ${step.color}15`,
                        padding: '6px 12px', borderRadius: 8,
                        fontFamily: 'Instrument Sans',
                      }}>
                        → {step.result}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DUAL CTA ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '140px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-3px', lineHeight: 0.95 }}>
            Gawe untuk semua pihak.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            {
              tag: 'Untuk Freelancer', tagColor: 'var(--indigo)', tagBg: 'rgba(79,110,247,0.06)',
              topBar: 'linear-gradient(90deg, var(--indigo), var(--violet))',
              title: 'Kerjamu dihargai.\nDari proyek pertama.',
              desc: 'Tidak perlu portofolio. Tidak perlu bertahun-tahun pengalaman.',
              features: [
                'Trust Score menggantikan portofolio',
                'Komisi 10% — invoice + jaminan + mediasi',
                'Jaminan Pembayaran setiap proyek',
                'Dashboard cashflow real-time',
              ],
              cta: 'Mulai Cari Kerja',
              ctaHref: '/auth/daftar',
              ctaBg: 'linear-gradient(135deg, var(--indigo), var(--violet))',
              ctaColor: 'white',
              checkColor: 'var(--indigo)',
            },
            {
              tag: 'Untuk Klien & UMKM', tagColor: 'var(--green)', tagBg: 'rgba(16,217,160,0.06)',
              topBar: 'linear-gradient(90deg, var(--green), var(--cyan))',
              title: 'Hire yang sudah lulus\nSkill Test. Anti-zonk.',
              desc: 'Bukan yang cuma modal janji. Terverifikasi skill dan identitas.',
              features: [
                'Post proyek mikro mulai Rp100rb',
                'Freelancer sudah lulus Skill Test & KYC',
                'Bayar hanya setelah hasil disetujui',
                'Mediasi gratis jika ada perselisihan',
              ],
              cta: 'Post Proyek Sekarang',
              ctaHref: '/klien/post-proyek',
              ctaBg: 'linear-gradient(135deg, var(--green), var(--cyan))',
              ctaColor: '#05080f',
              checkColor: 'var(--green)',
            },
          ].map((card, i) => (
            <div key={i} className="bento-card" style={{ padding: 48 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: card.topBar, borderRadius: '24px 24px 0 0' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
                  color: card.tagColor, background: card.tagBg,
                  padding: '4px 12px', borderRadius: 100, display: 'inline-block', marginBottom: 28,
                  fontFamily: 'Instrument Sans',
                }}>
                  {card.tag}
                </span>
                <h3 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 14, lineHeight: 1.1, whiteSpace: 'pre-line' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Instrument Sans' }}>
                  {card.desc}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                  {card.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)', fontFamily: 'Instrument Sans' }}>
                      <CheckCircle2 size={15} color={card.checkColor} />
                      {f}
                    </div>
                  ))}
                </div>
                <Link href={card.ctaHref} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: card.ctaBg, color: card.ctaColor,
                  textDecoration: 'none', padding: '13px 24px', borderRadius: 100,
                  fontSize: 14, fontWeight: 700, fontFamily: 'Instrument Sans',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  {card.cta} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '160px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: 600, background: 'radial-gradient(ellipse, rgba(79,110,247,0.07) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '60%', left: '60%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(16,217,160,0.05) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(40px)' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 800, letterSpacing: '-4px', lineHeight: 0.92, marginBottom: 28 }}>
            Freelancer pertamamu<br />
            <span className="shimmer-text">menunggu di Gawe.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 52, maxWidth: 440, margin: '0 auto 52px', lineHeight: 1.7, fontFamily: 'Instrument Sans' }}>
            Gratis selamanya untuk daftar. Komisi hanya saat proyekmu selesai dan kamu sudah dibayar.
          </p>
          <Link href="/auth/daftar" className="btn-primary" style={{ padding: '18px 48px', fontSize: 17, borderRadius: 100 }}>
            Daftar Sekarang — Gratis <ArrowRight size={18} />
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 20, fontFamily: 'Instrument Sans' }}>
            Sudah punya akun?{' '}
            <Link href="/auth/masuk" style={{ color: 'var(--indigo)', textDecoration: 'none', fontWeight: 600 }}>Masuk di sini</Link>
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
          <span style={{ fontSize: 18, fontWeight: 800 }}>Gawe</span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Instrument Sans' }}>
          © 2026 Gawe — Platform freelance untuk pemula Indonesia
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Daftar', '/auth/daftar'], ['Proyek', '/app/jelajah'], ['Post Proyek', '/klien/post-proyek']].map(([l, h]) => (
            <Link key={l} href={h} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontFamily: 'Instrument Sans' }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}