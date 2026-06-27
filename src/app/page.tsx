'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react'
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion'
import {
  ShieldCheck, Rocket, CheckCircle,
  ChevronDown,
} from 'lucide-react'

// ── Design tokens ────────────────────────────────────────────────────────
const C = {
  bg: '#FFFFFF',
  bgAlt: '#F8F7FE',
  primary: '#534AB7',
  primaryTint: '#EEEDFE',
  primaryBorder: '#CECBF6',
  coral: '#D4537E',
  coralTint: '#FBEAF0',
  success: '#1D9E75',
  successTint: '#E1F5EE',
  text: '#26215C',
  textMuted: '#8A87A8',
  textTertiary: '#AFA9EC',
  border: '#EEEDFE',
  meshBase: '#0F0C2E',
}
const R = { sm: '8px', md: '14px', lg: '20px', pill: '24px' }
const SH = '0 8px 24px rgba(83,74,183,0.08)'
const SH_HOVER = '0 16px 40px rgba(83,74,183,0.14)'
const mesh = `
  radial-gradient(circle at 20% 30%, rgba(127,119,221,0.55) 0%, transparent 45%),
  radial-gradient(circle at 75% 20%, rgba(212,83,126,0.45) 0%, transparent 45%),
  radial-gradient(circle at 60% 75%, rgba(127,119,221,0.4) 0%, transparent 50%),
  radial-gradient(circle at 15% 85%, rgba(237,147,177,0.4) 0%, transparent 45%),
  radial-gradient(circle at 90% 60%, rgba(83,74,183,0.5) 0%, transparent 40%)
`
function toRgba(hex: string, a: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
const heroNoise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const fv = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
const hdrAnim = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
} as const

// ── AnimatedNumber ───────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 })
  const inView = useInView(ref, { once: true, margin: '-80px' })
  useEffect(() => { if (inView) motionVal.set(value) }, [inView, value, motionVal])
  useEffect(() => spring.on('change', v => { if (ref.current) ref.current.textContent = Math.round(v) + suffix }), [spring, suffix])
  return <span ref={ref}>0{suffix}</span>
}

// ── TrustRing ────────────────────────────────────────────────────────────
function TrustRing({ score, size = 80, animate = false }: { score: number; size?: number; animate?: boolean }) {
  const [cur, setCur] = useState(animate ? 0 : score)
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-60px' })
  useEffect(() => {
    if (!animate || !inView) return
    let start: number | null = null
    const tick = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1600, 1)
      setCur(Math.round((1 - Math.pow(1 - p, 3)) * score))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, animate, score])
  const r = size * 0.38, circ = 2 * Math.PI * r
  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.primaryBorder} strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.primary} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={circ - (cur / 100) * circ} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
      <text x={size / 2} y={size / 2 + size * 0.09} textAnchor="middle" fill={C.text}
        fontSize={size * 0.26} fontWeight="700" fontFamily="'Geist Mono',monospace">{cur}</text>
    </svg>
  )
}

