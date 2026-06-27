'use client'
import { theme } from '@/lib/theme'

const { colors: C, radius: R, fonts: F } = theme

const SECTIONS = [
  {
    title: 'Informasi yang Dikumpulkan',
    body: 'Pas kamu daftar dan mulai pakai Gawe, kami cuma minta data yang benar-benar penting untuk kelancaran kerjamu. Ini termasuk nama lengkap, email, nomor HP aktif, dan detail rekening biar kamu bisa menarik bayaran nanti. Kami nggak akan pernah meminta informasi aneh-aneh yang nggak ada hubungannya sama urusan freelance kamu di sini.',
  },
  {
    title: 'Penggunaan Data',
    body: 'Data yang kamu kasih bakal kami pakai buat nyambungin profilmu sama klien yang paling pas. Selain itu, kami juga pakai informasinya untuk menghitung Trust Score dan memastikan sistem pembayaran berjalan lancar tanpa ada uang yang nyangkut. Intinya, semua data murni dipakai semata-mata buat bikin pengalaman kerjamu di Gawe makin gampang.',
  },
  {
    title: 'Keamanan Data',
    body: 'Kami menggunakan standar teknologi keamanan platform digital modern untuk mengunci datamu rapat-rapat. Tim Gawe rutin mengecek celah sistem biar nggak ada orang iseng yang bisa ngintip informasi pribadimu dari luar. Kamu fokus aja ngerjain proyek klien sebaik mungkin, urusan gembok-menggembok server biar kami yang urus.',
  },
  {
    title: 'Hak Pengguna',
    body: 'Data ini sepenuhnya tetap milikmu, jadi kamu bebas kapan aja buat mengecek, mengedit, atau bahkan menghapus akun kalau udah nggak butuh Gawe lagi. Kalau ada informasi yang salah atau kamu merasa kurang nyaman, kamu punya hak penuh untuk minta kami perbaiki. Kami nggak akan menahan-nahan hakmu, karena kenyamanan dan kebebasanmu adalah prioritas kami.',
  },
  {
    title: 'Kontak',
    body: 'Masih bingung atau ngerasa ada yang ganjil soal pengelolaan datamu? Jangan sungkan buat ngobrol langsung sama tim kami lewat email di halo@gawe.id. Kami bakal balas secepat mungkin, biasanya nggak sampai 24 jam di hari kerja.',
  },
]

const NAV_LINKS = [
  ['Cara Kerja', '/#cara-kerja'],
  ['Proyek', '/proyek'],
  ['Untuk Bisnis', '/#dual-cta'],
]

export default function PrivasiPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bgWhite, color: C.textDark, fontFamily: F.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @media(max-width:768px){.nav-mid-privasi{display:none!important}}
      `}</style>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: C.textDark, fontFamily: 'var(--font-playfair), Georgia, serif' }}>Gawe</span>
          </a>
          <nav className="nav-mid-privasi" style={{ display: 'flex', gap: 32 }}>
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
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Kebijakan Privasi</span>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: C.textDark, lineHeight: 1.2, marginBottom: 20 }}>
            Janji Gawe Jaga Data Kamu.
          </h1>
          <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.8 }}>
            Kita sama-sama benci dengan yang namanya data bocor atau diam-diam dijual ke pihak nggak bertanggung jawab. Makanya, dokumen privasi ini dibikin bukan sekadar buat pajangan hukum, tapi sebagai janji kakak ke adiknya untuk saling jaga kerahasiaan. Silakan dibaca santai, kami pastikan semuanya transparan dan gampang kamu mengerti.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.border, marginBottom: 48 }} />

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {SECTIONS.map(({ title, body }, i) => (
            <div key={title}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: C.primaryTint, color: C.primary, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 20, fontWeight: 700, color: C.textDark }}>{title}</h2>
              </div>
              <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.85, paddingLeft: 36 }}>{body}</p>
            </div>
          ))}
        </div>

        {/* Last updated */}
        <div style={{ marginTop: 64, padding: '16px 20px', background: C.bgLavenderSoft, borderRadius: R.md, fontSize: 13, color: C.textTertiary }}>
          Terakhir diperbarui: Januari 2025
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '32px', textAlign: 'center', fontSize: 13, color: C.textMuted, marginTop: 40 }}>
        © 2025 Gawe ·{' '}
        <a href="/tentang" style={{ color: C.textMuted, textDecoration: 'none' }}>Tentang</a>{' '}·{' '}
        <a href="/syarat-ketentuan" style={{ color: C.textMuted, textDecoration: 'none' }}>Syarat &amp; Ketentuan</a>
      </footer>
    </div>
  )
}
