// Seed data dummy untuk presentasi Gawe
// Jalankan: node scripts/seed.js
//
// PENTING: Script ini butuh service role key untuk bypass RLS.
// Tambahkan ke .env.local:
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... (dari Supabase → Settings → API → service_role)

const fs = require('fs')
const path = require('path')

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const CLIENT_ID = process.env.SEED_CLIENT_ID || 'ISI-UUID-KLIEN-DI-SINI'

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY harus ada di .env.local')
  process.exit(1)
}

if (CLIENT_ID === 'ISI-UUID-KLIEN-DI-SINI') {
  console.error('❌ Isi CLIENT_ID terlebih dahulu.')
  console.error('   Jalankan: SEED_CLIENT_ID=uuid-kamu node scripts/seed.js')
  process.exit(1)
}

if (!SERVICE_ROLE_KEY) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY tidak ditemukan.')
  console.warn('   Insert akan gagal karena RLS. Tambahkan key ke .env.local')
  console.warn('   (Supabase → Settings → API → service_role secret)')
  console.warn('')
}

const API_KEY = SERVICE_ROLE_KEY || ANON_KEY

const proyekDummy = [
  {
    client_id: CLIENT_ID,
    title: 'Desain Logo & Brand Identity untuk Kopi Lokal',
    description: 'Kami butuh desainer untuk membuat logo dan identitas brand untuk kedai kopi lokal kami. Gaya yang diinginkan modern namun hangat, mencerminkan nuansa kopi Indonesia. Hasil akhir: file AI/SVG, PNG berbagai ukuran, panduan warna.',
    category: 'Desain Grafis',
    budget_min: 500000,
    budget_max: 1500000,
    estimated_days: 7,
    skills_required: ['Logo Design', 'Brand Identity', 'Adobe Illustrator'],
    status: 'open',
  },
  {
    client_id: CLIENT_ID,
    title: 'Penulis Konten Instagram 30 Hari untuk Toko Online Fashion',
    description: 'Butuh penulis konten untuk membuat 30 caption Instagram yang menarik untuk toko fashion online. Tone: kasual, fun, target usia 18-30 tahun. Sertakan hashtag yang relevan setiap post.',
    category: 'Penulisan Konten',
    budget_min: 300000,
    budget_max: 800000,
    estimated_days: 7,
    skills_required: ['Copywriting', 'Content Writing', 'Social Media'],
    status: 'open',
  },
  {
    client_id: CLIENT_ID,
    title: 'Landing Page untuk Jasa Wedding Organizer',
    description: 'Butuh landing page profesional untuk jasa wedding organizer. Harus responsif (mobile-friendly), ada section hero, layanan, portofolio, testimoni, dan form kontak. Desain elegan dengan palet warna pastel.',
    category: 'Web Development',
    budget_min: 700000,
    budget_max: 2000000,
    estimated_days: 10,
    skills_required: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    status: 'open',
  },
  {
    client_id: CLIENT_ID,
    title: 'Admin Sosial Media Instagram + TikTok (1 Bulan)',
    description: 'Cari admin sosmed yang bisa handle Instagram dan TikTok toko online kami. Tugas: posting 1x/hari di IG, 3x/minggu di TikTok, balas komentar & DM, buat konten sederhana dengan template Canva yang kami sediakan.',
    category: 'Social Media',
    budget_min: 600000,
    budget_max: 1200000,
    estimated_days: 30,
    skills_required: ['Social Media Management', 'Instagram', 'TikTok'],
    status: 'open',
  },
  {
    client_id: CLIENT_ID,
    title: 'Terjemahan Dokumen Legal Bahasa Inggris ke Indonesia',
    description: 'Butuh penerjemah untuk menerjemahkan 15 halaman dokumen kontrak bisnis dari Bahasa Inggris ke Bahasa Indonesia. Harus akurat secara legal, gaya bahasa formal. Dokumen bisa dilihat setelah setuju.',
    category: 'Terjemahan',
    budget_min: 250000,
    budget_max: 600000,
    estimated_days: 3,
    skills_required: ['Translation', 'English', 'Bahasa Indonesia'],
    status: 'open',
  },
  {
    client_id: CLIENT_ID,
    title: 'Desain UI Mobile App Pemesanan Laundry (Figma)',
    description: 'Butuh UI designer untuk merancang tampilan aplikasi mobile pemesanan laundry. Scope: onboarding (3 layar), home, pilih layanan, pemesanan, tracking, riwayat, profil. Total sekitar 15-20 layar di Figma.',
    category: 'UI/UX Design',
    budget_min: 1200000,
    budget_max: 3000000,
    estimated_days: 14,
    skills_required: ['UI Design', 'Figma', 'Mobile Design'],
    status: 'open',
  },
  {
    client_id: CLIENT_ID,
    title: 'Edit Video Promosi Produk Skincare (2-3 Menit)',
    description: 'Butuh video editor untuk mengedit video promosi produk skincare organik kami. Sudah ada footage mentah, butuh editing, color grading, tambah musik background, teks animasi, dan outro. Format akhir: MP4 1080p.',
    category: 'Video Editing',
    budget_min: 400000,
    budget_max: 1000000,
    estimated_days: 5,
    skills_required: ['Video Editing', 'Adobe Premiere', 'Color Grading'],
    status: 'open',
  },
  {
    client_id: CLIENT_ID,
    title: 'Input Data Produk ke Tokopedia & Shopee (200 SKU)',
    description: 'Butuh bantuan untuk input 200 produk ke Tokopedia dan Shopee. Data sudah tersedia dalam spreadsheet (nama produk, deskripsi, harga, stok, kategori). Upload foto juga perlu dilakukan. Butuh akurasi tinggi.',
    category: 'Data Entry',
    budget_min: 200000,
    budget_max: 500000,
    estimated_days: 5,
    skills_required: ['Data Entry', 'Tokopedia', 'Shopee'],
    status: 'open',
  },
]

async function seed() {
  console.log('🌱 Mulai seed data dummy ke Supabase...')
  console.log(`   Client ID: ${CLIENT_ID}`)
  console.log(`   Key: ${SERVICE_ROLE_KEY ? 'Service Role ✓' : 'Anon (mungkin gagal RLS)'}`)
  console.log('')

  const res = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(proyekDummy),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error(`❌ Error ${res.status}: ${err.message || res.statusText}`)
    if (res.status === 403 || err.code === '42501' || (err.message || '').includes('row-level security')) {
      console.error('')
      console.error('   Error RLS — butuh Service Role Key.')
      console.error('   Cara dapat: Supabase Dashboard → Settings → API → service_role secret')
      console.error('   Tambahkan ke .env.local: SUPABASE_SERVICE_ROLE_KEY=eyJ...')
    }
    process.exit(1)
  }

  const data = await res.json()
  console.log(`✅ Berhasil insert ${data.length} proyek:`)
  data.forEach((p, i) => console.log(`   ${i + 1}. ${p.title}`))
  console.log('')
  console.log('🎉 Seed selesai! Buka /app/jelajah untuk melihat proyek.')
}

seed().catch(err => {
  console.error('❌ Unexpected error:', err.message)
  process.exit(1)
})
