# Gawe — Catatan Teknis & Strategi
> Jawaban lengkap dari semua pertanyaan sebelum mulai development.

---

## 1. AI Toolchain & Step-by-Step Plan (1 Bulan)

### Timeline: 4 minggu realistis

Dengan 1 bulan, kamu tidak akan bisa build semua 80 halaman. Yang bisa kamu capai: **landing page + auth + freelancer onboarding + project posting + basic messaging + dummy payment flow.** Ini sudah cukup untuk demo, pitch ke investor, atau soft launch waitlist.

### AI Tools yang Harus Dipakai & Kapan

#### Minggu 1 — Setup & Design System

| Tool | Fungsi | Gratis? |
|------|--------|:-------:|
| **Claude Code** (claude.ai/code) | Setup monorepo, scaffold Next.js + Express + Prisma, generate boilerplate semua pages, auth system, database schema | Pro plan ($20/bln) |
| **Google Stitch** (stitch.withgoogle.com) | Generate high-fidelity UI screens dari prompt teks. Input: "freelancer dashboard for Indonesian freelance platform, dark navy theme" → output: Figma-ready screens atau HTML/CSS | Gratis |
| **Figma + Figma Make** | Refine UI yang di-generate Stitch, buat design system tokens, export assets | Free tier cukup |
| **v0.dev** (v0.dev by Vercel) | Generate React + Tailwind components langsung dari prompt. Misal: "project card with budget, deadline, category badge, apply button" → copy paste ke codebase | Gratis (limited) |

**Step-by-step Minggu 1:**
1. Buat design system di Figma (warna, font, spacing — kamu bilang mau buat sendiri, perfect)
2. Di Stitch: generate 5-10 screen utama (dashboard, project card, profile page, onboarding flow)
3. Di Claude Code: `git init`, setup monorepo, install dependencies, scaffold Next.js + Express + Prisma
4. Di Claude Code: generate database schema dari BRIEF_FULLSTACK.md Section 4
5. Di Claude Code: build auth system (register, login, JWT, email verify)

#### Minggu 2 — Core Features

| Tool | Fungsi |
|------|--------|
| **Claude Code** | Build freelancer onboarding, client project posting, project browsing, application flow |
| **v0.dev** | Generate individual UI components yang complex (data tables, form wizards, dashboard widgets) |
| **Cursor IDE** (cursor.sh) | AI-powered code editor — untuk debug, refactor, dan iterate cepat di codebase yang sudah ada | Free tier ada |
| **ChatGPT / Claude.ai** | Generate copywriting Indonesia, placeholder content, seed data, test scenarios |

**Step-by-step Minggu 2:**
1. Build freelancer onboarding wizard (multi-step form)
2. Build client project posting wizard
3. Build project browse page + detail page
4. Build application flow (freelancer apply ke project)
5. Build basic messaging (per project)

#### Minggu 3 — Payment, Trust, Dashboard

| Tool | Fungsi |
|------|--------|
| **Claude Code** | Midtrans integration, wallet system, trust score engine, cashflow dashboard |
| **Midtrans Sandbox** (dashboard.sandbox.midtrans.com) | Test payment flow tanpa uang nyata |
| **Recharts / v0.dev** | Generate chart components untuk cashflow dashboard |
| **Resend** (resend.com) | Email transaksional (verifikasi, notifikasi payment) — gratis 100 email/hari |

**Step-by-step Minggu 3:**
1. Integrate Midtrans Snap (sandbox mode)
2. Build escrow funding → approval → disbursement flow
3. Build wallet UI
4. Build trust score calculation + display
5. Build cashflow dashboard (basic)

#### Minggu 4 — Admin, Polish, Deploy

| Tool | Fungsi |
|------|--------|
| **Claude Code** | Admin panel, dispute UI, final fixes |
| **Sentry** (sentry.io) | Error tracking — free tier |
| **Vercel** | Deploy frontend — free tier |
| **Railway** (railway.app) | Deploy backend + PostgreSQL — $5/bln trial credit |
| **Cloudflare** | DNS, SSL — gratis |
| **Lighthouse / PageSpeed** | Audit performance & accessibility |

**Step-by-step Minggu 4:**
1. Build admin panel dasar (user list, project list, KYC queue)
2. Polish responsive design (mobile audit)
3. Fix bugs dari testing
4. Deploy ke staging → test end-to-end
5. Deploy ke production

