import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      
      {/* Navbar */}
      <nav style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e2d4a',
      }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4F6EF7' }}>Gawe</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/auth/masuk" style={{ color: '#8892a4', textDecoration: 'none', fontSize: '14px' }}>
            Masuk
          </Link>
          <Link href="/auth/daftar" style={{
            backgroundColor: '#4F6EF7',
            color: 'white',
            textDecoration: 'none',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}>
            Daftar Gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '100px 40px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#1a2340',
          color: '#4F6EF7',
          fontSize: '13px',
          padding: '6px 16px',
          borderRadius: '20px',
          marginBottom: '24px',
          border: '1px solid #2a3a6a',
        }}>
          🚀 Platform freelance untuk pemula Indonesia
        </div>

        <h1 style={{
          fontSize: '56px',
          fontWeight: 'bold',
          lineHeight: '1.1',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #8892a4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Mulai freelance-mu,<br />tanpa portofolio
        </h1>

        <p style={{
          fontSize: '20px',
          color: '#8892a4',
          lineHeight: '1.6',
          marginBottom: '40px',
          maxWidth: '560px',
          margin: '0 auto 40px',
        }}>
          Gawe membantu freelancer pemula dapat proyek pertama mereka — tanpa perlu pengalaman atau portofolio sebelumnya.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/daftar" style={{
            backgroundColor: '#4F6EF7',
            color: 'white',
            textDecoration: 'none',
            padding: '14px 32px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
          }}>
            Mulai sebagai Freelancer →
          </Link>
          <Link href="/auth/daftar" style={{
            backgroundColor: 'transparent',
            color: 'white',
            textDecoration: 'none',
            padding: '14px 32px',
            borderRadius: '10px',
            fontSize: '16px',
            border: '1px solid #1e2d4a',
          }}>
            Cari Freelancer
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        padding: '60px 40px',
        borderTop: '1px solid #1e2d4a',
        borderBottom: '1px solid #1e2d4a',
        display: 'flex',
        justifyContent: 'center',
        gap: '80px',
        flexWrap: 'wrap',
      }}>
        {[
          { number: 'Rp 100rb', label: 'Budget minimum proyek' },
          { number: '10%', label: 'Komisi platform saja' },
          { number: '100%', label: 'Dana aman dengan escrow' },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4F6EF7', marginBottom: '8px' }}>
              {stat.number}
            </div>
            <div style={{ color: '#8892a4', fontSize: '14px' }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Problem → Solution */}
      <section style={{ padding: '80px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>
          Masalah yang Gawe selesaikan
        </h2>
        <p style={{ color: '#8892a4', textAlign: 'center', marginBottom: '60px', fontSize: '16px' }}>
          Freelancer pemula terjebak dalam lingkaran yang tidak mungkin keluar.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {[
            {
              icon: '😔',
              title: 'Tidak bisa dapat klien',
              desc: 'Klien minta portofolio. Tapi portofolio hanya bisa dibangun dari klien. Lingkaran tak berujung.',
              color: '#2d1515',
              border: '#4a1515',
            },
            {
              icon: '✅',
              title: 'Gawe membangun reputasimu',
              desc: 'Trust Score dari skill test + KYC verifikasi menggantikan portofolio. Klien percaya, meski baru pertama kali.',
              color: '#152d1e',
              border: '#1a4a2a',
            },
            {
              icon: '💸',
              title: 'Cashflow tidak terkontrol',
              desc: 'Tidak tahu kapan bayaran masuk, berapa yang sudah earned, dan berapa yang masih pending.',
              color: '#2d1515',
              border: '#4a1515',
            },
            {
              icon: '📊',
              title: 'Dashboard cashflow lengkap',
              desc: 'Pantau pemasukan, proyek aktif, dan proyeksi pendapatan — semua dalam satu dashboard yang simpel.',
              color: '#152d1e',
              border: '#1a4a2a',
            },
          ].map(item => (
            <div key={item.title} style={{
              backgroundColor: item.color,
              border: `1px solid ${item.border}`,
              borderRadius: '12px',
              padding: '28px',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ color: '#8892a4', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        padding: '80px 40px',
        backgroundColor: '#131929',
        borderTop: '1px solid #1e2d4a',
        borderBottom: '1px solid #1e2d4a',
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '60px' }}>
          Cara kerja Gawe
        </h2>
        <div style={{
          display: 'flex',
          gap: '40px',
          maxWidth: '900px',
          margin: '0 auto',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {[
            { step: '1', title: 'Daftar & verifikasi', desc: 'Buat akun gratis, lengkapi profil, dan ambil skill test untuk buktikan kemampuanmu.' },
            { step: '2', title: 'Lamar proyek', desc: 'Browse ratusan proyek micro yang sesuai skillmu. Lamar dengan satu klik.' },
            { step: '3', title: 'Kerjakan & dibayar', desc: 'Dana klien sudah di-escrow. Selesaikan proyek, klien approve, dana langsung cair.' },
          ].map(item => (
            <div key={item.step} style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#4F6EF7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                margin: '0 auto 16px',
              }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ color: '#8892a4', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px' }}>
          Siap mulai perjalanan freelance-mu?
        </h2>
        <p style={{ color: '#8892a4', fontSize: '18px', marginBottom: '40px' }}>
          Gratis selamanya untuk daftar. Komisi hanya saat proyekmu selesai.
        </p>
        <Link href="/auth/daftar" style={{
          backgroundColor: '#4F6EF7',
          color: 'white',
          textDecoration: 'none',
          padding: '16px 40px',
          borderRadius: '10px',
          fontSize: '18px',
          fontWeight: 'bold',
        }}>
          Daftar Sekarang — Gratis
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1e2d4a',
        padding: '32px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#8892a4',
        fontSize: '13px',
      }}>
        <span style={{ color: '#4F6EF7', fontWeight: 'bold', fontSize: '18px' }}>Gawe</span>
        <span>© 2026 Gawe. Platform freelance untuk pemula Indonesia.</span>
      </footer>

    </div>
  )
}