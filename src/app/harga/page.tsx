'use client'
import { useState } from 'react'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R, shadow: SH, fonts: F } = theme

const PRICING_ROWS = [
  { label: 'Daftar Akun', value: 'Gratis selamanya' },
  { label: 'Pasang Proyek (Klien)', value: 'Gratis' },
  { label: 'Lamar Proyek (Freelancer)', value: 'Gratis tanpa batasan' },
  { label: 'Komisi Platform', value: '10%' },
  { label: 'Biaya Tarik Dana', value: 'Rp 4.000 per penarikan' },
]

const COMPARISON = [
  { platform: 'Gawe', fee: '10%', highlight: true },
  { platform: 'Sribu', fee: '15%–20%', highlight: false },
  { platform: 'Fastwork', fee: '15%', highlight: false },
  { platform: 'Fiverr', fee: '20%', highlight: false },
]

const EXAMPLES = [
  { project: 'Proyek Rp 500.000', receive: 'Rp 450.000', cut: 'Rp 50.000' },
  { project: 'Proyek Rp 2.000.000', receive: 'Rp 1.800.000', cut: 'Rp 200.000' },
]

const TIERS = [
  { range: '0–5 proyek', rate: '10%' },
  { range: '6–15 proyek', rate: '8%' },
  { range: '16–30 proyek', rate: '6%' },
  { range: '31+ proyek', rate: '5%' },
]

const FAQS = [
  {
    q: 'Ada biaya bulanan buat dapetin fitur premium nggak?',
    a: 'Nggak ada sama sekali. Di Gawe nggak ada kasta-kastaan. Semua fitur bisa kamu pakai secara gratis, dari awal sampai kapan pun.',
  },
  {
    q: 'Kalau proyek dibatalkan, uang klien gimana?',
    a: 'Kalau proyek batal sebelum hasil kerja disetujui, dana akan dikembalikan utuh 100% ke saldo klien tanpa ada potongan sepeser pun.',
  },
]

const NAV_LINKS = [
  ['Cara Kerja', '/cara-kerja'],
  ['Proyek', '/proyek'],
  ['Harga', '/harga'],
]