### Summary: AI Toolchain

```
Design:
├── Google Stitch        → Generate UI screens dari prompt (GRATIS)
├── Figma + Figma Make   → Refine & build design system (GRATIS)
├── v0.dev               → Generate React components (GRATIS limited)
└── Flowstep.ai          → Alternative text-to-UI (GRATIS limited)

Code:
├── Claude Code          → Primary coder — scaffold, features, debug ($20/bln)
├── Cursor IDE           → Secondary — real-time AI pair programming (Free tier)
└── ChatGPT              → Copywriting, seed data, brainstorm (Free tier)

Backend services:
├── Midtrans Sandbox     → Test payments (GRATIS)
├── Resend               → Transactional email (GRATIS 100/day)
└── Sentry               → Error tracking (GRATIS)

Deploy:
├── Vercel               → Frontend hosting (GRATIS)
├── Railway              → Backend + DB ($5 trial credit)
└── Cloudflare           → DNS + SSL + CDN (GRATIS)
```

**Total cost bulan pertama: ~$25 (Claude Code + Railway)**

---

## 2. USP untuk Klien/Bisnis yang Mencari Pekerja

Ini yang membuat klien pilih Gawe dibanding post di Instagram atau chat teman:

### USP Utama: "Verified talent, zero risk payment"

1. **Trust Score yang transparan** — Klien tidak perlu gambling. Setiap freelancer punya skor 0–100 yang dihitung dari skill test nyata, project history, dan review. Klien bisa filter "hanya tampilkan Trust Score ≥ 60" — instant quality filter.

2. **Escrow protection** — Dana klien TIDAK langsung ke freelancer. Ditahan di platform sampai klien approve hasil kerja. Kalau tidak puas → mediasi → refund. Zero risk finansial.

3. **Brief builder yang terstruktur** — Platform memandu klien bikin brief yang jelas. Ini mengurangi miscommunication yang jadi masalah #1 di freelance. Makin jelas brief → makin bagus hasil.

4. **Talent matching otomatis** — Klien tidak perlu scroll ribuan profil. Platform recommend freelancer yang skillnya match, trust score-nya cukup, dan budget-nya sesuai.

5. **Harga transparan** — Tidak ada hidden fee. Klien bayar persis jumlah yang disepakati. Platform fee 10% ditanggung freelancer, bukan klien. Klien tahu exactly berapa yang mereka keluarkan.

6. **Micro-project friendly** — Untuk UMKM kecil yang budget-nya Rp 300rb–2jt, Gawe adalah satu-satunya platform yang seriously melayani segmen ini. Platform lain fokus ke project besar.

### Bagaimana ini dikomunikasikan di UI:
- Landing page: section khusus "Untuk bisnis" dengan 3 value props
- Klien dashboard: badge "Escrow Protected" di setiap transaksi
- Project posting: guided wizard yang mencegah brief ambigu
- Freelancer profile: Trust Score ditampilkan besar + breakdown components-nya

---

## 3. Trust Building tanpa Review Sebelumnya

Ini masalah ayam-dan-telur: butuh review untuk dapat klien, butuh klien untuk dapat review. Solusinya:

### Layer 1: Pre-project trust signals (hari pertama daftar)

**Skill Test + Trust Score**
- Freelancer baru ambil skill test (15 menit, gratis)
- Hasil tes langsung menjadi komponen Trust Score
- Skor tes ditampilkan di profil: "Skill test UI Design: 87/100"
- Klien bisa lihat ini sebagai bukti kemampuan tanpa perlu portofolio

**Profile Completeness Score**
- Profil yang lengkap (bio, foto, skill, jam kerja, lokasi) mendapat visual indicator
- "Profil 95% lengkap" — signal bahwa freelancer ini serius

**KYC Verification Badge**
- Badge "Identitas Terverifikasi" — KTP sudah di-check
- Ini besar untuk trust di Indonesia — klien tahu ini orang beneran

**Response Time Badge**
- "Rata-rata membalas dalam 2 jam" — automatically tracked
- Menunjukkan profesionalisme tanpa perlu review

### Layer 2: Early reputation building

**Micro-project dengan review otomatis**
- Setelah project pertama selesai, sistem otomatis minta review dari klien
- Review ini langsung muncul di profil
- Platform bisa seed initial projects (Gawe sendiri post project kecil untuk freelancer baru)

