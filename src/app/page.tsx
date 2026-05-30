'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import {
  ShieldCheck, Zap, Wallet, ArrowRight, CheckCircle2,
  Briefcase, ArrowUpRight, TrendingUp, Clock, Lock,
  ChevronRight, Star
} from 'lucide-react'

// ── Animated number ────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 })
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (inView) motionVal.set(value)
  }, [inView, value, motionVal])

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix
    })
  }, [spring, suffix])

  return <span ref={ref}>0{suffix}</span>
}

// ── Trust Score Ring ───────────────────────────────────────────────────
function TrustRing({ score, size = 80, animate = false }: { score: number; size?: number; animate?: boolean }) {
  const [current, setCurrent] = useState(animate ? 0 : score)
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref as any, { once: true, margin: '-60px' })

  useEffect(() => {
    if (!animate || !inView) return
    let start: number | null = null
    const duration = 1600
    const raf = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCurrent(Math.round(eased * score))
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [inView, animate, score])

  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const offset = circ - (current / 100) * circ

  const color = current >= 80 ? '#22D3EE' : current >= 60 ? '#4F6EF7' : '#8B5CF6'

  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.5s ease' }}
      />
      <text
        x={size/2} y={size/2 + size*0.09}
        textAnchor="middle" fill="white"
        fontSize={size * 0.26} fontWeight="700"
        fontFamily="'Geist Mono', 'Courier New', monospace"
      >
        {current}
      </text>
    </svg>
  )
}

const TICKER = [
  { cat: 'Desain', label: 'Logo Brand', price: 'Rp200rb' },
  { cat: 'Konten', label: 'Caption IG', price: 'Rp150rb' },
  { cat: 'Admin', label: 'Data Entry', price: 'Rp100rb' },
  { cat: 'Video', label: 'Edit Reels', price: 'Rp350rb' },
  { cat: 'Bahasa', label: 'Terjemahan EN-ID', price: 'Rp180rb' },
  { cat: 'Web', label: 'Landing Page', price: 'Rp500rb' },
  { cat: 'Ilustrasi', label: 'Karakter Digital', price: 'Rp300rb' },
  { cat: 'Marketing', label: 'Kelola Sosmed', price: 'Rp400rb' },
]

const STEPS = [
  {
    num: '01',
    icon: <Star size={18} strokeWidth={1.5} color="#4F6EF7" />,
    title: 'Daftar & buktikan skillmu',
    desc: 'Buat akun gratis. Ambil skill test 15 menit dan verifikasi KTP. Trust Score-mu langsung terbentuk — bukti nyata kemampuanmu yang bisa dilihat klien sebelum mereka hire kamu.',
    result: 'Dapat Trust Score tanpa portofolio sebelumnya.',
    color: '#4F6EF7',
  },
  {
    num: '02',
    icon: <Zap size={18} strokeWidth={1.5} color="#8B5CF6" />,
    title: 'Temukan & lamar proyek',
    desc: 'Platform mencocokkan proyek berdasarkan skill dan budget-mu. Lamar dengan satu klik — tidak perlu proposal bertele-tele untuk mulai.',
    result: 'Proyek mikro mulai Rp100rb, hasil nyata dalam hari.',
    color: '#8B5CF6',
  },
  {
    num: '03',
    icon: <Wallet size={18} strokeWidth={1.5} color="#22D3EE" />,
    title: 'Kerjakan & terima bayaran',
    desc: 'Dana sudah aman di Jaminan Pembayaran Gawe sebelum kamu mulai kerja. Klien approve, uang langsung masuk wallet. Sesimpel itu.',
    result: 'Bayaran 100% terjamin. Zero risiko kerja sia-sia.',
    color: '#22D3EE',
  },
]

