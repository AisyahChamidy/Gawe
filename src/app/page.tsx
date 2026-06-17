'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import {
  ShieldCheck, Rocket, CheckCircle,
  ChevronDown, ChevronLeft, ChevronRight,
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
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const fv = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }

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
function TiltCard({ children, style }: { children: ReactNode, style?: CSSProperties }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  return (
    <div
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
function FloatingCard({ children, position }: {
  children: ReactNode
  position: { left?: number; right?: number; top?: number; bottom?: number }
}) {
  return (
    <div style={{
      position: 'absolute', ...position,
      background: 'rgba(255,255,255,0.92)', borderRadius: R.md,
      padding: '14px 18px', backdropFilter: 'blur(8px)',
    }}>
      {children}
    </div>
  )
}

// ── HeroSection ──────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{ background: C.bg, padding: '64px 24px 80px', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', background: C.primaryTint, color: C.text, fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: R.pill, marginBottom: 20 }}>
        Skor 0 hari ini, proyek pertama minggu ini
      </div>
      <h1 style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontWeight: 700, fontSize: 46, lineHeight: 1.15, color: C.text, margin: '0 0 16px', letterSpacing: '-0.5px' }}>
        Skill ada.<br />Klien belum ada.<br /><span style={{ color: C.primary }}>Gawe</span> bantu itu.
      </h1>
      <p style={{ fontSize: 16, color: C.textMuted, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
        Trust Score, escrow protection, dan proyek mikro yang dirancang khusus untuk freelancer pemula Indonesia — tanpa portofolio pun bisa mulai.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <a href="/auth/daftar"
          style={{ background: C.primary, color: C.primaryTint, padding: '13px 28px', borderRadius: R.pill, fontWeight: 500, fontSize: 14, textDecoration: 'none', transition: 'transform 0.15s ease, opacity 0.15s ease', display: 'inline-block' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
          Mulai sebagai freelancer
        </a>
        <a href="/auth/daftar"
          style={{ background: 'transparent', color: C.text, border: `0.5px solid ${C.primaryBorder}`, padding: '13px 28px', borderRadius: R.pill, fontWeight: 500, fontSize: 14, textDecoration: 'none', transition: 'transform 0.15s ease, opacity 0.15s ease', display: 'inline-block' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
          Posting proyek
        </a>
      </div>
      <div style={{ position: 'relative', height: 280, marginTop: 48, overflow: 'hidden', background: C.meshBase, borderRadius: R.lg, maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', bottom: '-20%', left: '-20%', background: mesh, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>Trust Score</div>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-playfair),Georgia,serif' }}>82</span>
          </div>
          <div style={{ width: 120, height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden', margin: '0 auto' }}>
            <div style={{ width: '82%', height: '100%', background: 'rgba(255,255,255,0.6)', borderRadius: 4 }} />
          </div>
        </div>
        <FloatingCard position={{ left: 24, top: 24 }}>
          <p style={{ fontSize: 11, color: C.textTertiary, margin: '0 0 4px' }}>Trust Score</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0 }}>82<span style={{ fontSize: 14, color: C.textTertiary }}>/100</span></p>
        </FloatingCard>
        <FloatingCard position={{ right: 24, top: 24 }}>
          <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={14} strokeWidth={1.5} color={C.success} />Skill test: 92/100
          </p>
        </FloatingCard>
        <FloatingCard position={{ left: 24, bottom: 24 }}>
          <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Rocket size={14} strokeWidth={1.5} color={C.primary} />3 proyek cocok untukmu
          </p>
        </FloatingCard>
        <FloatingCard position={{ right: 24, bottom: 24 }}>
          <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={14} strokeWidth={1.5} color={C.primary} />Escrow aman
          </p>
        </FloatingCard>
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
  { title: 'Selesai. Bayaran masuk. Ulangi.', desc: 'Invoice otomatis terkirim. Bayaran cair dalam 1×24 jam. Trust Score naik.', hl: '> Bayaran 100% terjamin.' },
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
      <div style={{ height: '0.5px', background: 'linear-gradient(90deg, transparent 0%, #CECBF6 20%, #CECBF6 80%, transparent 100%)' }} />
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [howTab, setHowTab] = useState<'freelancer' | 'klien'>('freelancer')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const [projectValue, setProjectValue] = useState(1000000)
  const testimoniScrollRef = useRef<HTMLDivElement>(null)
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
        .testimoni-scroll::-webkit-scrollbar{display:none}
        .testimoni-scroll{scrollbar-width:none}
        @media(max-width:768px){
          .nav-mid{display:none!important}
          .pain-grid,.pilar-grid,.momentum-grid,.komisi-grid,.dual-grid,.testi-grid,.footer-cols{grid-template-columns:1fr!important}
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
              <span style={{ fontWeight: 700, color: '#534AB7', fontSize: 11, letterSpacing: '1.5px' }}>{item.cat}</span>
              <span style={{ color: '#8A87A8', fontSize: 14 }}>{item.task}</span>
              <span style={{ fontWeight: 600, color: '#534AB7', fontSize: 14 }}>{item.price}</span>
              <span style={{ color: '#CECBF6', fontSize: 16 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* 5 — FEATURE SCROLL-SYNC */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={fv}
        style={{ background: C.bg, padding: '160px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', marginBottom: 80 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: '1.5px', marginBottom: 12, textTransform: 'uppercase' }}>Tiga Pilar Gawe</p>
          <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 36, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', maxWidth: 600 }}>
            Bukan cuma marketplace, tapi sistem yang berpihak ke pemula
          </h2>
        </div>

        {/* Pilar 1 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', marginBottom: 96 }}
        >
          <div className="pilar-grid" style={{ display: 'grid', gridTemplateColumns: '6fr 5fr', gap: 64, alignItems: 'center' }}>
            <div>
              <span style={{ background: C.primaryTint, color: C.primary, fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: R.sm, display: 'inline-block', marginBottom: 16 }}>01 — Trust from Zero</span>
              <h3 className="outfit" style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 12 }}>Buktikan kemampuan tanpa portofolio</h3>
              <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7, marginBottom: 20 }}>
                Skill test 15 menit + verifikasi KTP membangun Trust Score 0–100 yang langsung terlihat klien.
              </p>
              {['Skill test per kategori, hasil instan', "Badge 'Identitas terverifikasi'", 'Trust Score tampil besar di profil'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, color: C.textMuted }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, flexShrink: 0 }} />{s}
                </div>
              ))}
            </div>
            <TiltCard style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.lg, padding: 24, boxShadow: SH }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Profil Rizky Ananda</span>
                <span style={{ background: C.primaryTint, color: C.primary, fontSize: 11, padding: '3px 8px', borderRadius: R.sm }}>✓ Terverifikasi</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: C.textMuted }}>Trust Score</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>82/100</span>
                </div>
                <div style={{ background: C.primaryTint, borderRadius: 4, height: 6 }}>
                  <div style={{ background: C.primary, width: '82%', height: 6, borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['UI Design 92', 'Figma 87'].map(t => (
                  <span key={t} style={{ background: C.primaryTint, color: C.primary, fontSize: 12, padding: '4px 10px', borderRadius: R.sm }}>{t}</span>
                ))}
              </div>
            </TiltCard>
          </div>
        </motion.div>

        <PilarSeparator />

        {/* Pilar 2 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', marginBottom: 96 }}
        >
          <div className="pilar-grid" style={{ display: 'grid', gridTemplateColumns: '5fr 6fr', gap: 64, alignItems: 'center' }}>
            <TiltCard style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.lg, padding: 24, boxShadow: SH }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 16 }}>Proyek mikro tersedia</p>
              {[['Desain logo UMKM', 'Rp 350rb'], ['Konten Instagram 1 bulan', 'Rp 800rb'], ['Landing page sederhana', 'Rp 1,2jt']].map(([n, p], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? `0.5px solid ${C.border}` : 'none', fontSize: 14 }}>
                  <span style={{ color: C.text }}>{n}</span>
                  <span style={{ color: C.primary, fontWeight: 600 }}>{p}</span>
                </div>
              ))}
            </TiltCard>
            <div>
              <span style={{ background: C.primaryTint, color: C.primary, fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: R.sm, display: 'inline-block', marginBottom: 16 }}>02 — Micro-project Marketplace</span>
              <h3 className="outfit" style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 12 }}>Proyek kecil, langkah besar</h3>
              <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7, marginBottom: 20 }}>
                Proyek Rp 100rb–5jt yang dikurasi khusus untuk membangun reputasi tanpa risiko besar.
              </p>
              {['Smart matching by skill & trust score', 'Escrow protection di setiap transaksi', 'Review otomatis tiap proyek selesai'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, color: C.textMuted }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, flexShrink: 0 }} />{s}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <PilarSeparator />

        {/* Pilar 3 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}
        >
          <div className="pilar-grid" style={{ display: 'grid', gridTemplateColumns: '6fr 5fr', gap: 64, alignItems: 'center' }}>
            <div>
              <span style={{ background: C.primaryTint, color: C.primary, fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: R.sm, display: 'inline-block', marginBottom: 16 }}>03 — Cashflow Clarity</span>
              <h3 className="outfit" style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 12 }}>Tahu uangmu ke mana</h3>
              <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7, marginBottom: 20 }}>
                Dashboard cashflow dengan proyeksi 30/60/90 hari berdasarkan proyek aktif.
              </p>
              {['Chart pemasukan 6 bulan', 'Proyeksi pendapatan ke depan', 'Riwayat transaksi lengkap'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, color: C.textMuted }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, flexShrink: 0 }} />{s}
                </div>
              ))}
            </div>
            <TiltCard style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.lg, padding: 24, boxShadow: SH }}>
              <p style={{ fontSize: 11, color: C.textTertiary, marginBottom: 4 }}>Pemasukan bulan ini</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <span className="outfit" style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Rp 3.250.000</span>
                <span style={{ background: C.primaryTint, color: C.primary, fontSize: 11, padding: '3px 8px', borderRadius: R.sm }}>+12%</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 60 }}>
                {[40, 55, 35, 70, 60, 100].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: i < 4 ? C.primaryTint : C.primary, borderRadius: '4px 4px 0 0' }} />
                ))}
              </div>
            </TiltCard>
          </div>
        </motion.div>
      </motion.section>

      {/* 7 — HOW IT WORKS */}
      <motion.section id="cara-kerja" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={fv}
        style={{ background: C.bgAlt, padding: '160px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: '1.5px', marginBottom: 12, textTransform: 'uppercase' }}>Cara Kerja</p>
          <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 36, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', marginBottom: 12 }}>
            Dari daftar ke bayaran pertama — dalam hitungan hari.
          </h2>
          <p style={{ fontSize: 15, color: C.textMuted, marginBottom: 32 }}>Langkah yang jelas. Tanpa ribet, tanpa drama.</p>
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
          <div style={{ position: 'relative', paddingLeft: 48 }}>
            <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0, width: 2, background: C.primaryBorder }} />
            {steps.map((step, i) => (
              <div
                key={i}
                style={{ position: 'relative', marginBottom: i < steps.length - 1 ? 48 : 0 }}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div style={{ position: 'absolute', left: -48, width: 32, height: 32, borderRadius: '50%', background: C.primary, color: C.primaryTint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, transition: 'transform 0.2s ease', transform: hoveredStep === i ? 'scale(1.1)' : 'scale(1)' }}>
                  {i + 1}
                </div>
                <h3 className="outfit" style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 12 }}>{step.desc}</p>
                <span style={{ background: hoveredStep === i ? C.primaryBorder : C.primaryTint, color: '#26215C', fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: R.pill, display: 'inline-block', borderLeft: `2px solid ${C.primary}`, transition: 'background 0.2s ease' }}>
                  {step.hl}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 8 — KOMISI */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={fv}
        style={{ background: '#EFEDFB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '160px 32px' }}>
          <div className="komisi-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 48, alignItems: 'start' }}>
            <div>
              <span style={{ background: C.primaryTint, color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '1px', padding: '5px 12px', borderRadius: R.sm, display: 'inline-block', marginBottom: 24, textTransform: 'uppercase' }}>Biaya Platform</span>
              <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', marginBottom: 16 }}>
                Gratis untuk daftar. Bayar hanya kalau kamu sudah dapat bayaran.
              </h2>
              <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
                Komisi 10% dipotong otomatis dari pembayaran saat proyek selesai. Tidak ada biaya bulanan, tidak ada biaya pendaftaran.
              </p>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: '1px', marginBottom: 12, textTransform: 'uppercase' }}>Apa yang gratis selamanya:</p>
              {['Buat profil dan skill test', 'Apply ke proyek & kirim proposal', 'Akses dashboard cashflow dasar', 'Generate invoice otomatis', 'Chat aman dengan klien', 'Review otomatis sistem'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: C.textMuted }}>
                  <CheckCircle size={16} strokeWidth={1.5} color={C.success} />{s}
                </div>
              ))}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ background: C.primaryTint, border: `0.5px solid ${C.primaryBorder}`, borderRadius: R.lg, padding: 32, marginBottom: 24 }}>
                <p className="outfit" style={{ fontSize: 64, fontWeight: 800, color: C.primary, lineHeight: 1 }}>10%</p>
                <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 32 }}>dari nilai proyek</p>
                <div style={{ borderTop: `0.5px solid ${C.primaryBorder}`, paddingTop: 24 }}>
                  <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 24, marginTop: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#8A87A8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
                      Hitung sendiri
                    </p>
                    <input
                      type="range"
                      min={100000}
                      max={5000000}
                      step={50000}
                      value={projectValue}
                      onChange={(e) => setProjectValue(Number(e.target.value))}
                      style={{ width: '100%', marginBottom: 12, accentColor: '#534AB7' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8A87A8', marginBottom: 24 }}>
                      <span>Rp 100rb</span>
                      <span>Nilai proyek: Rp {projectValue.toLocaleString('id-ID')}</span>
                      <span>Rp 5jt</span>
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <p style={{ fontSize: 13, color: '#8A87A8', marginBottom: 4 }}>Dengan 10% itu, kamu dapat:</p>
                      <p style={{ fontSize: 32, fontWeight: 700, color: '#534AB7', fontFamily: 'var(--font-playfair),Georgia,serif', marginBottom: 4 }}>
                        Rp {Math.round(projectValue * 0.9).toLocaleString('id-ID')} cair ke kamu
                      </p>
                      <p style={{ fontSize: 12, color: '#8A87A8' }}>
                        (Rp {Math.round(projectValue * 0.1).toLocaleString('id-ID')} untuk jaga keamanan transaksi ini)
                      </p>
                    </div>
                    <div style={{ background: '#F8F7FE', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: 'Escrow', desc: 'Dana ditahan aman sampai kamu selesai kerja' },
                        { label: 'Invoice otomatis', desc: 'Tidak perlu bikin manual, langsung jadi' },
                        { label: 'Mediasi gratis', desc: 'Kalau ada sengketa, tim Gawe bantu selesaikan' },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ color: '#10B981', fontSize: 14, marginTop: 2 }}>✓</span>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#26215C', marginBottom: 2 }}>{item.label}</p>
                            <p style={{ fontSize: 12, color: '#8A87A8', margin: 0 }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {FAQ.map((item, i) => {
                const isActive = openFaq === i
                return (
                  <div key={i} style={{
                    background: isActive ? '#FFFFFF' : 'transparent',
                    border: isActive ? '1px solid #CECBF6' : '1px solid transparent',
                    borderRadius: 12,
                    boxShadow: isActive ? '0 8px 24px rgba(83,74,183,0.08)' : 'none',
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
      </motion.section>

      {/* 9 — TESTIMONI */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={fv}
        style={{ background: C.bg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '160px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: '-0.5px' }}>Mereka juga pernah di posisimu.</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => testimoniScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E3F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F8F7FE' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
              >
                <ChevronLeft size={18} color={C.text} />
              </button>
              <button
                onClick={() => testimoniScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E3F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F8F7FE' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
              >
                <ChevronRight size={18} color={C.text} />
              </button>
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: C.textMuted, letterSpacing: '0.5px', marginBottom: 48 }}>
            Bukan bintang lima generik — ini orang beneran, dengan masalah yang beneran.
          </p>
          <div
            ref={testimoniScrollRef}
            className="testimoni-scroll"
            style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8, paddingRight: 32, scrollBehavior: 'smooth' }}
          >
            {[
              { q: 'Saya daftar Senin sore, ambil skill test, dan Rabu pagi sudah dapat proyek pertama. Kecil, tapi dari situ portofolio saya mulai ada isinya.', init: 'R', iBg: C.primaryTint, iC: C.primary, name: 'Rizky A.', age: '23', detail: 'UI Designer · Bandung', badge: 'Trust Score 84', bBg: C.primaryTint, bC: C.primary },
              { q: 'Yang saya suka dari Gawe tuh dashboard cashflow-nya. Sebelumnya saya cuma bisa nebak-nebak bulan depan aman atau nggak. Sekarang ada proyeksinya.', init: 'D', iBg: C.coralTint, iC: C.coral, name: 'Dina M.', age: '29', detail: 'Content Writer · Jakarta', badge: '12 Proyek', bBg: C.successTint, bC: C.success },
              { q: 'Saya sudah tiga kali kena ghosting di platform lain. Di Gawe, freelancer yang saya pilih kasih update setiap hari dan hasilnya melampaui ekspektasi.', init: 'B', iBg: C.successTint, iC: C.success, name: 'Budi S.', age: '36', detail: 'Pemilik UMKM · Surabaya', badge: '', bBg: '', bC: '' },
              { q: 'Saya karyawan yang mau mulai side hustle. Gawe ada rate calculator-nya, proyeknya bisa dikerjain dalam 2–3 hari tanpa ganggu kerjaan utama.', init: 'S', iBg: C.bgAlt, iC: C.textMuted, name: 'Sari W.', age: '31', detail: 'Freelance Translator · Yogyakarta', badge: '', bBg: '', bC: '' },
            ].map((t, i) => (
              <TiltCard
                key={i}
                style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: R.lg, padding: 28, boxShadow: SH, scrollSnapAlign: 'start', minWidth: 340, maxWidth: 'calc(100vw - 64px)', flexShrink: 0 }}
              >
                <p style={{ fontSize: 15, fontStyle: 'italic', color: C.text, lineHeight: 1.7, marginBottom: 20 }}>"{t.q}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.iBg, color: t.iC, border: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {t.init}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{t.name}</span>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{t.age}</span>
                    </div>
                    <p style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{t.detail}</p>
                  </div>
                  {t.badge && <span style={{ background: t.bBg, color: t.bC, fontSize: 11, padding: '3px 8px', borderRadius: R.sm, flexShrink: 0 }}>{t.badge}</span>}
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 10 — DUAL CTA */}
      <motion.section id="dual-cta" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={fv}
        style={{ background: C.bgAlt }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '160px 32px' }}>
          <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 36, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', textAlign: 'center', marginBottom: 48 }}>
            Kamu tidak butuh pengalaman dulu.<br />Kamu butuh kesempatan pertama.
          </h2>
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
      </motion.section>

      {/* 11 — FINAL CTA */}
      <section style={{ position: 'relative', overflow: 'hidden', background: C.meshBase, padding: '160px 32px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', bottom: '-20%', left: '-20%', background: mesh, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'linear-gradient(180deg,rgba(15,12,46,0) 0%,rgba(15,12,46,0.3) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 48, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.5px', marginBottom: 0 }}>Gratis untuk daftar.</h2>
          <h2 className="outfit" style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 32, fontWeight: 500, color: '#CECBF6', letterSpacing: '-0.5px', marginBottom: 20 }}>Bayar hanya kalau kamu sudah dapat bayaran.</h2>
          <p style={{ fontSize: 16, color: '#AFA9EC', marginBottom: 40, lineHeight: 1.7 }}>
            Daftar sekarang. Tanpa kartu kredit. Kamu bisa mulai buat profil dalam 10 menit dan langsung terlihat oleh ratusan klien hari ini.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/daftar"
              style={{ background: '#FFFFFF', color: C.text, borderRadius: R.pill, padding: '14px 32px', fontWeight: 600, fontSize: 15, textDecoration: 'none', transition: 'transform 0.15s ease, opacity 0.15s ease', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              Yuk mulai Gawe →
            </Link>
            <a href="/proyek"
              style={{ background: 'transparent', color: '#FFFFFF', border: '0.5px solid rgba(255,255,255,0.3)', borderRadius: R.pill, padding: '14px 32px', fontSize: 15, textDecoration: 'none', transition: 'transform 0.15s ease, opacity 0.15s ease', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              Cari freelancer
            </a>
          </div>
        </div>
      </section>

      {/* 12 — FOOTER */}
      <footer style={{ background: '#26215C', padding: '48px 32px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
                <span className="outfit" style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>Gawe.</span>
              </div>
              <p style={{ fontSize: 13, color: '#AFA9EC', lineHeight: 1.7 }}>
                Platform freelance untuk yang baru mulai. Kami percaya setiap orang berhak dapat kesempatan pertama.
              </p>
            </div>
            {[
              { heading: 'PRODUK', links: [['Cara Kerja', '#cara-kerja'], ['Proyek', '/proyek'], ['Harga', '#komisi'], ['Fitur', '#fitur']] },
              { heading: 'PERUSAHAAN', links: [['Tentang', '/tentang'], ['Blog', '/blog'], ['Karir', '/karir'], ['Kontak', '/kontak']] },
              { heading: 'LEGAL', links: [['Privasi', '/privasi'], ['Syarat & Ketentuan', '/syarat'], ['Keamanan', '/keamanan']] },
            ].map(col => (
              <div key={col.heading}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#FFFFFF', letterSpacing: '1.5px', marginBottom: 16 }}>{col.heading}</p>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} style={{ fontSize: 13, color: '#AFA9EC', display: 'block', marginBottom: 10, textDecoration: 'none' }}>{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#6B6885' }}>© 2026 Gawe · Dibuat dengan semangat di Indonesia 🇮🇣</span>
            <span style={{ fontSize: 12, color: '#6B6885' }}>Instagram · LinkedIn · Twitter</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