**Gawe Verified Project**
- Platform bisa buat "Gawe Challenge" — project kecil gratis dari Gawe sendiri
- Freelancer yang selesaikan challenge dapat badge "Gawe Verified"
- Ini seperti "first job" yang diberikan platform

### Layer 3: Visual design yang membangun trust

**Profil page harus include:**
```
┌─────────────────────────────────────────┐
│ [Avatar]  Rizky Ananda                  │
│           UI Designer · Bandung          │
│                                          │
│ Trust Score  ████████░░  82/100          │
│                                          │
│ ✓ Identitas terverifikasi               │
│ ✓ Skill test: UI Design 87/100          │
│ ✓ Skill test: Figma 92/100             │
│ ✓ Rata-rata respon: 1.5 jam             │
│                                          │
│ ── Tentang ──                           │
│ "Desainer UI dengan fokus pada mobile    │
│  app untuk UMKM di Indonesia..."         │
│                                          │
│ ── Portofolio ──                         │
│ [thumbnails dari completed projects]     │
│ (kosong → "Belum ada portofolio.         │
│  Portofolio akan terisi otomatis setelah │
│  menyelesaikan proyek di Gawe.")         │
│                                          │
│ ── Review ──                             │
│ (kosong → "Belum ada review.             │
│  Review akan muncul setelah proyek       │
│  pertama selesai.")                      │
│                                          │
│ ── Scorecard ──                          │
│ Komunikasi   : ★★★★★ (dari skill test)  │
│ Ketepatan    : -                         │
│ Kualitas     : -                         │
│ Profesional  : ★★★★★ (dari KYC + respon)│
└─────────────────────────────────────────┘
```

Empty states yang informatif lebih baik daripada sembunyi — klien tahu mereka baru tapi terverifikasi.

---

## 4. Algoritma Matching Proyek

Ya, ini harus ada. Ini salah satu USP terpenting Gawe.

### Bagaimana algoritmanya bekerja:

**Input signals dari freelancer:**
- Skills yang di-declare (dari profil + skill test results)
- Budget range preference (min project budget)
- Category interest (saat onboarding pilih 3–5 kategori)
- Availability (full-time / part-time / weekends)
- Lokasi (untuk project lokal yang butuh tatap muka)
- Trust Score (determines eligible project tier)
- Past project categories (jika ada)

**Input signals dari project:**
- Required skills
- Budget range
- Timeline / urgency
- Category
- Client's preferred freelancer level (jika ada)

**Matching score formula:**
```
matchScore = (
  skillOverlap       * 0.35  +  // berapa skill yang cocok
  budgetFit          * 0.20  +  // budget sesuai preferensi freelancer
  categoryMatch      * 0.20  +  // kategori sesuai minat
  trustScoreEligible * 0.15  +  // trust score cukup untuk tier project
  availabilityFit    * 0.10     // jam kerja cocok dengan timeline
)
```

**Display logic di `/app/jelajah`:**
1. Default sort: by matchScore descending
2. Label on cards: "95% cocok", "87% cocok", "72% cocok"
3. Filter bar: kategori, budget range, deadline
4. "Rekomendasi untukmu" section di dashboard — top 5 matches

**Implementation:**
- Phase 1 (MVP): simple weighted scoring di database query (SQL)
- Phase 2: machine learning model trained on successful project completions
- Phase 3: collaborative filtering ("freelancer seperti kamu juga apply ke proyek ini")

---

## 5. Testing/Assessment Page untuk Freelancer Baru

**Ya, ini ada dan ini krusial.** Letaknya di onboarding flow dan bisa diakses ulang kapanpun.

### Flow:
```
Daftar → Buat profil → [SKILL TEST PAGE] → Dashboard
                              ↑
                    Bisa diakses ulang via /app/profil/skill-test
```

### Bagaimana skill test bekerja:

**Page: `/app/profil/skill-test`**
- List semua skill test yang tersedia per kategori
- Status: "Belum diambil" / "Lulus (87/100)" / "Tidak lulus (55/100 — coba lagi dalam 7 hari)"
- Setiap test: 15–20 menit, 20 pertanyaan, pilihan ganda + case study singkat

**Kategori test awal (MVP — 10 kategori):**
1. UI Design
2. Graphic Design
3. Content Writing (Bahasa Indonesia)
4. Content Writing (English)
5. Social Media Management
6. Web Development (Frontend)
7. Web Development (Backend)
8. Data Entry & Admin
9. Translation (EN-ID)
10. Video Editing

