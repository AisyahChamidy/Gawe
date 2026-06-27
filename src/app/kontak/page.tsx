'use client'
import { useState } from 'react'
import { Mail, AtSign, MessageCircle, ChevronDown } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R, shadow: SH, fonts: F } = theme

const CONTACTS = [
  {
    Icon: Mail,
    label: 'Email',
    value: 'halo@gawe.id',
    desc: 'Untuk semua pertanyaan umum, laporan masalah, dan saran.',
    href: 'mailto:halo@gawe.id',
  },
  {
    Icon: AtSign,
    label: 'Instagram',
    value: '@gawe.id',
    desc: 'Update terbaru, tips freelance, dan cerita sukses komunitas Gawe.',
    href: 'https://instagram.com/gawe.id',
  },
  {
    Icon: MessageCircle,
    label: 'WhatsApp',
    value: '+62 812-3456-7890',
    desc: 'Untuk pertanyaan cepat atau bantuan teknis mendesak.',
    href: 'https://wa.me/6281234567890',
  },
]

const FAQS = [
  {
    q: 'Berapa lama waktu respons tim Gawe?',
    a: 'Untuk email, kami biasanya membalas dalam 1×24 jam di hari kerja (Senin–Jumat). Kalau perlu jawaban cepat, WhatsApp adalah pilihan terbaik karena kami pantau aktif dari pagi sampai malam.',
  },
  {
    q: 'Ada masalah sama proyek atau pembayaran, ke mana lapor?',
    a: 'Langsung kirim email ke halo@gawe.id dengan subjek "Sengketa Proyek" dan sertakan ID proyekmu. Tim mediasi kami akan merespons dalam maksimal 1×24 jam dan mulai meninjau kasusmu secara netral.',
  },
  {
    q: 'Apakah Gawe punya kantor fisik yang bisa dikunjungi?',
    a: 'Saat ini Gawe beroperasi secara remote 100%. Seluruh tim kami tersebar di berbagai kota di Indonesia, jadi kami nggak punya kantor yang bisa didatangi langsung. Tapi tenang, support kami tetap responsif dan bisa diandalkan!',
  },
]

const NAV_LINKS = [
  ['Cara Kerja', '/#cara-kerja'],
  ['Proyek', '/proyek'],
  ['Untuk Bisnis', '/#dual-cta'],
]

export default function KontakPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: C.bgWhite, color: C.textDark, fontFamily: F.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @media(max-width:768px){.nav-mid-kontak{display:none!important}}
      `}</style>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: C.textDark, fontFamily: 'var(--font-playfair), Georgia, serif' }}>Gawe</span>
          </a>
          <nav className="nav-mid-kontak" style={{ display: 'flex', gap: 32 }}>
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
          <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Kontak</span>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 700, color: C.textDark, lineHeight: 1.2, marginBottom: 20 }}>
            Ada yang bikin bingung? Ngobrol sama kita, yuk.
          </h1>
          <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.8 }}>
            Tim Gawe ada buat kamu — baik kamu freelancer yang baru mulai atau klien yang lagi nyari bantuan. Pilih channel yang paling nyaman buat kamu.
          </p>
        </div>

        {/* Contact cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 56 }}>
          {CONTACTS.map(({ Icon, label, value, desc, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div
                style={{ display: 'flex', gap: 20, padding: '22px 26px', background: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.lg, boxShadow: SH.card, transition: 'box-shadow 0.15s ease, border-color 0.15s ease', cursor: 'pointer' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = SH.hover; el.style.borderColor = C.primaryBorder }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = SH.card; el.style.borderColor = C.border }}
              >
                <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: R.sm, background: C.primaryTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={C.primary} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textTertiary, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 17, fontWeight: 700, color: C.textDark, marginBottom: 6 }}>{value}</div>
                  <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Jam respons */}
        <div style={{ padding: '24px 28px', background: C.bgLavenderSoft, borderRadius: R.lg, marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 17, fontWeight: 700, color: C.textDark, marginBottom: 16 }}>Jam Respons Tim</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Senin – Jumat', '09.00 – 21.00 WIB'],
              ['Sabtu', '10.00 – 17.00 WIB'],
              ['Minggu & Hari Libur Nasional', 'Off (balas di hari kerja berikutnya)'],
            ].map(([day, time]) => (
              <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                <span style={{ color: C.textMuted }}>{day}</span>
                <span style={{ fontWeight: 600, color: C.textDark }}>{time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.border, marginBottom: 48 }} />

        {/* FAQ */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 22, fontWeight: 700, color: C.textDark, marginBottom: 24 }}>Pertanyaan yang Sering Muncul</h2>
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

        {/* Closing paragraph */}
        <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.85, textAlign: 'center', padding: '0 16px' }}>
          Kalau pertanyaanmu belum terjawab di sini, jangan ragu langsung hubungi kami. Kami beneran baca setiap pesan yang masuk dan selalu berusaha kasih jawaban yang bermanfaat, bukan template otomatis.
        </p>
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
