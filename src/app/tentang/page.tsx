'use client'
import { ShieldCheck, Briefcase, BarChart2 } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R, shadow: SH, fonts: F } = theme

const PILLARS = [
  {
    Icon: ShieldCheck,
    title: 'Mulai dari Nol, Bangun Kepercayaan',
    desc: 'Nggak punya portofolio sama sekali? Nggak masalah, karena sistem Trust Score kami yang akan menilai kinerja dan kejujuranmu di setiap proyek. Klien akan melihat dedikasi dan usahamu saat ini, bukan menghakimi masa lalumu.',
  },
  {
    Icon: Briefcase,
    title: 'Proyek Skala Kecil, Bayaran Nyata',
    desc: 'Fokus asah skill kamu lewat ratusan proyek bernilai Rp 100 ribu sampai Rp 5 juta yang ukurannya pas untuk pemula. Kamu nggak perlu pusing bersaing dengan freelancer senior, karena lahan ini memang disiapkan khusus buat kamu belajar dan dibayar.',
  },
  {
    Icon: BarChart2,
    title: 'Pantau Uangmu Tanpa Pusing',
    desc: 'Urusan uang hasil keringat sendiri nggak boleh main tebak-tebakan, jadi kami sediakan fitur untuk melacak setiap rupiah yang kamu hasilkan. Kamu bisa tenang fokus ngerjain proyek, sementara sistem kami yang memastikan kapan bayaranmu pasti cair.',
  },
]

const STATS = [
  { val: '500+', label: 'Freelancer' },
  { val: '100+', label: 'Proyek' },
  { val: '10%',  label: 'Komisi' },
]

const NAV_LINKS = [
  ['Cara Kerja', '/#cara-kerja'],
  ['Proyek', '/proyek'],
  ['Untuk Bisnis', '/#dual-cta'],
]

export default function TentangPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bgWhite, color: C.textDark, fontFamily: F.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @media(max-width:768px){.nav-mid-tentang{display:none!important}}
      `}</style>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: C.textDark, fontFamily: 'var(--font-playfair), Georgia, serif' }}>Gawe</span>
          </a>
          <nav className="nav-mid-tentang" style={{ display: 'flex', gap: 32 }}>
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

        {/* Hero */}
        <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 700, color: C.textDark, lineHeight: 1.2, marginBottom: 20 }}>
          Semua ahli pernah jadi pemula. Gawe adalah panggung pertamamu.
        </h1>
        <p style={{ fontSize: 17, color: C.textMuted, lineHeight: 1.8, marginBottom: 56 }}>
          Kamu nggak butuh pengalaman bertahun-tahun atau CV tebal untuk mendapatkan klien pertama. Kami bantu menjembatani niat baikmu dengan peluang kerja yang nyata.
        </p>

        {/* Story */}
        <div style={{ padding: '28px 32px', background: C.bgLavenderSoft, borderLeft: `3px solid ${C.primary}`, borderRadius: R.md, marginBottom: 64 }}>
          <p style={{ fontSize: 15, color: C.textDark, lineHeight: 1.85 }}>
            Kita tahu rasanya pusing keliling cari proyek tapi selalu ditolak cuma karena alasan "belum ada portofolio". Gawe lahir dari rasa frustrasi itu, karena kami percaya setiap orang butuh satu kesempatan pertama untuk membuktikan diri. Kami membangun ekosistem di mana semangat dan tanggung jawabmu jauh lebih dihargai daripada deretan riwayat kerja. Di sini, kamu bisa mulai melangkah dari nol, membangun reputasi perlahan, dan akhirnya bisa mandiri secara finansial tanpa rasa minder.
          </p>
        </div>

        {/* Value pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 64 }}>
          {PILLARS.map(({ Icon, title, desc }) => (
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

        {/* Stats */}
        <div style={{ display: 'flex', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, marginBottom: 64 }}>
          {STATS.map(({ val, label }, i) => (
            <div key={label} style={{ flex: 1, textAlign: 'center', padding: '28px 0', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 34, fontWeight: 700, color: C.primary, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <a href="/auth/daftar"
            style={{ display: 'inline-block', background: C.primary, color: C.primaryTint, padding: '14px 36px', borderRadius: R.pill, fontWeight: 600, fontSize: 16, textDecoration: 'none', transition: 'transform 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
            Ambil Proyek Pertamamu
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '32px', textAlign: 'center', fontSize: 13, color: C.textMuted, marginTop: 40 }}>
        © 2025 Gawe ·{' '}
        <a href="/privasi" style={{ color: C.textMuted, textDecoration: 'none' }}>Privasi</a>{' '}·{' '}
        <a href="/syarat-ketentuan" style={{ color: C.textMuted, textDecoration: 'none' }}>Syarat &amp; Ketentuan</a>
      </footer>
    </div>
  )
}