**Format pertanyaan:**
- 70% multiple choice (pengetahuan)
- 20% case study mini (penilaian situasional)
- 10% practical output review (misal: "mana desain yang lebih baik dari dua opsi ini?")

**Anti-cheat measures:**
- Timer per pertanyaan (tidak bisa buka tab lain dan googling)
- Randomized question order dan option order
- Pool 50+ soal per test, setiap attempt ambil 20 random
- Cooldown 7 hari setelah gagal (mencegah brute force)
- Flag jika selesai terlalu cepat (< 5 menit untuk 20 soal)

**Hasil tes → Trust Score:**
- Passed (≥70): +5 poin Trust Score per test (max 25 total dari tests)
- Score ≥90: +6 poin (bonus untuk excellence)
- Displayed on profile: "UI Design: 87/100 ✓"
- Badge: "Terverifikasi dalam UI Design"

**Siapa yang buat soalnya?**
- Phase 1: Founder/tim Gawe buat manual (10 test × 50 soal = 500 soal total)
- Phase 2: Community-contributed questions (peer review model)
- Phase 3: AI-generated questions reviewed by experts

---

## 6. Dual Role: Freelancer + Client dalam Satu Akun

**Ya, satu email bisa jadi keduanya.** Ini design decision yang sudah ada di brief.

### Implementasi:
- Satu `User` record di database, field `roles` berisi array: `["FREELANCER", "CLIENT"]`
- Saat pertama daftar, user pilih role utama
- Kapan saja bisa "aktifkan" role kedua via settings
- Di navbar: toggle switch "Mode Freelancer" ↔ "Mode Klien"
- Dashboard, menu, dan fitur berubah sesuai mode aktif
- URL prefix berbeda: `/app/*` (freelancer) vs `/klien/*` (client)

### Kenapa ini penting:
- Banyak freelancer juga punya UMKM dan butuh hire freelancer lain
- Mengurangi friction — tidak perlu bikin akun baru
- Lebih banyak engagement per user = lebih valuable per user

### Edge case yang harus di-handle:
- User TIDAK bisa apply ke project yang dia sendiri post
- Review dari "diri sendiri" di-block
- Wallet shared (satu wallet per user, bukan per role)
- Notifications dibedakan per context (as freelancer vs as client)

---

## 7. Deployment Gratis — Di Mana & Bagaimana

**Ya, bisa deploy gratis** untuk tahap awal. Ini breakdown-nya:

### Stack deployment gratis:

| Komponen | Platform | Tier Gratis | Limit |
|----------|----------|-------------|-------|
| Frontend (Next.js) | **Vercel** | Hobby (free) | 100 GB bandwidth/bln, unlimited deploys |
| Backend (Express) | **Render** | Free tier | 750 jam/bln, spin down setelah idle 15 min |
| Database (PostgreSQL) | **Neon** | Free tier | 0.5 GB storage, 1 project, auto-suspend |
| Redis (cache/queue) | **Upstash** | Free tier | 10K commands/hari |
| File storage | **Cloudflare R2** | Free tier | 10 GB storage, 10M reads/bln |
| Email | **Resend** | Free tier | 100 email/hari, 1 domain |
| DNS + SSL | **Cloudflare** | Free forever | Unlimited |
| Error tracking | **Sentry** | Free tier | 5K events/bln |
| Analytics | **Plausible CE** (self-host) atau **Umami** | Free (self-host) | Unlimited |

### Limitasi penting:
- **Render free tier**: backend "sleep" setelah 15 menit idle → cold start 30–50 detik. Untuk MVP/demo ini OK, untuk production harus upgrade ($7/bln).
- **Neon free tier**: database auto-suspend setelah idle → cold start 3–5 detik. Bisa mitigasi dengan keep-alive cron job.
- **Vercel Hobby**: tidak bisa pakai custom domain untuk production (harus Pro $20/bln untuk gawe.id custom domain). Tapi `.vercel.app` subdomain gratis.

### Alternatif: Railway ($5 trial credit)
Railway lebih reliable daripada Render free tier — tidak ada sleep, PostgreSQL included. $5 trial credit bisa cukup untuk 2–3 minggu development + testing.

