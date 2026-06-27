'use client'
import { Lock, ShieldCheck, Eye, Gavel } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R, shadow: SH, fonts: F } = theme

const CARDS = [
  {
    Icon: Lock,
    title: 'Escrow — Uangmu Nggak Kemana-Mana',
    desc: 'Sebelum kamu mulai ngerjain proyek, klien wajib setor dana dulu ke rekening escrow Gawe. Artinya uangnya udah ada, dijamin aman, dan bakal cair otomatis ke dompetmu begitu klien nge-approve hasil kerjaan. Nggak ada lagi cerita klien kabur setelah kamu kirim hasil.',
  },
  {
    Icon: ShieldCheck,
    title: 'Verifikasi KTP — Klien Nyata, Bukan Akun Palsu',
    desc: 'Setiap klien yang mau posting proyek wajib verifikasi identitas pakai KTP. Jadi kamu bisa tenang, orang di balik proyeknya adalah manusia asli yang bisa dimintai tanggung jawab. Kami simpan data ini terenkripsi dan hanya dipakai untuk keperluan verifikasi.',
  },
  {
    Icon: Eye,
    title: 'Data Pribadimu Bukan Produk Kami',
    desc: 'Gawe nggak pernah dan nggak akan pernah jual datamu ke pihak ketiga, titik. Semua informasi yang kamu kasih — mulai dari email, nomor HP, sampai rekening — hanya dipakai untuk melancarkan transaksi dan komunikasi di platform ini saja.',
  },
  {
    Icon: Gavel,
    title: 'Penyelesaian Sengketa yang Adil',
    desc: 'Kalau ada beda pendapat antara kamu dan klien soal hasil kerja, tim Gawe hadir sebagai mediator netral. Kami nggak otomatis memihak siapapun — kami lihat bukti, dengar kedua sisi, lalu ambil keputusan yang paling adil. Karena kepercayaanmu adalah fondasi platform ini.',
  },
]

const NAV_LINKS = [
  ['Cara Kerja', '/#cara-kerja'],
  ['Proyek', '/proyek'],
  ['Untuk Bisnis', '/#dual-cta'],
]

export default function KeamananPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bgWhite, color: C.textDark, fontFamily: F.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @media(max-width:768px){.nav-mid-keamanan{display:none!important}}
      `}</style>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: C.textDark, fontFamily: 'var(--font-playfair), Georgia, serif' }}>Gawe</span>
          </a>
          <nav className="nav-mid-keamanan" style={{ display: 'flex', gap: 32 }}>
            {NAV_LINKS.map(([l, h]) => (
              <a key={l} href={h}
                style={{ fontSize: 14, color: C.textMuted, textDecoration: 'none', transition: 'color 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = C.primary }}
                onMouseLeave={e => { e.currentTarget.style.color = C.textMuted }}
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

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Keamanan Platform</span>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 700, color: C.textDark, lineHeight: 1.2, marginBottom: 20 }}>
            Kerja tenang, bayaran aman. Biar kami yang urus pusingnya.
          </h1>
          <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.8 }}>
            Kamu fokus aja ngasah skill dan ngerjain proyek klien sebaik mungkin. Urusan uang yang nyangkut, klien abal-abal, atau sengketa yang bikin pusing — itu semua ranah kami. Di Gawe, sistem proteksi dibangun dari awal bukan sebagai tambahan, tapi sebagai pondasi utama.
          </p>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 64 }}>
          {CARDS.map(({ Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 20, padding: '24px 28px', background: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, boxShadow: SH.card }}>
              <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: R.sm, background: C.primaryTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={C.primary} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 18, fontWeight: 700, color: C.textDark, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '40px 32px', background: C.bgLavenderSoft, borderRadius: R.lg }}>
          <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
            Sistem proteksi yang solid berarti kamu bisa kerja tanpa was-was. Daftar sekarang dan rasakan bedanya.
          </p>
          <a href="/auth/daftar"
            style={{ display: 'inline-block', background: C.primary, color: C.primaryTint, padding: '13px 32px', borderRadius: R.pill, fontWeight: 600, fontSize: 15, textDecoration: 'none', transition: 'transform 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
            Mulai Cari Proyek
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