// ── TiltCard ─────────────────────────────────────────────────────────────
function TiltCard({ children, style, className }: { children: ReactNode, style?: CSSProperties, className?: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={className}
      style={{
        ...style,
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) ${hovered ? 'scale(1.02)' : 'scale(1)'}`,
        transition: 'transform 0.15s ease-out, box-shadow 0.25s ease',
        boxShadow: hovered
          ? '0 20px 48px rgba(83,74,183,0.16)'
          : (style?.boxShadow ?? '0 8px 24px rgba(83,74,183,0.06)'),
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        setTilt({ x: x * 8, y: y * -8 })
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false) }}
    >
      {children}
    </div>
  )
}

// ── FloatingCard ─────────────────────────────────────────────────────────
function FloatingCard({ children, position, className }: {
  children: ReactNode
  className?: string
  position: { left?: number; right?: number; top?: number; bottom?: number }
}) {
  return (
    <div className={className} style={{
      position: 'absolute', ...position,
      background: 'rgba(255,255,255,0.92)', borderRadius: R.md,
      padding: '14px 18px', backdropFilter: 'blur(8px)',
    }}>
      {children}
    </div>
  )
}

// ── HeroSection ──────────────────────────────────────────────────────────
const TYPEWRITER_SUFFIX = ' bantu itu.'
function HeroSection() {
  const [typed, setTyped] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [cursorOn, setCursorOn] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)

  useEffect(() => {
    const start = setTimeout(() => {
      let i = 0
      const tick = setInterval(() => {
        i++
        setTyped(TYPEWRITER_SUFFIX.slice(0, i))
        if (i === TYPEWRITER_SUFFIX.length) {
          clearInterval(tick)
          setTypingDone(true)
          setCursorOn(true)
        }
      }, 70)
      return () => clearInterval(tick)
    }, 1000)
    return () => clearTimeout(start)
  }, [])

  useEffect(() => {
    if (!typingDone) return
    const blink = setInterval(() => setCursorOn(v => !v), 530)
    return () => clearInterval(blink)
  }, [typingDone])

  useEffect(() => {
    const cycle = setInterval(() => setCardIndex(v => (v + 1) % 3), 7000)
    return () => clearInterval(cycle)
  }, [])

  return (
    <section style={{ background: `radial-gradient(ellipse at 80% 20%, ${toRgba(C.primary, 0.10)} 0%, ${toRgba(C.primary, 0.04)} 45%, transparent 70%), radial-gradient(ellipse at 15% 80%, ${toRgba(C.primary, 0.06)} 0%, transparent 55%)`, padding: '120px 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundImage: heroNoise, backgroundRepeat: 'repeat', backgroundSize: '200px 200px', opacity: 0.025, pointerEvents: 'none' }} />
      <div className="hero-split" style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 72, alignItems: 'center' }}>

        {/* ── Kolom kiri ── */}
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
            <div style={{ display: 'inline-block', background: C.primaryTint, color: C.text, fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: R.pill, marginBottom: 24 }}>
              500+ freelancer bergabung minggu ini
            </div>
          </motion.div>
          <h1 style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontWeight: 700, fontSize: 52, lineHeight: 1.12, color: C.text, margin: '0 0 20px', letterSpacing: '-0.5px' }}>
            <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>Skill ada.</motion.span>
            <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>Klien belum ada.</motion.span>
            <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <span style={{ color: C.primary }}>Gawe</span>{typed}<span style={{ display: 'inline-block', opacity: cursorOn ? 1 : 0, color: C.primary, fontWeight: 300 }}>|</span>
            </motion.span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}
            style={{ fontSize: 16, color: C.textMuted, marginBottom: 32, lineHeight: 1.6 }}>
            Trust Score, escrow protection, dan proyek mikro yang dirancang khusus untuk freelancer pemula Indonesia — tanpa portofolio pun bisa mulai.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.65 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/auth/daftar"
              style={{ background: C.primary, color: C.primaryTint, padding: '13px 28px', borderRadius: R.pill, fontWeight: 500, fontSize: 14, textDecoration: 'none', transition: 'transform 0.15s ease', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              Mulai Gawe Sekarang
            </a>
            <a href="/auth/daftar"
              style={{ background: 'transparent', color: C.text, border: `0.5px solid ${C.primaryBorder}`, padding: '13px 28px', borderRadius: R.pill, fontWeight: 500, fontSize: 14, textDecoration: 'none', transition: 'transform 0.15s ease', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              Posting proyek
            </a>
          </motion.div>
        </div>

        {/* ── Kolom kanan — cycling cards ── */}
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={cardIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {cardIndex === 0 && (
                /* Card A — Trust Score */
                <div style={{ background: C.bg, border: `1px solid ${C.primaryBorder}`, borderRadius: R.lg, padding: 40, boxShadow: SH_HOVER }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Profil Freelancer</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Rizky Ananda</p>
                    </div>
                    <span style={{ background: C.primaryTint, color: C.primary, fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: R.sm }}>✓ Terverifikasi</span>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.textMuted }}>Trust Score</span>
                      <span style={{ fontSize: 32, fontWeight: 800, color: C.primary, lineHeight: 1 }}>82<span style={{ fontSize: 16, fontWeight: 500, color: C.textMuted }}>/100</span></span>
                    </div>
                    <div style={{ background: C.primaryTint, borderRadius: 6, height: 10 }}>
                      <div style={{ background: C.primary, width: '82%', height: 10, borderRadius: 6 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[['UI Design', '92'], ['Figma', '87']].map(([skill, score]) => (
                      <div key={skill} style={{ background: C.primaryTint, borderRadius: R.sm, padding: '10px 16px' }}>
                        <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>{skill}</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: C.primary, lineHeight: 1 }}>{score}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {cardIndex === 1 && (
                /* Card B — Project match */
                <div style={{ background: C.bg, border: `1px solid ${C.primaryBorder}`, borderRadius: R.lg, padding: 40, boxShadow: SH_HOVER }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.textMuted, marginBottom: 16 }}>Proyek Baru Untukmu</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1.25 }}>Redesain UI<br />Mobile App</p>
                    <span style={{ background: C.successTint, color: C.success, fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: R.sm, flexShrink: 0, marginLeft: 16 }}>95% cocok</span>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Budget</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: C.primary, lineHeight: 1 }}>Rp 800.000</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 13, color: C.textMuted }}>Deadline 7 hari · Remote · Trust Score min. 70</p>
                    <span style={{ background: C.primaryTint, color: C.primary, fontSize: 12, padding: '4px 10px', borderRadius: R.sm, marginLeft: 12, flexShrink: 0 }}>UI/UX Design</span>
                  </div>
                </div>
              )}
              {cardIndex === 2 && (
                /* Card C — Cashflow */
                <div style={{ background: C.bg, border: `1px solid ${C.primaryBorder}`, borderRadius: R.lg, padding: 40, boxShadow: SH_HOVER }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.textMuted, marginBottom: 8 }}>Pemasukan Bulan Ini</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 28 }}>
                    <span className="outfit" style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1 }}>Rp 3.250.000</span>
                    <span style={{ background: C.primaryTint, color: C.primary, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: R.sm, marginBottom: 3 }}>+12%</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 72 }}>
                    {[40, 55, 35, 70, 60, 82, 100].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: i < 5 ? C.primaryTint : C.primary, borderRadius: '4px 4px 0 0' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'].map(m => (
                      <span key={m} style={{ fontSize: 11, color: C.textMuted }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            {[0, 1, 2].map(i => (
              <button key={i} onClick={() => setCardIndex(i)} style={{
                width: i === cardIndex ? 28 : 8, height: 8, borderRadius: 4,
                background: i === cardIndex ? C.primary : C.primaryBorder,
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.4s ease, background 0.3s ease',
              }} />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────
const TICKER = [
  { cat: 'ILUSTRASI', task: 'Karakter Digital', price: 'Rp300rb' },
  { cat: 'MARKETING', task: 'Kelola Sosmed', price: 'Rp400rb' },
  { cat: 'DESAIN', task: 'Logo Brand', price: 'Rp200rb' },
  { cat: 'KONTEN', task: 'Caption IG', price: 'Rp150rb' },
  { cat: 'ADMIN', task: 'Data Entry', price: 'Rp100rb' },
  { cat: 'VIDEO', task: 'Edit Reels', price: 'Rp350rb' },
  { cat: 'WEB', task: 'Landing Page', price: 'Rp800rb' },
  { cat: 'FOTO', task: 'Edit Produk', price: 'Rp250rb' },
]

const STEPS_FL = [
  { title: 'Buat profil dalam 10 menit', desc: 'Ceritakan skill kamu, jam kerja, dan tipe proyek yang diinginkan. Platform langsung tahu proyek mana yang cocok.', hl: '> Profil langsung aktif dan terlihat klien.' },
  { title: 'Ambil skill test — 15 menit', desc: 'Buktikan kemampuanmu. Hasilnya jadi Trust Score yang langsung terlihat oleh klien. Tidak perlu pengalaman sebelumnya.', hl: '> Trust Score terbentuk hari itu juga.' },
  { title: 'Ambil proyek pertamamu', desc: 'Platform merekomendasikan proyek yang sesuai levelmu. Brief jelas, budget transparan.', hl: '> Proyek mikro mulai Rp100rb.' },
  { title: 'Selesai. Bayaran masuk. Ulangi.', desc: 'Invoice otomatis terkirim. Bayaran cair dalam 1×24 jam. Trust Score naik.', hl: 'Siap Mulai Gajian?' },
]

const STEPS_KL = [
  { title: 'Post proyek dalam 5 menit', desc: 'Isi brief yang terstruktur — sistem kami panduin kamu supaya brief-nya jelas dan tidak ambigu.', hl: '> Freelancer langsung apply dalam hitungan jam.' },
  { title: 'Pilih dari freelancer terverifikasi', desc: 'Lihat Trust Score, skill test nyata, dan review dari klien sebelumnya.', hl: '> Bukan profil kosong — ini bukti nyata.' },
  { title: 'Kerja sama dalam platform', desc: 'Komunikasi, revisi, dan pengiriman hasil — semua terpantau.', hl: '> Dana aman di escrow sampai kamu approve.' },
  { title: 'Approve dan selesai', desc: 'Beri review, bayaran otomatis cair ke freelancer. Proyek terdokumentasi rapi.', hl: '> Kalau tidak puas, ada mediasi gratis.' },
]

const FAQ = [
  { q: 'Kenapa 10%? Bukankah itu mahal?', a: 'Dibanding biaya iklan, waktu nunggu, atau proyek yang gagal bayar — 10% itu murah. Dan kamu tidak keluar uang sebelum proyek selesai.' },
  { q: 'Kapan komisinya bisa lebih kecil?', a: 'Semakin banyak proyek yang kamu selesaikan, komisimu turun bertahap. Ini cara kami menghargai yang aktif.' },
  { q: 'Bagaimana kalau klien tidak bayar?', a: 'Sistem kami memastikan dana klien dikonfirmasi sebelum kamu mulai kerja. Kalau ada sengketa, tim Gawe yang mediasi.' },
]

// ── Separator ─────────────────────────────────────────────────────────────
function PilarSeparator() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', marginBottom: 96 }}>
      <div style={{ height: '0.5px', background: `linear-gradient(90deg, transparent 0%, ${C.primaryBorder} 20%, ${C.primaryBorder} 80%, transparent 100%)` }} />
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [howTab, setHowTab] = useState<'freelancer' | 'klien'>('freelancer')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const [projectValue, setProjectValue] = useState(1000000)

  const finalCtaRef = useRef<HTMLElement>(null)
  const { scrollYProgress: ctaProgress } = useScroll({ target: finalCtaRef, offset: ['start end', 'center center'] })
  const ctaY = useTransform(ctaProgress, [0, 0.6], [50, 0])
  const ctaOpacity = useTransform(ctaProgress, [0, 0.5], [0, 1])
  const steps = howTab === 'freelancer' ? STEPS_FL : STEPS_KL

  // suppress unused warning — AnimatedNumber & TrustRing are helpers available for use
  void AnimatedNumber
  void TrustRing

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Work Sans',sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Work+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        h1,h2,h3,.outfit{font-family:'Outfit',sans-serif}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes glow-drift-left{from{transform:translateX(-20%)}to{transform:translateX(20%)}}
        @keyframes glow-drift-right{from{transform:translateX(20%)}to{transform:translateX(-20%)}}
        .cta-glow-l{animation:glow-drift-left 8s ease-in-out infinite alternate}
        .cta-glow-r{animation:glow-drift-right 8s ease-in-out infinite alternate}
        @media(max-width:768px){
          .nav-mid{display:none!important}
          .pain-grid,.momentum-grid,.komisi-grid,.dual-grid,.testi-grid,.footer-cols,.pilar-cols,.cara-kerja-grid,.hero-split{grid-template-columns:1fr!important}
          .hero-split{gap:40px!important}
        }
      `}</style>

      {/* 1 — NAV */}
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
            <span className="outfit" style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Gawe</span>
          </div>
          <nav className="nav-mid" style={{ display: 'flex', gap: 32 }}>
            {[['Cara Kerja', '#cara-kerja'], ['Proyek', '/proyek'], ['Untuk Bisnis', '#dual-cta']].map(([l, h]) => (
              <a key={l} href={h}
                style={{ fontSize: 14, color: C.textMuted, textDecoration: 'none', transition: 'color 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = C.primary }}
                onMouseLeave={e => { e.currentTarget.style.color = C.textMuted }}
              >{l}</a>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/auth/masuk" style={{ fontSize: 14, color: C.textMuted, textDecoration: 'none', marginRight: 16 }}>Masuk</Link>
            <Link href="/auth/daftar"
              style={{ background: C.primary, color: C.primaryTint, padding: '8px 20px', borderRadius: R.pill, fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'transform 0.15s ease, opacity 0.15s ease', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              Daftar Gratis →
            </Link>
          </div>
        </div>
      </motion.header>

      {/* 2 — HERO */}
      <HeroSection />

      {/* 3 — TICKER */}
      <div style={{ background: C.bg, borderTop: `0.5px solid ${C.border}`, borderBottom: `0.5px solid ${C.border}`, padding: '16px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'ticker 30s linear infinite' }}>
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 10, marginRight: 64 }}>
              <span style={{ fontWeight: 700, color: C.primary, fontSize: 11, letterSpacing: '1.5px' }}>{item.cat}</span>
              <span style={{ color: C.textMuted, fontSize: 14 }}>{item.task}</span>
              <span style={{ fontWeight: 600, color: C.primary, fontSize: 14 }}>{item.price}</span>
              <span style={{ color: C.primaryBorder, fontSize: 16 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* 5 — FEATURE SCROLL-SYNC */}
      <section style={{ background: C.bg, padding: '120px 0 120px' }}>
        <motion.div {...hdrAnim} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.primary, letterSpacing: '2px', marginBottom: 12, textTransform: 'uppercase' }}>Tiga Pilar Gawe</p>
          <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(36px, 3.8vw, 48px)', fontWeight: 700, color: C.text, letterSpacing: '-0.5px', maxWidth: 600 }}>
            Dirancang khusus agar pemula langsung kerja.
          </h2>
        </motion.div>

        <div className="pilar-cols" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, alignItems: 'stretch' }}>

          {/* Pilar 1 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <TiltCard style={{ background: C.meshBase, borderRadius: R.lg, padding: 32, flex: 1, display: 'flex', flexDirection: 'column', boxShadow: SH_HOVER }}>
              <span style={{ background: C.primary, color: C.primaryTint, fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: R.sm, display: 'inline-block', marginBottom: 20 }}>01 — Trust from Zero</span>
              <h3 className="outfit" style={{ fontSize: 22, fontWeight: 700, color: C.bg, marginBottom: 12, lineHeight: 1.3 }}>Buktikan kemampuan tanpa portofolio</h3>
              <p style={{ fontSize: 14, color: C.textTertiary, lineHeight: 1.7, marginBottom: 16 }}>
                Skill test 15 menit + verifikasi KTP membangun Trust Score 0–100 yang langsung terlihat klien.
              </p>
              {['Skill test per kategori, hasil instan', "Badge 'Identitas terverifikasi'", 'Trust Score tampil besar di profil'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: C.textTertiary }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.primaryTint, flexShrink: 0 }} />{s}
                </div>
              ))}
              <div style={{ flex: 1, minHeight: 24 }} />
              <TiltCard style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.md, padding: 20, boxShadow: SH }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Profil Rizky Ananda</span>
                  <span style={{ background: C.primaryTint, color: C.primary, fontSize: 10, padding: '3px 8px', borderRadius: R.sm }}>✓ Terverifikasi</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.textMuted }}>Trust Score</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.primary }}>82/100</span>
                  </div>
                  <div style={{ background: C.primaryTint, borderRadius: 4, height: 5 }}>
                    <div style={{ background: C.primary, width: '82%', height: 5, borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['UI Design 92', 'Figma 87'].map(t => (
                    <span key={t} style={{ background: C.primaryTint, color: C.primary, fontSize: 11, padding: '3px 8px', borderRadius: R.sm }}>{t}</span>
                  ))}
                </div>
              </TiltCard>
            </TiltCard>
          </motion.div>

          {/* Pilar 2 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <TiltCard style={{ background: C.meshBase, borderRadius: R.lg, padding: 32, flex: 1, display: 'flex', flexDirection: 'column', boxShadow: SH_HOVER }}>
              <span style={{ background: C.primary, color: C.primaryTint, fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: R.sm, display: 'inline-block', marginBottom: 20 }}>02 — Micro-project Marketplace</span>
              <h3 className="outfit" style={{ fontSize: 22, fontWeight: 700, color: C.bg, marginBottom: 12, lineHeight: 1.3 }}>Proyek kecil, langkah besar</h3>
              <p style={{ fontSize: 14, color: C.textTertiary, lineHeight: 1.7, marginBottom: 16 }}>
                Proyek Rp 100rb–5jt yang dikurasi khusus untuk membangun reputasi tanpa risiko besar.
              </p>
              {['Smart matching by skill & trust score', 'Escrow protection di setiap transaksi', 'Review otomatis tiap proyek selesai'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: C.textTertiary }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.primaryTint, flexShrink: 0 }} />{s}
                </div>
              ))}
              <div style={{ flex: 1, minHeight: 24 }} />
              <TiltCard style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.md, padding: 20, boxShadow: SH }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 12 }}>Proyek mikro tersedia</p>
                {[['Desain logo UMKM', 'Rp 350rb'], ['Konten Instagram 1 bulan', 'Rp 800rb'], ['Landing page sederhana', 'Rp 1,2jt']].map(([n, p], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? `0.5px solid ${C.border}` : 'none', fontSize: 13 }}>
                    <span style={{ color: C.text }}>{n}</span>
                    <span style={{ color: C.primary, fontWeight: 600 }}>{p}</span>
                  </div>
                ))}
              </TiltCard>
            </TiltCard>
          </motion.div>

          {/* Pilar 3 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <TiltCard style={{ background: C.meshBase, borderRadius: R.lg, padding: 32, flex: 1, display: 'flex', flexDirection: 'column', boxShadow: SH_HOVER }}>
              <span style={{ background: C.primary, color: C.primaryTint, fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: R.sm, display: 'inline-block', marginBottom: 20 }}>03 — Cashflow Clarity</span>
              <h3 className="outfit" style={{ fontSize: 22, fontWeight: 700, color: C.bg, marginBottom: 12, lineHeight: 1.3 }}>Tahu uangmu ke mana</h3>
              <p style={{ fontSize: 14, color: C.textTertiary, lineHeight: 1.7, marginBottom: 16 }}>
                Dashboard cashflow dengan proyeksi 30/60/90 hari berdasarkan proyek aktif.
              </p>
              {['Chart pemasukan 6 bulan', 'Proyeksi pendapatan ke depan', 'Riwayat transaksi lengkap'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: C.textTertiary }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.primaryTint, flexShrink: 0 }} />{s}
                </div>
              ))}
              <div style={{ flex: 1, minHeight: 24 }} />
              <TiltCard style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.md, padding: 20, boxShadow: SH }}>
                <p style={{ fontSize: 11, color: C.textTertiary, marginBottom: 4 }}>Pemasukan bulan ini</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span className="outfit" style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Rp 3.250.000</span>
                  <span style={{ background: C.primaryTint, color: C.primary, fontSize: 10, padding: '2px 6px', borderRadius: R.sm }}>+12%</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 48 }}>
                  {[40, 55, 35, 70, 60, 100].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: i < 4 ? C.primaryTint : C.primary, borderRadius: '4px 4px 0 0' }} />
                  ))}
                </div>
              </TiltCard>
            </TiltCard>
          </motion.div>

        </div>
      </section>

      {/* 7 — HOW IT WORKS */}
      <section id="cara-kerja" style={{ background: C.bgAlt, padding: '120px 0 140px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <motion.div {...hdrAnim}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.primary, letterSpacing: '2px', marginBottom: 12, textTransform: 'uppercase' }}>Cara Kerja</p>
            <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(36px, 3.8vw, 48px)', fontWeight: 700, color: C.text, letterSpacing: '-0.5px', marginBottom: 12 }}>
              Daftar hari ini, gajian dalam hitungan hari.
            </h2>
            <p style={{ fontSize: 15, color: C.textMuted, marginBottom: 32 }}>Langkah yang jelas. Tanpa ribet, tanpa drama.</p>
          </motion.div>
          <div style={{ display: 'inline-flex', background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.pill, padding: 4, gap: 4, marginBottom: 48 }}>
            {(['freelancer', 'klien'] as const).map(tab => (
              <button key={tab} onClick={() => setHowTab(tab)} style={{
                borderRadius: R.pill, padding: '8px 24px', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', border: 'none', fontFamily: "'Work Sans',sans-serif",
                transition: 'all 0.2s',
                background: howTab === tab ? C.primary : 'transparent',
                color: howTab === tab ? C.primaryTint : C.textMuted,
              }}>
                {tab === 'freelancer' ? 'Freelancer' : 'Klien / UMKM'}
              </button>
            ))}
          </div>
          <div className="cara-kerja-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                position: 'relative', overflow: 'hidden',
                background: i === 3 ? C.text : C.primaryTint,
                border: i < 3 ? `0.5px solid ${C.primaryBorder}` : 'none',
                borderRadius: R.lg, padding: 32, boxShadow: SH,
              }}>
                <div style={{
                  position: 'absolute', right: 12, top: -16,
                  fontSize: 128, fontWeight: 800, lineHeight: 1,
                  color: i === 3 ? C.primaryTint : C.primaryBorder,
                  opacity: i === 3 ? 0.1 : 0.5,
                  fontFamily: "'Outfit',sans-serif",
                  pointerEvents: 'none', userSelect: 'none', zIndex: 0,
                }}>{i + 1}</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i === 3 ? C.primaryTint : C.primary,
                    color: i === 3 ? C.primary : C.primaryTint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 600, marginBottom: 20,
                  }}>{i + 1}</div>
                  <h3 className="outfit" style={{ fontSize: 18, fontWeight: 600, color: i === 3 ? C.bg : C.text, marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: i === 3 ? C.textTertiary : C.textMuted, lineHeight: 1.7, marginBottom: 16 }}>{step.desc}</p>
                  <span style={{
                    background: i === 3 ? C.primary : C.primaryTint,
                    color: i === 3 ? C.primaryTint : C.text,
                    fontSize: 12, fontWeight: 500, padding: '5px 14px',
                    borderRadius: R.pill, display: 'inline-block',
                    borderLeft: `2px solid ${i === 3 ? C.textTertiary : C.primary}`,
                  }}>{step.hl}</span>
                  {i === 3 && <p style={{ fontSize: 12, color: C.textTertiary, opacity: 0.6, marginTop: 8 }}>Tersedia: BCA · Mandiri · GoPay · OVO · DANA</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 — KOMISI */}
      <section style={{ background: C.primaryTint }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '160px 32px' }}>
          <motion.div {...hdrAnim} style={{ marginBottom: 48 }}>
            <span style={{ background: C.primaryTint, color: C.primary, fontSize: 13, fontWeight: 600, letterSpacing: '2px', padding: '5px 12px', borderRadius: R.sm, display: 'inline-block', marginBottom: 24, textTransform: 'uppercase' }}>Biaya Platform</span>
            <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(36px, 3.8vw, 48px)', fontWeight: 700, color: C.text, letterSpacing: '-0.5px', marginBottom: 16 }}>
              <>Gratis selamanya.<br />Potongan 10% hanya saat proyek beres.</>

            </h2>
            <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7 }}>
              Komisi 10% dipotong otomatis dari pembayaran saat proyek selesai. Tidak ada biaya bulanan, tidak ada biaya pendaftaran.
            </p>
          </motion.div>

          <div className="komisi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

            {/* Kolom kiri: dua card stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Card 1 — Gratis selamanya */}
              <div style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.lg, padding: 28, boxShadow: SH }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: '1px', marginBottom: 16, textTransform: 'uppercase' }}>Apa yang gratis selamanya</p>
                {['Buat profil dan skill test', 'Apply ke proyek & kirim proposal', 'Akses dashboard cashflow dasar', 'Generate invoice otomatis', 'Chat aman dengan klien', 'Review otomatis sistem'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: C.textMuted }}>
                    <CheckCircle size={16} strokeWidth={1.5} color={C.success} />{s}
                  </div>
                ))}
              </div>

              {/* Card 2 — Dark komisi 10% compact */}
              <div style={{ background: C.meshBase, borderRadius: R.lg, padding: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.textTertiary, letterSpacing: '1px', marginBottom: 12, textTransform: 'uppercase' }}>Komisi Platform</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                  <span className="outfit" style={{ fontSize: 40, fontWeight: 800, color: C.bg, lineHeight: 1 }}>10%</span>
                  <span style={{ fontSize: 14, color: C.textTertiary }}>dari nilai proyek</span>
                </div>
                <p style={{ fontSize: 13, color: C.textTertiary, lineHeight: 1.6, margin: 0 }}>
                  Dipotong otomatis saat proyek selesai. Tidak ada biaya bulanan, tidak ada biaya pendaftaran.
                </p>
              </div>

            </div>

            {/* Kolom kanan: kalkulator + FAQ */}
            <div style={{ minWidth: 0 }}>

              <div style={{ background: C.bg, border: `0.5px solid ${C.primaryBorder}`, borderRadius: R.lg, padding: 28, marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
                  Hitung sendiri
                </p>
                <input
                  type="range"
                  min={100000}
                  max={5000000}
                  step={50000}
                  value={projectValue}
                  onChange={(e) => setProjectValue(Number(e.target.value))}
                  style={{ width: '100%', marginBottom: 12, accentColor: C.primary }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
                  <span>Rp 100rb</span>
                  <span>Nilai proyek: Rp {projectValue.toLocaleString('id-ID')}</span>
                  <span>Rp 5jt</span>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>Dengan 10% itu, kamu dapat:</p>
                  <p style={{ fontSize: 32, fontWeight: 700, color: C.success, fontFamily: 'var(--font-playfair),Georgia,serif', marginBottom: 4 }}>
                    Rp {Math.round(projectValue * 0.9).toLocaleString('id-ID')} cair ke kamu
                  </p>
                  <p style={{ fontSize: 12, color: C.textMuted }}>
                    (Rp {Math.round(projectValue * 0.1).toLocaleString('id-ID')} untuk jaga keamanan transaksi ini)
                  </p>
                </div>
                <div style={{ background: C.bgAlt, borderRadius: R.md, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Escrow', desc: 'Dana ditahan aman sampai kamu selesai kerja' },
                    { label: 'Invoice otomatis', desc: 'Tidak perlu bikin manual, langsung jadi' },
                    { label: 'Mediasi gratis', desc: 'Kalau ada sengketa, tim Gawe bantu selesaikan' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: C.success, fontSize: 14, marginTop: 2 }}>✓</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{item.label}</p>
                        <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {FAQ.map((item, i) => {
                const isActive = openFaq === i
                return (
                  <div key={i} style={{
                    background: isActive ? C.bg : 'transparent',
                    border: isActive ? `1px solid ${C.primaryBorder}` : '1px solid transparent',
                    borderRadius: 12,
                    boxShadow: isActive ? SH : 'none',
                    padding: '16px 20px',
                    marginBottom: 8,
                    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                  }}>
                    <button onClick={() => setOpenFaq(isActive ? null : i)}
                      style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Work Sans',sans-serif", textAlign: 'left' }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{item.q}</span>
                      <ChevronDown size={16} color={C.textMuted} style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', flexShrink: 0, marginLeft: 12 }} />
                    </button>
                    <div style={{ maxHeight: isActive ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                      <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, marginTop: 8 }}>{item.a}</p>
                    </div>
                  </div>
                )
              })}

            </div>
          </div>
        </div>
      </section>

      {/* 9 — TESTIMONI */}
      <section style={{ background: C.bg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 32px 80px' }}>
          <motion.h2 {...hdrAnim} className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(36px, 3.8vw, 48px)', fontWeight: 700, color: C.text, letterSpacing: '-0.5px', marginBottom: 12 }}>Mereka juga pernah di posisimu.</motion.h2>
          <p style={{ fontSize: 13, fontWeight: 500, color: C.textMuted, letterSpacing: '0.5px', marginBottom: 48 }}>
            Bukan bintang lima generik — ini orang beneran, dengan masalah yang beneran.
          </p>
          <div className="testi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              { q: 'Saya daftar Senin sore, ambil skill test, dan Rabu pagi sudah dapat proyek pertama. Kecil, tapi dari situ portofolio saya mulai ada isinya.', init: 'R', iBg: C.primaryTint, iC: C.primary, name: 'Rizky A.', age: '23', detail: 'UI Designer · Bandung', badge: 'Trust Score 84', bBg: C.primaryTint, bC: C.primary },
              { q: 'Yang saya suka dari Gawe tuh dashboard cashflow-nya. Sebelumnya saya cuma bisa nebak-nebak bulan depan aman atau nggak. Sekarang ada proyeksinya.', init: 'D', iBg: C.coralTint, iC: C.coral, name: 'Dina M.', age: '29', detail: 'Content Writer · Jakarta', badge: '12 Proyek', bBg: C.successTint, bC: C.success },
              { q: 'Saya sudah tiga kali kena ghosting di platform lain. Di Gawe, freelancer yang saya pilih kasih update setiap hari dan hasilnya melampaui ekspektasi.', init: 'B', iBg: C.successTint, iC: C.success, name: 'Budi S.', age: '36', detail: 'Pemilik UMKM · Surabaya', badge: '', bBg: '', bC: '' },
              { q: 'Saya karyawan yang mau mulai side hustle. Gawe ada rate calculator-nya, proyeknya bisa dikerjain dalam 2–3 hari tanpa ganggu kerjaan utama.', init: 'S', iBg: C.bgAlt, iC: C.textMuted, name: 'Sari W.', age: '31', detail: 'Freelance Translator · Yogyakarta', badge: '', bBg: '', bC: '' },
            ].map((t, i) => (
              <TiltCard
                key={i}
                style={{
                  background: i === 2 ? C.meshBase : C.bg,
                  border: i === 2 ? '0.5px solid rgba(255,255,255,0.1)' : `0.5px solid ${C.border}`,
                  borderRadius: R.lg, padding: 28, boxShadow: SH,
                }}
              >
                <p style={{ fontSize: 15, fontStyle: 'italic', color: i === 2 ? C.bg : C.text, lineHeight: 1.7, marginBottom: 20, overflowWrap: 'break-word', wordBreak: 'break-word' }}>"{t.q}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.iBg, color: t.iC, border: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {t.init}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: i === 2 ? C.bg : C.text }}>{t.name}</span>
                      <span style={{ fontSize: 12, color: i === 2 ? C.textTertiary : C.textMuted }}>{t.age}</span>
                    </div>
                    <p style={{ fontSize: 12, color: i === 2 ? C.textTertiary : C.textMuted, marginTop: 2 }}>{t.detail}</p>
                  </div>
                  {t.badge && <span style={{ background: t.bBg, color: t.bC, fontSize: 11, padding: '3px 8px', borderRadius: R.sm, flexShrink: 0 }}>{t.badge}</span>}
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — DUAL CTA */}
      <section id="dual-cta" style={{ background: C.bgAlt }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '160px 32px' }}>
          <motion.h2 {...hdrAnim} className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(36px, 3.8vw, 48px)', fontWeight: 700, color: C.text, letterSpacing: '-0.5px', textAlign: 'center', marginBottom: 48 }}>
            Kamu tidak butuh pengalaman dulu.<br />Kamu butuh kesempatan pertama.
          </motion.h2>
          <div className="dual-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <TiltCard style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.lg, padding: 32, borderTop: `3px solid ${C.primary}`, boxShadow: SH }}>
              <span style={{ background: C.primaryTint, color: C.primary, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: R.sm, display: 'inline-block', marginBottom: 16, textTransform: 'uppercase' }}>Untuk Freelancer</span>
              <h3 className="outfit" style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 8 }}>Untuk freelancer pemula</h3>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 20, lineHeight: 1.6 }}>Skill ada, portofolio belum ada? Trust Score kamu dimulai dari hari ini — bukan dari proyek pertama.</p>
              {['Trust Score menggantikan portofolio', 'Komisi 10% — invoice + jaminan + mediasi', 'Jaminan Pembayaran setiap proyek', 'Dashboard cashflow real-time'].map((f, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.textMuted, marginBottom: 10 }}>
                  <CheckCircle size={14} strokeWidth={1.5} color={C.primary} />{f}
                </div>
              ))}
              <Link href="/auth/daftar"
                style={{ background: C.primary, color: C.primaryTint, borderRadius: R.pill, padding: '12px 24px', fontWeight: 500, fontSize: 14, textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 24, transition: 'transform 0.15s ease, opacity 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
                Mulai sebagai freelancer →
              </Link>
            </TiltCard>
            <TiltCard style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.lg, padding: 32, borderTop: `3px solid ${C.success}`, boxShadow: SH }}>
              <span style={{ background: C.successTint, color: C.success, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: R.sm, display: 'inline-block', marginBottom: 16, textTransform: 'uppercase' }}>Untuk Klien & UMKM</span>
              <h3 className="outfit" style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 8 }}>Untuk klien & UMKM</h3>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 20, lineHeight: 1.6 }}>Bingung cara bedain yang beneran bisa kerja dari yang cuma janji? Trust Score dan escrow kami yang seleksi.</p>
              {['Post proyek mulai Rp100rb', 'Freelancer lulus Skill Test & KYC', 'Bayar hanya setelah hasil disetujui', 'Mediasi gratis jika ada perselisihan'].map((f, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.textMuted, marginBottom: 10 }}>
                  <CheckCircle size={14} strokeWidth={1.5} color={C.success} />{f}
                </div>
              ))}
              <Link href="/auth/daftar"
                style={{ background: C.text, color: C.bg, borderRadius: R.pill, padding: '12px 24px', fontWeight: 500, fontSize: 14, textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 24, transition: 'transform 0.15s ease, opacity 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
                Post Proyek Sekarang →
              </Link>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* 11 — FINAL CTA */}
      <section ref={finalCtaRef} style={{ position: 'relative', overflow: 'hidden', background: C.meshBase, padding: '160px 32px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', bottom: '-20%', left: '-20%', background: mesh, filter: 'blur(40px)' }} />
        <div className="cta-glow-l" style={{ position: 'absolute', top: '-20%', right: '-20%', bottom: '-20%', left: '-20%', background: `radial-gradient(circle at 20% 35%, ${toRgba(C.primary, 0.5)} 0%, transparent 45%), radial-gradient(circle at 18% 70%, ${toRgba(C.primary, 0.35)} 0%, transparent 40%)`, filter: 'blur(50px)' }} />
        <div className="cta-glow-r" style={{ position: 'absolute', top: '-20%', right: '-20%', bottom: '-20%', left: '-20%', background: `radial-gradient(circle at 78% 25%, ${toRgba(C.coral, 0.45)} 0%, transparent 45%), radial-gradient(circle at 80% 70%, ${toRgba(C.coral, 0.3)} 0%, transparent 40%)`, filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'linear-gradient(180deg,rgba(15,12,46,0) 0%,rgba(15,12,46,0.3) 100%)' }} />
        <motion.div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', y: ctaY, opacity: ctaOpacity }}>
          <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 48, fontWeight: 700, color: C.bg, letterSpacing: '-0.5px', marginBottom: 0 }}>Gratis untuk daftar.</h2>
          <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 26, fontWeight: 500, color: C.primaryBorder, letterSpacing: '-0.5px', marginBottom: 20 }}>Bayar hanya kalau kamu sudah dapat bayaran.</h2>
          <p style={{ fontSize: 16, color: C.textTertiary, marginBottom: 40, lineHeight: 1.7 }}>
            Daftar sekarang. Tanpa kartu kredit. Kamu bisa mulai buat profil dalam 10 menit dan langsung terlihat oleh ratusan klien hari ini.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/daftar"
              style={{ background: C.bg, color: C.text, borderRadius: R.pill, padding: '14px 32px', fontWeight: 600, fontSize: 15, textDecoration: 'none', transition: 'transform 0.15s ease, opacity 0.15s ease', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              Yuk Mulai Gawe →
            </Link>
            <a href="/proyek"
              style={{ background: 'transparent', color: C.bg, border: '0.5px solid rgba(255,255,255,0.3)', borderRadius: R.pill, padding: '14px 32px', fontSize: 15, textDecoration: 'none', transition: 'transform 0.15s ease, opacity 0.15s ease', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              Cari freelancer
            </a>
          </div>
        </motion.div>
      </section>

      {/* 12 — FOOTER */}
      <footer style={{ background: C.text, padding: '48px 32px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
                <span className="outfit" style={{ fontSize: 18, fontWeight: 700, color: C.bg }}>Gawe.</span>
              </div>
              <p style={{ fontSize: 13, color: C.textTertiary, lineHeight: 1.7 }}>
                Platform freelance untuk yang baru mulai. Kami percaya setiap orang berhak dapat kesempatan pertama.
              </p>
            </div>
            {[
              { heading: 'PRODUK', links: [['Cara Kerja', '/cara-kerja'], ['Proyek', '/proyek'], ['Harga', '/harga']] },
              { heading: 'PERUSAHAAN', links: [['Tentang', '/tentang'], ['Kontak', '/kontak']] },
              { heading: 'LEGAL', links: [['Privasi', '/privasi'], ['Syarat & Ketentuan', '/syarat-ketentuan'], ['Keamanan', '/keamanan']] },
            ].map(col => (
              <div key={col.heading}>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.bg, letterSpacing: '1.5px', marginBottom: 16 }}>{col.heading}</p>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} style={{ fontSize: 13, color: C.textTertiary, display: 'block', marginBottom: 10, textDecoration: 'none' }}>{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>© 2026 Gawe · Dibuat dengan semangat di Indonesia 🇮🇣</span>
            <span style={{ fontSize: 12, color: C.textMuted }}>Instagram · LinkedIn · Twitter</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