### Rekomendasi deployment path:
```
Development & Demo  : Vercel (free) + Neon (free) + Render (free)    = $0
Soft Launch (beta)  : Vercel (free) + Railway ($5-10/bln)            = $5-10/bln
Production Launch   : Vercel Pro ($20) + Railway ($10-20) + R2 (free) = $30-40/bln
```

### Step-by-step deploy:

1. **Push code ke GitHub** (private repo)
2. **Neon**: buat project baru → dapat DATABASE_URL → run `prisma migrate deploy`
3. **Render**: connect GitHub repo → set environment variables → auto deploy
4. **Vercel**: connect GitHub repo → auto detect Next.js → deploy
5. **Cloudflare**: tambah domain gawe.id → point DNS ke Vercel
6. **Upstash**: buat Redis instance → set REDIS_URL di Render
7. Test end-to-end di staging URL

---

## 8. Rekomendasi AI untuk UI/UX Design

Karena kamu mau buat brand style sendiri, ini tools AI yang paling cocok:

### Tier 1 — Wajib pakai

| Tool | Fungsi | Harga |
|------|--------|-------|
| **Google Stitch** (stitch.withgoogle.com) | Text-to-UI paling powerful saat ini. Input prompt → output high-fidelity screen. Export ke Figma. Cocok untuk generate initial screens cepat. | Gratis |
| **Figma + Figma Make** | Refine screen dari Stitch, build design system, prototyping, export. Figma Make bisa generate komponen dari prompt di dalam Figma. | Free tier |
| **v0.dev** | Vercel's AI yang generate React + Tailwind code dari prompt. Copy paste langsung ke codebase. Best untuk individual components. | Free (10 gen/hari) |

### Tier 2 — Tambahan berguna

| Tool | Fungsi | Harga |
|------|--------|-------|
| **Flowstep.ai** | Text-to-UI yang export langsung ke React + TypeScript + Tailwind. Lebih code-ready dari Stitch. | Free tier |
| **UXPilot** | Generate wireframes dan user flows dari prompt. Bagus untuk planning UX sebelum visual design. | Free tier |
| **Realtime Colors** (realtimecolors.com) | Preview color palette langsung di mock website. Instant feedback untuk brand colors. | Gratis |
| **Fontjoy** (fontjoy.com) | AI font pairing — input satu font, generate pasangan yang cocok. | Gratis |
| **Coolors** (coolors.co) | Generate color palette, check contrast ratio, export. | Gratis |

### Tier 3 — Untuk asset spesifik

| Tool | Fungsi | Harga |
|------|--------|-------|
| **Midjourney / DALL-E** | Generate ilustrasi custom, hero images, icon concepts | $10/bln |
| **Recraft.ai** | Generate vector icons dan illustrations yang konsisten stylistically | Free tier |
| **Shots.so** | Create beautiful mockups (phone, browser) untuk landing page | Free tier |

### Workflow yang direkomendasikan:

```
1. Realtime Colors → tentukan color palette
2. Fontjoy → pilih font pairing
3. UXPilot → generate user flow diagrams
4. Google Stitch → generate screens dari flow
5. Figma → refine, build design tokens, create components
6. v0.dev → convert screen sections jadi React code
7. Claude Code → assemble jadi full pages
```

---

## 9. Strategi Monetisasi & Anggaran

### Model Monetisasi Utama

#### Revenue Stream 1: Komisi Proyek (Primary — 90% revenue)

**Mekanisme:** 10% dari nilai proyek, dipotong otomatis dari pembayaran freelancer saat dana cair.

**Contoh:**
- Proyek Rp 1.000.000 → Freelancer terima Rp 900.000, Gawe terima Rp 100.000
- Proyek Rp 5.000.000 → Freelancer terima Rp 4.500.000, Gawe terima Rp 500.000

**Tier komisi (loyalty incentive):**
```
0–5 proyek selesai    : 10% komisi
6–15 proyek selesai   : 8% komisi
16–30 proyek selesai  : 6% komisi
31+ proyek selesai    : 5% komisi (floor)
```

**Proyeksi revenue (Year 1):**
```
Asumsi konservatif:
- 500 freelancer aktif
- Rata-rata 2 proyek/bulan per freelancer
- Rata-rata nilai proyek: Rp 800.000
- Rata-rata komisi: 9% (blended rate)

Monthly GMV     = 500 × 2 × Rp 800.000 = Rp 800.000.000 (Rp 800jt)
Monthly Revenue = Rp 800jt × 9% = Rp 72.000.000 (Rp 72jt/bulan)
Annual Revenue  = Rp 72jt × 12 = Rp 864.000.000 (± Rp 864jt/tahun)
```

