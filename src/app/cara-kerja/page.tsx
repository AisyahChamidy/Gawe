'use client'
import { useState } from 'react'
import { Lock, ShieldCheck, Gavel } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R, shadow: SH, fonts: F } = theme

const STEPS_FREELANCER = [
  {
    n: 1,
    title: 'Bikin Profil & Pamerin Skill',
    desc: 'Daftar, isi data diri, dan ikutin tes skill singkat. Ini senjata utamamu buat ngebuktiin kemampuan ke klien, meskipun kamu belum punya portofolio tebal.',
  },
  {
    n: 2,
    title: 'Cari Proyek yang Pas di Hati',
    desc: 'Pilih ratusan proyek skala kecil yang emang dirancang khusus buat pemula. Kamu nggak perlu pusing atau minder bersaing sama freelancer senior di sini.',
  },
  {
    n: 3,
    title: 'Lamar dan Ngobrol Langsung',
    desc: 'Kirim penawaran terbaikmu. Kalau klien tertarik, kalian bisa langsung diskusi soal detail kerjaan, deadline, dan brief via chat dengan santai.',
  },
  {
    n: 4,
    title: 'Beresin Kerjaan, Langsung Gajian',
    desc: 'Kumpul hasil kerjamu di platform. Begitu klien bilang setuju, bayaran langsung masuk ke saldomu tanpa nunggu lama-lama.',
  },
]

const STEPS_KLIEN = [
  {
    n: 1,
    title: 'Pasang Proyek & Tulis Brief',
    desc: 'Ceritain apa yang kamu butuhin sejelas mungkin. Makin jelas brief-mu, makin gampang freelancer ngasih hasil yang maksimal.',
  },
  {
    n: 2,
    title: 'Pilih Freelancer yang Cocok',
    desc: 'Lihat lamaran yang masuk, cek hasil tes skill mereka, dan pilih yang paling pas sama budget dan kebutuhan proyekmu.',
  },
  {
    n: 3,
    title: 'Amankan Dana di Awal',
    desc: 'Titip bayaran ke sistem escrow Gawe. Freelancer jadi lebih tenang dan semangat kerja, uangmu juga aman sampai hasil kerja benar-benar disetujui.',
  },
  {
    n: 4,
    title: 'Review, Setujui, dan Selesai',
    desc: 'Cek hasil kerjaan yang dikirim. Kalau udah oke, tinggal klik setuju dan uang otomatis diteruskan ke kantong freelancer.',
  },
]

const SAFETY = [
  {
    Icon: Lock,
    title: 'Uang Aman di Tengah',
    desc: 'Kami pakai sistem escrow. Klien titip dana di awal, freelancer dibayar di akhir. Nggak ada cerita telat bayar atau hasil kerja dibawa kabur.',
  },
  {
    Icon: ShieldCheck,
    title: 'Bebas Akun Bodong',
    desc: 'Semua pengguna di Gawe wajib verifikasi KTP asli. Kamu cuma berurusan dengan manusia nyata, bukan penipu.',
  },
  {
    Icon: Gavel,
    title: 'Ada Wasit Kalau Mentok',
    desc: 'Kalau di tengah jalan ada beda pendapat, tim Gawe siap turun tangan buat bantu cari jalan tengah yang adil buat kedua pihak.',
  },
]

const NAV_LINKS = [
  ['Cara Kerja', '/cara-kerja'],
  ['Proyek', '/proyek'],
  ['Harga', '/harga'],
]

export default function CaraKerjaPage() {
  const [tab, setTab] = useState<'freelancer' | 'klien'>('freelancer')
  const steps = tab === 'freelancer' ? STEPS_FREELANCER : STEPS_KLIEN

  return (
    <div style={{ minHeight: '100vh', background: C.bgWhite, color: C.textDark, fontFamily: F.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @media(max-width:768px){.nav-mid-cara-kerja{display:none!important}}
        @media(max-width:640px){.safety-grid{grid-template-columns:1fr!important}.cta-btns{flex-direction:column!important}}
      `}</style>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: C.textDark, fontFamily: 'var(--font-playfair), Georgia, serif' }}>Gawe</span>
          </a>
          <nav className="nav-mid-cara-kerja" style={{ display: 'flex', gap: 32 }}>
            {NAV_LINKS.map(([l, h]) => (
              <a key={l} href={h}
                style={{ fontSize: 14, color: l === 'Cara Kerja' ? C.primary : C.textMuted, textDecoration: 'none', fontWeight: l === 'Cara Kerja' ? 600 : 400, transition: 'color 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = C.primary }}
                onMouseLeave={e => { e.currentTarget.style.color = l === 'Cara Kerja' ? C.primary : C.textMuted }}
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
        <div style={{ marginBottom: 56, textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Cara Kerja</span>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 700, color: C.textDark, lineHeight: 1.2, marginBottom: 20 }}>
            Jalan Pintas dari Daftar Sampai Gajian Pertama.
          </h1>
          <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Nggak perlu nebak-nebak gimana caranya mulai. Ikuti langkah sederhana ini buat dapetin klien pertamamu atau nemuin talenta andalan.
          </p>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: C.bgLavenderSoft, borderRadius: R.pill, padding: 4, border: `1px solid ${C.border}` }}>
            {(['freelancer', 'klien'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '9px 24px',
                  borderRadius: R.pill,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: F.body,
                  transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
                  background: tab === t ? C.primary : 'transparent',
                  color: tab === t ? C.primaryTint : C.textMuted,
                  boxShadow: tab === t ? SH.card : 'none',
                }}
              >
                {t === 'freelancer' ? 'Untuk Freelancer' : 'Untuk Klien'}
              </button>
            ))}
          </div>
        </div>

        {/* Step cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 72 }}>
          {steps.map(({ n, title, desc }) => (
            <div key={n} style={{ display: 'flex', gap: 20, padding: '22px 26px', background: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, boxShadow: SH.card }}>
              <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: C.primaryTint, border: `1.5px solid ${C.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{n}</span>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 17, fontWeight: 700, color: C.textDark, marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.border, marginBottom: 56 }} />

        {/* Safety section */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, color: C.textDark, textAlign: 'center', marginBottom: 32 }}>
            Kenapa Gawe Aman?
          </h2>
          <div className="safety-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {SAFETY.map(({ Icon, title, desc }) => (
              <div key={title} style={{ padding: '24px 20px', background: C.bgLavenderSoft, borderRadius: R.lg, border: `1px solid ${C.border}` }}>
                <div style={{ width: 40, height: 40, borderRadius: R.sm, background: C.primaryTint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={19} color={C.primary} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 15, fontWeight: 700, color: C.textDark, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '44px 32px', background: C.bgLavenderSoft, borderRadius: R.lg, border: `1px solid ${C.border}` }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 22, fontWeight: 700, color: C.textDark, marginBottom: 28 }}>
            Udah paham caranya. Tinggal mulai.
          </h2>
          <div className="cta-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/daftar"
              style={{ display: 'inline-block', background: C.primary, color: C.primaryTint, padding: '12px 28px', borderRadius: R.pill, fontWeight: 600, fontSize: 15, textDecoration: 'none', transition: 'transform 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              Ambil Proyek Pertamamu
            </a>
            <a href="/auth/daftar"
              style={{ display: 'inline-block', background: C.bgWhite, color: C.primary, padding: '12px 28px', borderRadius: R.pill, fontWeight: 600, fontSize: 15, textDecoration: 'none', border: `1.5px solid ${C.primaryBorder}`, transition: 'transform 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              Pasang Proyek Sekarang
            </a>
          </div>
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