const PROFILES = [
  { name: 'Reza A.', role: 'UI Designer', city: 'Bandung', score: 82, color: '#4F6EF7' },
  { name: 'Siti N.', role: 'Content Writer', city: 'Surabaya', score: 76, color: '#8B5CF6' },
  { name: 'Dimas F.', role: 'Web Dev', city: 'Jakarta', score: 91, color: '#22D3EE' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as any }
  }),
}

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0E1A',
      color: 'white',
      fontFamily: "'Work Sans', sans-serif",
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Work+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --navy:   #0A0E1A;
          --navy-2: #111827;
          --navy-3: #1a2235;
          --indigo: #4F6EF7;
          --violet: #8B5CF6;
          --cyan:   #22D3EE;
          --border: rgba(255,255,255,0.08);
          --muted:  rgba(255,255,255,0.38);
          --secondary: rgba(255,255,255,0.62);
        }

        @keyframes ticker { to { transform: translateX(-33.333%); } }
        @keyframes scanline {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        .ticker-track { animation: ticker 32s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }

        /* Outfit for headlines */
        h1, h2, h3, .outfit { font-family: 'Outfit', sans-serif; }
        /* Geist Mono fallback for data */
        .mono { font-family: 'Geist Mono', 'JetBrains Mono', 'Fira Code', 'Courier New', monospace; }

        .card {
          background: var(--navy-2);
          border: 1px solid var(--border);
          border-radius: 16px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .card:hover {
          border-color: rgba(79,110,247,0.25);
          box-shadow: 0 0 0 1px rgba(79,110,247,0.1), 0 20px 48px rgba(0,0,0,0.4);
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #4F6EF7;
          color: white; text-decoration: none;
          padding: 12px 24px; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          font-family: 'Work Sans', sans-serif;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
          letter-spacing: -0.1px;
        }
        .btn-primary:hover { background: #6380f8; transform: translateY(-1px); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--secondary); text-decoration: none;
          padding: 12px 24px; border-radius: 8px;
          font-size: 14px; font-weight: 500;
          font-family: 'Work Sans', sans-serif;
          transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .btn-outline:hover { border-color: rgba(255,255,255,0.2); color: white; }

        .nav-link {
          color: var(--muted); text-decoration: none;
          font-size: 14px; font-weight: 500;
          padding: 8px 14px; border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .nav-link:hover { color: white; background: rgba(255,255,255,0.05); }

        .tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.8px; text-transform: uppercase;
          padding: 4px 10px; border-radius: 4px;
          font-family: 'Work Sans', sans-serif;
        }

        .divider { border: none; border-top: 1px solid var(--border); margin: 0; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0A0E1A; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

        @media (max-width: 640px) {
          .nav-hide-mobile { display: none !important; }
          .nav-inner { padding: 0 16px !important; }
          .hero-section { padding: 56px 16px 40px !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-right { display: none !important; }
          .bento-section { padding: 60px 16px !important; }
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-grid > * { grid-column: 1 !important; grid-row: auto !important; }
          .how-section-inner { padding: 60px 16px !important; }
          .how-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .how-sticky { position: static !important; }
          .dual-cta-section { padding: 60px 16px !important; }
          .dual-cta-grid { grid-template-columns: 1fr !important; }
          .final-cta-inner { padding: 64px 16px !important; }
          .footer-inner { padding: 24px 16px !important; flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'sticky', top: 0, zIndex: 200,
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'rgba(10,14,26,0.88)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="nav-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22D3EE', boxShadow: '0 0 8px rgba(34,211,238,0.6)' }} />
            <span className="outfit" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>Gawe</span>
          </div>
          <nav style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <span className="nav-hide-mobile" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Link href="#cara-kerja" className="nav-link">Cara Kerja</Link>
              <Link href="/proyek" className="nav-link">Proyek</Link>
              <Link href="/auth/masuk" className="nav-link">Masuk</Link>
              <div style={{ width: 1, height: 20, backgroundColor: 'var(--border)', margin: '0 8px' }} />
            </span>
            <Link href="/auth/daftar" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              Daftar Gratis <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 32px 80px' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 64, alignItems: 'start' }}>

          {/* Left */}
          <div>
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={0}
              style={{ marginBottom: 32 }}
            >
              <span className="tag" style={{ background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.18)', color: '#4F6EF7' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#22D3EE', display: 'inline-block', boxShadow: '0 0 6px rgba(34,211,238,0.8)' }} />
                Platform Freelance untuk Pemula Indonesia
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="outfit"
              style={{
                fontSize: 'clamp(48px, 6vw, 80px)',
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: '-3.5px',
                marginBottom: 28,
              }}
            >
              <span style={{ display: 'block', color: 'white' }}>Skill ada,</span>
              <span style={{ display: 'block', color: '#22D3EE' }}>klien belum ada?</span>
              <span style={{ display: 'block', color: 'white' }}>Yuk gawe bareng.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--secondary)', maxWidth: 480, marginBottom: 36 }}
            >
              Gawe menggantikan portofolio dengan{' '}
              <strong style={{ color: 'white', fontWeight: 600 }}>Trust Score</strong>{' '}
              — sistem reputasi yang membuktikan kemampuanmu dari hari pertama,
              tanpa klien sebelumnya.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 52 }}
            >
              <Link href="/auth/daftar" className="btn-primary">
                Mulai Cari Kerja <ArrowRight size={14} strokeWidth={2} />
              </Link>
              <Link href="/klien/post-proyek" className="btn-outline">
                <Briefcase size={14} strokeWidth={1.5} /> Post Proyek
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, auto)',
                gap: '0', alignItems: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: 28,
              }}
            >
              {[
                { value: 500, suffix: '+', label: 'Freelancer tervalidasi' },
                { value: 100, suffix: '+', label: 'Proyek tersedia' },
                { value: 10, suffix: '%', label: 'Komisi platform saja' },
              ].map((stat, i) => (
                <div key={i} style={{
                  padding: '0 28px 0 0',
                  marginRight: 28,
                  borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                }}>
                  <p className="outfit mono" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-2px', color: 'white', lineHeight: 1, marginBottom: 4 }}>
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Trust Score Dashboard Card */}
          <motion.div
            className="hero-right"
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            <div className="card" style={{
              padding: 0,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            }}>
              {/* Card header — terminal style */}
              <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
                    <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: c }} />
                  ))}
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.5px' }}>
                  gawe://trust-score/dashboard
                </span>
                <div style={{ width: 60 }} />
              </div>

              {/* Main trust score */}
              <div style={{ padding: '28px 24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Trust Score
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: '#22D3EE', backgroundColor: 'rgba(34,211,238,0.08)', padding: '2px 8px', borderRadius: 4 }}>
                    LIVE
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, paddingTop: 4 }}>
                  <TrustRing score={87} size={88} animate />
                  <div>
                    <div className="mono" style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1, color: 'white', marginBottom: 4 }}>
                      87<span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 400 }}>/100</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#22D3EE' }}>↑ rata-rata platform</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>dari skill test + KYC + aktivitas</div>
                  </div>
                </div>

                {/* Score breakdown */}
                <div style={{ marginBottom: 20 }}>
                  {[
                    { label: 'Skill Test', score: 25, max: 25, color: '#4F6EF7' },
                    { label: 'Verifikasi KTP', score: 20, max: 20, color: '#22D3EE' },
                    { label: 'Proyek Selesai', score: 24, max: 30, color: '#8B5CF6' },
                    { label: 'Kelengkapan Profil', score: 10, max: 15, color: '#10B981' },
                    { label: 'Kecepatan Respon', score: 8, max: 10, color: '#F59E0B' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', width: 100, flexShrink: 0 }}>{item.label}</span>
                      <div style={{ flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.score / item.max) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                          style={{ height: '100%', backgroundColor: item.color, borderRadius: 1 }}
                        />
                      </div>
                      <span className="mono" style={{ fontSize: 10, color: 'white', width: 36, textAlign: 'right', flexShrink: 0 }}>
                        {item.score}/{item.max}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                  {[
                    { label: 'KTP Verified', color: '#22D3EE' },
                    { label: 'Skill Tested', color: '#4F6EF7' },
                    { label: 'Fast Responder', color: '#10B981' },
                  ].map((b, i) => (
                    <span key={i} style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                      color: b.color,
                      backgroundColor: `${b.color}10`,
                      border: `1px solid ${b.color}20`,
                      letterSpacing: '0.3px',
                    }}>
                      ✓ {b.label}
                    </span>
                  ))}
                </div>

                {/* Mini profiles */}
                <div style={{ marginBottom: 4 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>
                    Freelancer Terverifikasi
                  </p>
                  {PROFILES.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      marginBottom: 6,
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 6, backgroundColor: p.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                      }}>
                        {p.name[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{p.name}</p>
                        <p style={{ fontSize: 10, color: 'var(--muted)' }}>{p.role} · {p.city}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: p.score >= 80 ? '#22D3EE' : '#4F6EF7' }}>
                          {p.score}
                        </span>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '12px 0', overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(90deg, #0A0E1A, transparent)', zIndex: 2 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(-90deg, #0A0E1A, transparent)', zIndex: 2 }} />
        <div className="ticker-track" style={{ display: 'flex', width: 'max-content' }}>
          {[...TICKER, ...TICKER, ...TICKER].map((item, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '3px 24px', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#4F6EF7', backgroundColor: 'rgba(79,110,247,0.08)', padding: '2px 7px', borderRadius: 3, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {item.cat}
              </span>
              <span style={{ fontSize: 12, color: 'var(--secondary)' }}>{item.label}</span>
              <span className="mono" style={{ fontSize: 12, color: '#22D3EE', fontWeight: 600 }}>{item.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BENTO FEATURES ── */}
      <section className="bento-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 32px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 64 }}
        >
          <span className="tag" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)', color: '#22D3EE', marginBottom: 20, display: 'inline-flex' }}>
            Kenapa Gawe?
          </span>
          <h2 className="outfit" style={{ fontSize: 'clamp(36px, 4vw, 54px)', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.0, maxWidth: 600 }}>
            Dirancang untuk yang baru mulai.
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12 }}>

          {/* Trust Score — col 1-5, row 1-2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="card"
            style={{ gridColumn: 'span 5', gridRow: 'span 2', padding: 36 }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #4F6EF7, #22D3EE)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <ShieldCheck size={20} strokeWidth={1.5} color="#4F6EF7" />
              </div>
              <span className="tag" style={{ background: 'rgba(79,110,247,0.06)', color: '#4F6EF7', border: '1px solid rgba(79,110,247,0.12)', marginBottom: 16, display: 'inline-flex' }}>
                Trust Score System
              </span>
              <h3 className="outfit" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 14 }}>
                Reputasi dari hari pertama. Tanpa portofolio.
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--secondary)', marginBottom: 32 }}>
                Skill test terverifikasi + KYC identitas = skor nyata 0–100 yang bisa dilihat klien sebelum mereka hire. Bukan klaim, tapi angka yang bisa dipertanggungjawabkan.
              </p>

              <TrustRing score={82} size={96} animate />

              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Skill Test', detail: 'Lulus 87/100', color: '#4F6EF7' },
                  { label: 'Identitas', detail: 'KTP terverifikasi', color: '#22D3EE' },
                  { label: 'Respon', detail: 'Rata-rata 1.8 jam', color: '#10B981' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--secondary)', flex: 1 }}>{item.label}</span>
                    <span className="mono" style={{ fontSize: 11, color: item.color }}>{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Jaminan Bayar — col 6-9 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="card"
            style={{ gridColumn: 'span 4', padding: 28 }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Wallet size={18} strokeWidth={1.5} color="#22D3EE" />
              </div>
              <h3 className="outfit" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 10, lineHeight: 1.2 }}>
                Jaminan Pembayaran Otomatis
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--secondary)', marginBottom: 20 }}>
                Dana klien masuk ke rekening bersama Gawe <em>sebelum</em> kamu mulai kerja. Bukan escrow yang rumit — ini sederhana dan aman.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {['Klien bayar dulu', 'Kamu kerja tenang', 'Dana cair otomatis'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--secondary)' }}>
                    <CheckCircle2 size={13} strokeWidth={1.5} color="#22D3EE" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Komisi — col 10-12 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="card"
            style={{ gridColumn: 'span 3', padding: 28 }}
          >
            <div style={{ position: 'relative' }}>
              <span className="tag" style={{ background: 'rgba(79,110,247,0.06)', color: '#4F6EF7', border: '1px solid rgba(79,110,247,0.12)', marginBottom: 16, display: 'inline-flex' }}>
                Komisi
              </span>
              <div className="outfit mono" style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-4px', lineHeight: 1, color: 'white', marginBottom: 12 }}>
                10<span style={{ fontSize: 28, color: 'var(--muted)', fontWeight: 500 }}>%</span>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--secondary)' }}>
                Potongan 10%—bukan buat kita kaya, tapi buat mastiin pembayaranmu aman via Escrow dan urusan invoice beres otomatis.
              </p>
            </div>
          </motion.div>

          {/* Proyek mikro — col 6-8 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="card"
            style={{ gridColumn: 'span 4', padding: 28 }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Zap size={18} strokeWidth={1.5} color="#8B5CF6" />
              </div>
              <h3 className="outfit" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 10, lineHeight: 1.2 }}>
                Proyek Mikro<br />Mulai Rp100rb
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--secondary)', marginBottom: 16 }}>
                Sempurna untuk UMKM yang butuh hasil cepat, dan freelancer yang butuh pengalaman nyata.
              </p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {['Logo', 'Caption', 'Data Entry', 'Video', 'Terjemahan'].map((t, i) => (
                  <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, backgroundColor: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', color: '#8B5CF6', fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Anti-zonk — col 9-12 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="card"
            style={{ gridColumn: 'span 3', padding: 28 }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Lock size={18} strokeWidth={1.5} color="#10B981" />
              </div>
              <h3 className="outfit" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 10, lineHeight: 1.2 }}>
                Anti-Zonk<br />untuk Klien
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--secondary)' }}>
                Hire freelancer yang sudah lulus Skill Test. Bukan yang cuma modal janji.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <div className="how-section-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 32px' }}>
          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 80, alignItems: 'start' }}>
            <div className="how-sticky" style={{ position: 'sticky', top: 100 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="tag" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)', color: '#22D3EE', marginBottom: 20, display: 'inline-flex' }}>
                  Cara Kerja
                </span>
                <h2 className="outfit" style={{ fontSize: 'clamp(36px, 3.5vw, 50px)', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.0, marginBottom: 16 }}>
                  Dari daftar ke bayaran pertama.
                </h2>
                <p style={{ fontSize: 15, color: 'var(--secondary)', lineHeight: 1.7 }}>
                  Tiga langkah yang jelas. Tanpa ribet, tanpa drama.
                </p>
              </motion.div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="card"
                  style={{ padding: 28 }}
                >
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: step.color, borderRadius: '16px 0 0 16px' }} />
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ flexShrink: 0 }}>
                      <span className="outfit mono" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-3px', lineHeight: 1, color: step.color, opacity: 0.18, display: 'block', marginBottom: 8 }}>
                        {step.num}
                      </span>
                      <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: `${step.color}12`, border: `1px solid ${step.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {step.icon}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 className="outfit" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8 }}>{step.title}</h3>
                      <p style={{ fontSize: 14, color: 'var(--secondary)', lineHeight: 1.75, marginBottom: 14 }}>{step.desc}</p>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 12, fontWeight: 600, color: step.color,
                        backgroundColor: `${step.color}08`,
                        border: `1px solid ${step.color}15`,
                        padding: '5px 10px', borderRadius: 5,
                      }}>
                        <ChevronRight size={12} strokeWidth={2} />
                        {step.result}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DUAL CTA ── */}
      <section className="dual-cta-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 32px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <h2 className="outfit" style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.0 }}>
            Gawe untuk semua pihak.
          </h2>
        </motion.div>

        <div className="dual-cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            {
              tag: 'Untuk Freelancer', tagColor: '#4F6EF7', tagBg: 'rgba(79,110,247,0.06)', tagBorder: 'rgba(79,110,247,0.12)',
              topBar: '#4F6EF7',
              title: 'Kerjamu dihargai.\nDari proyek pertama.',
              desc: 'Tidak perlu portofolio. Tidak perlu bertahun-tahun pengalaman. Cukup skill dan 2 menit untuk daftar.',
              features: ['Trust Score menggantikan portofolio', 'Komisi 10% — invoice + jaminan + mediasi', 'Jaminan Pembayaran setiap proyek', 'Dashboard cashflow real-time'],
              cta: 'Mulai Cari Kerja', ctaHref: '/auth/daftar',
              ctaStyle: { background: '#4F6EF7', color: 'white' },
              checkColor: '#4F6EF7',
            },
            {
              tag: 'Untuk Klien & UMKM', tagColor: '#22D3EE', tagBg: 'rgba(34,211,238,0.06)', tagBorder: 'rgba(34,211,238,0.12)',
              topBar: '#22D3EE',
              title: 'Hire yang sudah lulus\nSkill Test. Anti-zonk.',
              desc: 'Bukan yang cuma modal janji. Setiap freelancer di Gawe sudah terverifikasi skill dan identitasnya.',
              features: ['Post proyek mulai Rp100rb', 'Freelancer lulus Skill Test & KYC', 'Bayar hanya setelah hasil disetujui', 'Mediasi gratis jika ada perselisihan'],
              cta: 'Post Proyek Sekarang', ctaHref: '/klien/post-proyek',
              ctaStyle: { background: '#22D3EE', color: '#0A0E1A' },
              checkColor: '#22D3EE',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="card"
              style={{ padding: 40 }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: card.topBar }} />
              <div style={{ position: 'relative' }}>
                <span className="tag" style={{ background: card.tagBg, color: card.tagColor, border: `1px solid ${card.tagBorder}`, marginBottom: 24, display: 'inline-flex' }}>
                  {card.tag}
                </span>
                <h3 className="outfit" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12, lineHeight: 1.1, whiteSpace: 'pre-line' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--secondary)', lineHeight: 1.75, marginBottom: 24 }}>{card.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                  {card.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: 'rgba(255,255,255,0.72)' }}>
                      <CheckCircle2 size={13} strokeWidth={1.5} color={card.checkColor} />
                      {f}
                    </div>
                  ))}
                </div>
                <Link href={card.ctaHref} className="btn-primary" style={{ ...card.ctaStyle }}>
                  {card.cta} <ArrowRight size={13} strokeWidth={2} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ borderTop: '1px solid var(--border)' }}>
        <div className="final-cta-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '140px 32px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="outfit" style={{ fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 900, letterSpacing: '-4px', lineHeight: 0.95, marginBottom: 24 }}>
            Freelancer pertamamu<br />
            <span style={{ color: '#22D3EE' }}>menunggu di Gawe.</span>
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: 17, marginBottom: 44, maxWidth: 420, margin: '0 auto 44px', lineHeight: 1.7 }}>
            Gratis selamanya untuk daftar. Komisi hanya saat proyekmu selesai dan kamu sudah dibayar.
          </p>
          <Link href="/auth/daftar" className="btn-primary" style={{ padding: '15px 40px', fontSize: 16 }}>
            Daftar Sekarang — Gratis <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 16 }}>
            Sudah punya akun?{' '}
            <Link href="/auth/masuk" style={{ color: '#4F6EF7', textDecoration: 'none', fontWeight: 600 }}>Masuk di sini</Link>
          </p>
        </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)' }}>
      <div className="footer-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22D3EE' }} />
          <span className="outfit" style={{ fontSize: 16, fontWeight: 800 }}>Gawe</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>© 2026 Gawe — Platform freelance untuk pemula Indonesia</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Daftar', '/auth/daftar'], ['Proyek', '/app/jelajah'], ['Post Proyek', '/klien/post-proyek']].map(([l, h]) => (
            <Link key={l} href={h} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 13 }}>{l}</Link>
          ))}
        </div>
      </div>
      </footer>
    </div>
  )
}