**Kenapa ini berhasil:**
- Zero risk untuk freelancer (bayar hanya kalau sudah dapat bayaran)
- Competitive rate (Sribu ~15-20%, Fiverr 20%, Upwork 10-20%)
- Loyalty tier membuat freelancer senior tetap di platform (churn reduction)
- Escrow creates lock-in — transaksi HARUS via platform

#### Revenue Stream 2: Premium Features (Future — 5% revenue)

**Gawe Pro untuk freelancer (Rp 99.000/bulan):**
- Unlimited skill tests (free tier: 3 per bulan)
- Priority listing di search results
- Advanced cashflow analytics (90 day projection, category breakdown)
- Custom invoice branding
- Priority support

**Gawe Business untuk klien (Rp 199.000/bulan):**
- Unlimited project postings (free tier: 5 per bulan)
- Private project posting (invite-only, tidak publik)
- Dedicated account manager (for >Rp 10jt/bulan spend)
- API access untuk integrasi ke sistem mereka
- Bulk hiring tools

#### Revenue Stream 3: Featured Listings (Future — 5% revenue)

**Promoted Projects:**
- Klien bayar Rp 50.000–200.000 untuk "pin" project di atas search results selama 7 hari
- Label "Promoted" transparan — freelancer tahu ini promoted

**Promoted Profiles:**
- Freelancer bayar Rp 50.000/minggu untuk muncul di "Freelancer Pilihan" section
- Hanya available untuk Trust Score ≥ 70 (quality control)

### Anggaran Operasional Bulanan

```
PENGELUARAN (Monthly, setelah launch)
═══════════════════════════════════════════════════════════
Infrastruktur
├── Vercel Pro                    Rp    320.000  ($20)
├── Railway (backend + DB)        Rp    240.000  ($15)
├── Cloudflare R2                 Rp          0  (free tier)
├── Upstash Redis                 Rp          0  (free tier)
├── Resend email                  Rp          0  (free tier)
├── Sentry                        Rp          0  (free tier)
└── Domain (gawe.id)              Rp     25.000  (annualized)
                                  ─────────────
Subtotal Infrastruktur            Rp    585.000/bulan

Operational
├── Midtrans fee (2.9% per trx)   Rp 23.200.000  (dari Rp 800jt GMV)
├── OTP/SMS (Twilio)              Rp  1.600.000  (1000 OTP × $0.10)
├── KYC verification (Verihubs)   Rp  2.500.000  (500 verifikasi × Rp 5.000)
└── Miscellaneous                 Rp    500.000
                                  ─────────────
Subtotal Operational              Rp 27.800.000/bulan

Team (minimum viable)
├── 1 Full-stack dev (founder)    Rp          0  (equity)
├── 1 Part-time dev               Rp  8.000.000
├── 1 Community/support           Rp  5.000.000
└── 1 Content/marketing           Rp  5.000.000
                                  ─────────────
Subtotal Team                     Rp 18.000.000/bulan

Marketing
├── Google Ads (targeted)         Rp  5.000.000
├── Social media content          Rp  2.000.000
└── Community events              Rp  1.000.000
                                  ─────────────
Subtotal Marketing                Rp  8.000.000/bulan

═══════════════════════════════════════════════════════════
TOTAL PENGELUARAN                 Rp 54.385.000/bulan

PENDAPATAN
├── Komisi 9% dari GMV            Rp 72.000.000/bulan
└── Premium (conservative)        Rp  3.000.000/bulan
                                  ─────────────
TOTAL PENDAPATAN                  Rp 75.000.000/bulan

═══════════════════════════════════════════════════════════
NET PROFIT                        Rp 20.615.000/bulan
Margin                            ~27%
```

### Risiko & Contingency

#### Risiko 1: Tidak cukup freelancer yang daftar
**Probabilitas:** Tinggi di bulan 1–3
**Impact:** Tidak ada transaksi = tidak ada revenue
**Solusi:**
- Pre-launch: build waitlist 500+ orang via Instagram/TikTok content
- Week 1–4: manual onboarding — DM 100 freelancer di LinkedIn/Instagram, tawarkan fee waiver
- Platform-funded projects: Gawe sendiri post 20–30 proyek kecil (Rp 200rb–500rb) untuk bootstrap activity
- Budget untuk ini: Rp 10.000.000 (one-time "seeding" cost)

