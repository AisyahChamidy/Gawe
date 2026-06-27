'use client'
import { theme } from '@/lib/theme'

const { colors: C, radius: R, fonts: F } = theme

const SECTIONS = [
  {
    title: 'Ketentuan Umum',
    body: 'Dengan bikin akun di Gawe, berarti kamu setuju untuk main bersih dan ngikutin aturan yang ada di halaman ini. Akun ini murni tanggung jawabmu sendiri, jadi jangan pernah kasih password ke orang lain apalagi sampai diperjualbelikan. Kalau di kemudian hari ada yang melanggar kesepakatan dasar ini, kami terpaksa harus membekukan akun tersebut demi keamanan bersama.',
  },
  {
    title: 'Kewajiban Pengguna',
    body: 'Sebagai freelancer, tugas utamamu cuma satu: kerjain proyek klien sebaik-baiknya sesuai waktu yang udah disepakati di awal. Jangan rakus ambil proyek kalau ngerasa nggak sanggup, dan pastikan selalu komunikasi dengan jujur kalau ada kendala di tengah jalan. Sebaliknya, klien di Gawe juga wajib memberikan brief atau instruksi yang jelas biar kamu nggak kebingungan pas mulai kerja.',
  },
  {
    title: 'Transaksi & Pembayaran',
    body: 'Semua urusan bayar-membayar wajib lewatin sistem Gawe biar uangmu aman dari risiko klien yang tiba-tiba kabur. Klien bakal setor dana di awal ke kami, dan uang itu otomatis cair ke dompetmu begitu proyek dinyatakan selesai. Ingat, kami cuma potong komisi 10% di akhir saat kamu beneran udah dibayar, dan sama sekali nggak ada biaya langganan bulanan.',
  },
  {
    title: 'Larangan',
    body: 'Tolong banget, jangan pernah coba-coba ngajak klien bertransaksi di luar platform Gawe cuma demi menghindari potongan komisi. Kamu juga dilarang keras melakukan penipuan, nge-spam, atau nyerahin hasil kerjaan curian (plagiat) ke klien. Kalau sampai ketahuan main curang, Trust Score kamu bakal anjlok dan kami nggak ragu buat nge-banned akunmu secara permanen.',
  },
  {
    title: 'Penyelesaian Sengketa',
    body: 'Namanya juga kerja bareng orang, kadang pasti ada salah paham atau hasil yang ternyata nggak sesuai ekspektasi. Kalau kamu beda pendapat atau berantem sama klien, tim Gawe bakal turun tangan jadi wasit yang netral buat nyari jalan tengahnya. Keputusan dari tim kami sifatnya final, jadi pastikan kamu selalu nyimpen semua bukti chat kerjaan di platform buat jaga-jaga.',
  },
  {
    title: 'Perubahan Ketentuan',
    body: 'Aturan main ini bisa aja sedikit berubah di masa depan, ngikutin kebutuhan platform yang pasti bakal terus berkembang. Tapi tenang aja, kami nggak bakal diam-diam ganti aturan; pasti ada notifikasi yang kami kirim ke email atau dashboard akunmu. Kalau kamu tetap lanjut pakai Gawe setelah aturannya di-update, berarti kita sepakat dengan versi aturan yang baru.',
  },
]

const NAV_LINKS = [
  ['Cara Kerja', '/#cara-kerja'],
  ['Proyek', '/proyek'],
  ['Untuk Bisnis', '/#dual-cta'],
]

export default function SyaratKetentuanPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bgWhite, color: C.textDark, fontFamily: F.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @media(max-width:768px){.nav-mid-syarat{display:none!important}}
      `}</style>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: C.textDark, fontFamily: 'var(--font-playfair), Georgia, serif' }}>Gawe</span>
          </a>
          <nav className="nav-mid-syarat" style={{ display: 'flex', gap: 32 }}>
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
          <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Syarat &amp; Ketentuan</span>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: C.textDark, lineHeight: 1.2, marginBottom: 20 }}>
            Aturan Main di Gawe (Biar Sama-Sama Enak).
          </h1>
          <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.8 }}>
            Setiap tempat pasti punya aturan main, tapi kami janji aturan di sini dibikin bukan buat ngikat kamu, melainkan buat ngelindungin hakmu dan hak klien. Anggap aja ini kesepakatan antar teman biar ke depannya kerjaan lancar dan nggak ada yang ngerasa dirugikan.
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

        {/* CTA */}
        <div style={{ marginTop: 64, padding: '28px 32px', background: C.bgLavenderSoft, borderRadius: R.lg, textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: C.textMuted, marginBottom: 20, lineHeight: 1.7 }}>
            Dengan mendaftar, kamu setuju pada seluruh ketentuan di atas. Yuk mulai dengan niat baik dan kerja yang jujur.
          </p>
          <a href="/auth/daftar"
            style={{ display: 'inline-block', background: C.primary, color: C.primaryTint, padding: '12px 28px', borderRadius: R.pill, fontWeight: 600, fontSize: 15, textDecoration: 'none', transition: 'transform 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
            Setuju &amp; Daftar Sekarang
          </a>
        </div>

        {/* Last updated */}
        <div style={{ marginTop: 32, fontSize: 13, color: C.textTertiary, textAlign: 'center' }}>
          Terakhir diperbarui: Januari 2025
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '32px', textAlign: 'center', fontSize: 13, color: C.textMuted, marginTop: 40 }}>
        © 2025 Gawe ·{' '}
        <a href="/tentang" style={{ color: C.textMuted, textDecoration: 'none' }}>Tentang</a>{' '}·{' '}
        <a href="/privasi" style={{ color: C.textMuted, textDecoration: 'none' }}>Privasi</a>
      </footer>
    </div>
  )
}