export default function HargaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: C.bgWhite, color: C.textDark, fontFamily: F.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @media(max-width:768px){.nav-mid-harga{display:none!important}}
        @media(max-width:560px){.tier-grid{grid-template-columns:repeat(2,1fr)!important}.example-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: C.textDark, fontFamily: 'var(--font-playfair), Georgia, serif' }}>Gawe</span>
          </a>
          <nav className="nav-mid-harga" style={{ display: 'flex', gap: 32 }}>
            {NAV_LINKS.map(([l, h]) => (
              <a key={l} href={h}
                style={{ fontSize: 14, color: l === 'Harga' ? C.primary : C.textMuted, textDecoration: 'none', fontWeight: l === 'Harga' ? 600 : 400, transition: 'color 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = C.primary }}
                onMouseLeave={e => { e.currentTarget.style.color = l === 'Harga' ? C.primary : C.textMuted }}
              >{l}</a>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a href="/auth/masuk" style={{ fontSize: 14, color: C.textMuted, textDecoration: 'none', marginRight: 16 }}>Masuk</a>
            <a href="/auth/daftar"
              style={{ background: C.primary, color: C.primaryTint, padding: '8px 20px', borderRadius: R.pill, fontSize: 13, fontWeight: 500, textDecoration: 'none', display: 'inline-block', transition: 'transform 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              Daftar Gratis →
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 64, textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Harga</span>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(26px, 4.5vw, 42px)', fontWeight: 700, color: C.textDark, lineHeight: 1.2, marginBottom: 20 }}>
            Bikin Akun Gratis Selamanya. Potongan Berlaku Pas Proyek Beres.
          </h1>
          <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.8, maxWidth: 540, margin: '0 auto' }}>
            Kami tahu rasanya jadi pemula dengan modal pas-pasan. Makanya, kami cuma ambil bagian saat kamu beneran udah sukses dapat bayaran.
          </p>
        </div>

        {/* Nggak Ada Biaya Tersembunyi */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 22, fontWeight: 700, color: C.textDark, marginBottom: 24 }}>
            Nggak Ada Biaya Tersembunyi
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: `1px solid ${C.border}`, borderRadius: R.lg, overflow: 'hidden' }}>
            {PRICING_ROWS.map(({ label, value }, i) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', background: i % 2 === 0 ? C.bgWhite : C.bgLavenderSoft, borderBottom: i < PRICING_ROWS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} color={C.success} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: C.textDark }}>{label}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: label === 'Komisi Platform' ? C.primary : C.textDark }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bandingin Sendiri */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 22, fontWeight: 700, color: C.textDark, marginBottom: 24 }}>
            Bandingin Sendiri Untungnya
          </h2>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: R.lg, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: C.bgLavenderStrong, padding: '12px 22px', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Platform</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Komisi</span>
            </div>
            {COMPARISON.map(({ platform, fee, highlight }) => (
              <div key={platform} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '15px 22px', background: highlight ? C.primaryTint : C.bgWhite, borderBottom: `1px solid ${C.border}`, borderLeft: highlight ? `3px solid ${C.primary}` : '3px solid transparent' }}>
                <span style={{ fontSize: 15, fontWeight: highlight ? 700 : 400, color: highlight ? C.primary : C.textDark }}>
                  {platform}
                  {highlight && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: C.primary, background: C.primaryBorder, padding: '2px 8px', borderRadius: R.pill }}>Terbaik</span>}
                </span>
                <span style={{ fontSize: 15, fontWeight: highlight ? 700 : 400, color: highlight ? C.primary : C.textMuted }}>{fee}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Biar Makin Kebayang */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 22, fontWeight: 700, color: C.textDark, marginBottom: 24 }}>
            Biar Makin Kebayang
          </h2>
          <div className="example-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {EXAMPLES.map(({ project, receive, cut }) => (
              <div key={project} style={{ padding: '24px 22px', background: C.bgLavenderSoft, borderRadius: R.lg, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>{project}</div>
                <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 28, fontWeight: 700, color: C.success, marginBottom: 6 }}>{receive}</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>masuk ke kantongmu</div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.textTertiary }}>Komisi Gawe: {cut}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 22, fontWeight: 700, color: C.textDark, marginBottom: 8 }}>
            Makin Rajin, Komisi Makin Turun
          </h2>
          <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
            Semakin banyak proyek yang kamu selesaikan, semakin kecil potongan yang kami ambil.
          </p>
          <div className="tier-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {TIERS.map(({ range, rate }, i) => (
              <div key={range} style={{ padding: '20px 16px', textAlign: 'center', background: i === 0 ? C.bgLavenderSoft : C.bgWhite, border: `1px solid ${i === 0 ? C.primaryBorder : C.border}`, borderRadius: R.md, boxShadow: i === 0 ? SH.card : 'none' }}>
                <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 28, fontWeight: 700, color: i === 0 ? C.primary : C.textDark, marginBottom: 4 }}>{rate}</div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>{range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 22, fontWeight: 700, color: C.textDark, marginBottom: 20 }}>
            Ada yang Masih Bingung?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} style={{ border: `1px solid ${isOpen ? C.primaryBorder : C.border}`, borderRadius: R.md, overflow: 'hidden', transition: 'border-color 0.2s ease' }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', background: isOpen ? C.bgLavenderSoft : C.bgWhite, border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s ease', gap: 12 }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 600, color: C.textDark, lineHeight: 1.4 }}>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      color={C.primary}
                      style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 18px', background: C.bgLavenderSoft }}>
                      <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.75 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '44px 32px', background: C.bgLavenderSoft, borderRadius: R.lg, border: `1px solid ${C.border}` }}>
          <p style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 20, fontWeight: 700, color: C.textDark, marginBottom: 24 }}>
            Siap pecah telur bulan ini?
          </p>
          <a href="/auth/daftar"
            style={{ display: 'inline-block', background: C.primary, color: C.primaryTint, padding: '13px 32px', borderRadius: R.pill, fontWeight: 600, fontSize: 15, textDecoration: 'none', transition: 'transform 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
            Daftar &amp; Pecah Telur
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '32px', textAlign: 'center', fontSize: 13, color: C.textMuted, marginTop: 40 }}>
        © 2025 Gawe ·{' '}
        <a href="/tentang" style={{ color: C.textMuted, textDecoration: 'none' }}>Tentang</a>{' '}·{' '}
        <a href="/privasi" style={{ color: C.textMuted, textDecoration: 'none' }}>Privasi</a>{' '}·{' '}
        <a href="/syarat-ketentuan" style={{ color: C.textMuted, textDecoration: 'none' }}>Syarat &amp; Ketentuan</a>
      </footer>
    </div>
  )
}