#### Risiko 2: Klien tidak mau bayar lewat platform (bypass ke direct)
**Probabilitas:** Sedang
**Impact:** Revenue loss
**Solusi:**
- Escrow protection yang HANYA tersedia lewat platform — ini USP yang tidak bisa di-bypass
- Trust Score hanya naik dari project dalam platform
- Invoice resmi hanya dari platform
- Review hanya dari project dalam platform
- Jika ketahuan bypass: warning → suspend

#### Risiko 3: Dispute rate tinggi, biaya mediasi membengkak
**Probabilitas:** Sedang
**Impact:** Operational cost naik + reputasi turun
**Solusi:**
- Brief builder yang ketat mencegah miscommunication (pencegahan)
- Milestone-based escrow (Phase 2) — mengurangi nilai dispute
- Automated dispute resolution untuk kasus kecil (<Rp 500rb)
- Cap refund di bulan pertama: max 3 refund per klien

#### Risiko 4: Midtrans fee memakan margin
**Probabilitas:** Pasti (ini biaya tetap)
**Impact:** 2.9% dari GMV = significant cost
**Solusi:**
- Negosiasi rate dengan Midtrans setelah volume naik (bisa turun ke 2.0–2.5%)
- Encourage VA payment (fee lebih rendah dari credit card)
- Minimum project value Rp 200rb (di bawah ini, fee proportion terlalu tinggi)

#### Risiko 5: Platform tidak bisa compete dengan Sribu/Fastwork
**Probabilitas:** Rendah jika diferensiasi jelas
**Impact:** Slow growth
**Solusi:**
- Jangan compete head-to-head — Gawe BUKAN untuk freelancer berpengalaman
- Focus 100% pada segmen pemula yang diabaikan kompetitor
- Community building: WhatsApp groups, meetups, content education
- Feature yang kompetitor tidak punya: cashflow dashboard, trust score

### Break-even Analysis
```
Monthly fixed costs         : Rp 27.000.000 (infra + team + marketing, tanpa Midtrans variable)
Average project value       : Rp 800.000
Platform take per project   : Rp 72.000 (9%)
Midtrans cost per project   : Rp 23.200 (2.9%)
Net take per project        : Rp 48.800

Break-even projects/month   : Rp 27.000.000 / Rp 48.800 = ~553 proyek/bulan
Break-even freelancers needed: 553 / 2 proyek per freelancer = ~277 freelancer aktif

Target: 277 freelancer aktif untuk break even.
Dengan 500 freelancer aktif → profitable.
```

### Path to Rp 1 Miliar/tahun Revenue
```
Butuh: ~1.400 freelancer aktif × 2 proyek/bulan × Rp 800rb × 9%
= Rp 1.008.000.000/tahun

Realistic? Ya, jika:
- Year 1: focus on 3 kota (Jakarta, Bandung, Surabaya)
- Year 1 target: 500 freelancer aktif (break even)
- Year 2 target: 1.500 freelancer aktif (profitable)
- Year 3 target: 5.000+ → consider institutional investors
```

---

## Ringkasan Keputusan

| Pertanyaan | Jawaban |
|------------|---------|
| AI tools yang dipakai | Claude Code (code), Stitch (UI), v0.dev (components), Figma (design system) |
| USP untuk klien | Escrow protection + Trust Score + brief builder + matching algorithm |
| Trust tanpa review | Skill test + KYC badge + response time + profile completeness |
| Algoritma matching | Weighted scoring (skill overlap, budget, category, trust, availability) |
| Skill test page | Ya, ada di onboarding + accessible anytime via profil |
| Dual role 1 akun | Ya, toggle mode "Freelancer" ↔ "Klien" |
| Deploy gratis | Ya: Vercel (free) + Neon (free) + Render (free) = $0 |
| AI untuk UI/UX | Stitch + Figma Make + v0.dev + Flowstep + Realtime Colors |
| Monetisasi | Komisi 10% (turun bertahap), break even di 277 freelancer aktif |
| Brand style | Kamu buat sendiri — tools rekomendasi sudah disediakan |
