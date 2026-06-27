# Gawe — Landing Page & Product Brief
> Dokumen master untuk membangun landing page dan full-stack platform Gawe.
> Berisi: product context, brand system, landing page copywriting, feature specs, payment flow, trust system, pricing strategy, dan technical requirements.
> Baca seluruh dokumen sebelum menulis satu baris kode pun.

**Version:** 2.0 — Updated Mei 2026
**Status:** Pre-development
**Related docs:** BRIEF_FULLSTACK.md (database schema, 80 pages, admin specs), GAWE_CATATAN_STRATEGI.md (monetisasi detail, break-even, risk analysis)

---

## Daftar Isi

1. Tentang Gawe
2. Brand System
3. Tone of Voice
4. User Roles & Dual Account System
5. USP untuk Klien/Bisnis
6. Trust System — Profil tanpa Portofolio
7. Smart Matching Algorithm
8. Skill Test System
9. Payment & Escrow Flow
10. Pricing & Monetisasi
11. Landing Page — 10 Sections
12. Technical Requirements
13. Deployment (Gratis)
14. AI Toolchain & Dev Plan (1 Bulan)
15. Prompts untuk Claude Code

---

## 1. Tentang Gawe

**Gawe** adalah platform freelance pertama di Indonesia yang dirancang khusus untuk pemula — orang yang baru mulai, belum punya portofolio, dan kesulitan mengelola cashflow dari proyek pertama mereka.

**Tagline:** "Yuk gawe bareng"
**Domain:** gawe.id
**Arti nama:** "Gawe" dari bahasa Jawa = kerja/buat. Sudah jadi slang nasional Gen Z.

**Positioning:** Platform all-in-one untuk freelancer & side hustler Indonesia: bangun reputasi → dapat proyek → kelola bayaran → tumbuh. Semua dalam satu tempat, dirancang untuk yang baru mulai.

**Target pengguna:**
- Freelancer pemula: fresh grad, mahasiswa, karyawan yang mau side hustle
- Klien/UMKM: bisnis kecil yang butuh freelancer terpercaya dengan budget terbatas (Rp 100rb–5jt)

**Kompetitor & diferensiasi:**

| Platform | Kelebihan | Kelemahan vs Gawe |
|----------|-----------|-------------------|
| Sribu | Brand lokal kuat, escrow | Fokus kreator berpengalaman, tidak ada financial tools |
| Fastwork | UI modern, bidding simpel | Bukan lokal asli, pencairan lambat |
| Fiverr / Upwork | Pasar global, trust matang | English-only, kompetisi terlalu ketat |
| Glints | Portofolio digital, Gen Z | Bukan freelance murni |

**Tiga celah pasar yang Gawe isi:**
1. Tidak ada platform yang fokus pada "klien pertama" secara sistematis
2. Nol platform yang punya cashflow tools terintegrasi
3. Tidak ada yang dirancang untuk segmen side hustler

---

## 2. Brand System

### CATATAN PENTING
Brand style akan dibuat sendiri oleh founder di Figma. Semua warna, logo, dan visual di bawah ini adalah PLACEHOLDER. Ganti seluruh sistem ini dengan design system final sebelum build production.

### Warna (placeholder)
```
Primary (Indigo)    : #4F6EF7   → semua CTA, active state, links
Indigo Lite         : #7B94FF   → hover, icon, secondary accent
Indigo Deep (tint)  : #1E2E6B   → badge background, card tint
Indigo Glow         : #1B2552   → subtle bg glow effect

Violet (secondary)  : #8B5CF6   → secondary actions, accent
Violet Lite         : #A78BFA   → subtle violet

Cyan (cashflow)     : #22D3EE   → income indicators, data, cashflow

Navy (page bg)      : #0A0E1A   → main dark background
Navy Card           : #111827   → card surface
Navy Raised         : #1A2235   → elevated elements
Navy Border         : #243044   → subtle borders

White (text)        : #F8FAFF   → primary text on dark bg
Gray 80             : #B4C2D8   → secondary text
Gray 50             : #6B7A99   → captions, meta, placeholders
Gray 20             : #2A3654   → dividers on dark
```

### Komposisi warna (rasio)
- 50% Navy — page background
- 20% Navy Card — card surfaces
- 10% Gray 20 — dividers, subtle surfaces
- 10% Indigo — primary actions & highlights
- 6% Violet — secondary accent
- 4% Cyan — cashflow/income data

### Typography
```
Display / Heading  : Outfit Bold (Google Fonts)
Body / UI          : Work Sans Regular & Bold (Google Fonts)
Code / Mono labels : Geist Mono (Google Fonts)
```

**Import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&family=Work+Sans:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

**Type scale:**
```
Display  : Outfit Bold, 48–64px, line-height 1.05, letter-spacing -0.5px
H1       : Outfit Bold, 36–40px, line-height 1.1
H2       : Outfit Bold, 24–28px, line-height 1.2
H3/Label : Work Sans Bold / Outfit Bold, 16–18px
Body     : Work Sans Regular, 16px, line-height 1.65
Caption  : Work Sans Regular, 13–14px, line-height 1.5
```

### Logo (placeholder — Gemini-generated)
Outer circle arc ~300° dengan arrowhead upper-right, inner "g" stylized arc dengan tail. Warna mengikuti primary color dari brand system final.

```svg
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 29.5 8.5 A 13.5 13.5 0 1 0 31.2 12.8" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  <path d="M 28.5 7.2 L 31.5 10.5 L 34.2 8.0" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M 24 16 A 6 6 0 1 0 26 23 L 26 25.5 Q 26 28 22 28" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/>
</svg>
```

**Wordmark:** "gawe" dalam Outfit Bold.

### CSS Custom Properties
```css
:root {
  --navy: #0A0E1A;
  --navy-card: #111827;
  --navy-raised: #1A2235;
  --navy-border: #243044;
  --indigo: #4F6EF7;
  --indigo-lite: #7B94FF;
  --indigo-pale: #1E2E6B;
  --indigo-glow: #1B2552;
  --violet: #8B5CF6;
  --violet-lite: #A78BFA;
  --cyan: #22D3EE;
  --white: #F8FAFF;
  --gray-80: #B4C2D8;
  --gray-50: #6B7A99;
  --gray-20: #2A3654;
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Work Sans', sans-serif;
}
```

---

## 3. Tone of Voice

**Karakter:** Teman senior yang sudah pernah gagal — bukan mentor yang sok tahu, bukan platform korporat.

**Gawe bicara:** Langsung (tidak bertele-tele), Jujur (tidak pura-pura mudah), Hangat (selalu ada semangat di balik kata).

**Gawe TIDAK bicara:** Formal/korporat, pakai jargon ("solusi komprehensif", "ekosistem terintegrasi"), menggurui.

**Bahasa:** Indonesia. "kamu" bukan "Anda". Kalimat pendek. Tidak ada filler.

---

## 4. User Roles & Dual Account System

### Satu akun, dua peran
Satu email bisa jadi freelancer DAN klien sekaligus.

**Implementasi:**
- Satu User record, field roles berisi array: ["FREELANCER", "CLIENT"]
- Saat daftar: pilih role utama. Role kedua diaktifkan kapan saja via settings.
- Navbar: toggle switch "Mode Freelancer" ↔ "Mode Klien"
- Dashboard, menu, fitur berubah sesuai mode aktif
- URL: /app/* (freelancer) vs /klien/* (client)
- Wallet shared per user

**Edge cases:**
- User TIDAK bisa apply ke project sendiri
- Self-review di-block
- Notifications dibedakan per context

### Verification Levels
- Level 0 — Email only. Browse saja.
- Level 1 — Phone OTP. Apply proyek <Rp 500rb.
- Level 2 — KYC (KTP + selfie). Semua transaksi.
- Level 3 — Business (NPWP + dokumen). Klien UMKM resmi.

---

## 5. USP untuk Klien/Bisnis

1. **Trust Score transparan** — skor 0–100 dari skill test + project history + review. Filter "hanya Trust Score ≥ 60".
2. **Escrow protection** — dana ditahan sampai approve. Zero risk finansial.
3. **Brief builder terstruktur** — guided wizard mencegah miscommunication.
4. **Smart matching** — platform recommend freelancer yang cocok otomatis.
5. **Harga transparan** — fee 10% ditanggung freelancer, klien bayar exact amount.
6. **Micro-project friendly** — Rp 200rb–2jt dilayani serius.

---

## 6. Trust System — Profil tanpa Portofolio

### Layer 1: Pre-project (hari pertama)
- Skill Test → Trust Score (skor tes ditampilkan: "UI Design: 87/100")
- Profile Completeness: "Profil 95% lengkap"
- KYC Badge: "Identitas Terverifikasi"
- Response Time: "Rata-rata membalas dalam 2 jam"

### Layer 2: Early reputation
- Micro-project dengan review otomatis
- "Gawe Challenge" — project kecil dari Gawe → badge "Gawe Verified"

### Layer 3: Profil page
```
[Avatar] Rizky Ananda · UI Designer · Bandung
Trust Score ████████░░ 82/100
✓ Identitas terverifikasi
✓ Skill test: UI Design 87/100, Figma 92/100
✓ Rata-rata respon: 1.5 jam

── Portofolio ──
(kosong → "Portofolio terisi otomatis setelah proyek selesai")

── Review ──
(kosong → "Review muncul setelah proyek pertama selesai")

── Scorecard ──
Komunikasi: ★★★★★ | Ketepatan: - | Kualitas: - | Profesional: ★★★★★
```

### Trust Score Formula (0–100)
```
KYC(0-20) + SkillTests(0-25) + Projects(0-30) + Reviews(0-15) + Activity(0-10)
```

### Badges
new, verified, rising_star, top_rated, quick_responder, category_specialist

---

## 7. Smart Matching Algorithm

### Formula
```
matchScore = (
  skillOverlap       × 0.35 +
  budgetFit          × 0.20 +
  categoryMatch      × 0.20 +
  trustScoreEligible × 0.15 +
  availabilityFit    × 0.10
)
```

### Display
- Sort by matchScore descending
- Label: "95% cocok", "87% cocok"
- Dashboard section: "Rekomendasi untukmu" — top 5

---

## 8. Skill Test System

### Flow
Daftar → Profil → **Skill Test Page** → Dashboard
(accessible anytime via /app/profil/skill-test)

### Format
- 15–20 menit, 20 pertanyaan per test
- 70% multiple choice, 20% case study, 10% practical review
- Passing: ≥70/100. Cooldown 7 hari setelah gagal.

### 10 Kategori (MVP)
UI Design, Graphic Design, Content Writing ID, Content Writing EN, Social Media, Frontend Dev, Backend Dev, Data Entry, Translation EN-ID, Video Editing

### Anti-cheat
Timer per pertanyaan, random order, pool 50+ soal, flag jika <5 menit

### Hasil → Trust Score
Passed: +5 poin per test (max 25). Score ≥90: +6 poin bonus.

---

## 9. Payment & Escrow Flow

### Full Escrow via Midtrans

```
DRAFT → OPEN → AWARDED → [client funds] → FUNDED → IN_PROGRESS
→ [freelancer submits] → SUBMITTED
→ client approves → COMPLETED → disbursement
→ client revises → REVISION → back to IN_PROGRESS
→ dispute → DISPUTED → admin mediasi
```

**Methods:** VA (BCA, Mandiri, BRI, BNI), GoPay, OVO, Dana, ShopeePay, QRIS, kartu.
**Disbursement:** Midtrans Iris → rekening bank freelancer.
**Hold period:** 24 jam setelah client approve.
**Min withdrawal:** Rp 50.000. Fee: Rp 4.000/transaksi.
**Approval:** ≤Rp 5jt auto, >Rp 5jt Finance Admin, >Rp 50jt Super Admin.

---

## 10. Pricing & Monetisasi

### Komisi (primary revenue — 90%)
10% dari nilai proyek, dipotong otomatis dari freelancer.

**Loyalty tiers:**
0–5 proyek: 10% | 6–15: 8% | 16–30: 6% | 31+: 5%

**Contoh:** Rp 1.000.000 → freelancer terima Rp 900.000.

### Break-even
Fixed costs Rp 27jt/bln ÷ Rp 48.800 net per project = **~277 freelancer aktif**

### Year 1 projection
500 freelancer × 2 proyek/bln × Rp 800rb × 9% = **Rp 72jt/bulan (Rp 864jt/tahun)**

---

## 11. Landing Page — 10 Sections

### Section 01 — Navbar
Sticky. Transparent → solid Navy after scroll 60px. 300ms transition.
- Logo + wordmark "gawe"
- Links: Cara kerja · Fitur · Harga · Cerita kami
- CTA: Masuk (text), Daftar gratis (button indigo)

### Section 02 — Hero
Background: Navy. Grid pattern overlay 5%.

**Headline:**
```
Skill ada.
Klien belum ada.
Gawe bantu itu.
```
Outfit Bold, 56–64px, White, line-height 1.05.

**Subheadline:**
```
Platform freelance pertama Indonesia yang membantu kamu dapat proyek dari nol —
dan memastikan bayaranmu masuk tepat waktu.
```
Work Sans, 18px, Gray 80.

**CTA primer:** `Mulai gawe sekarang` (Indigo bg). Sub: "Gratis selamanya · Tanpa kartu kredit"
**CTA sekunder:** `Cari freelancer →` (outline Indigo). Sub: "Post proyek dalam 5 menit"
**Trust bar:** "Bergabung dengan 2.400+ freelancer yang sudah mulai gawe." + avatar circles.
**Visual:** Mockup cards: Trust Score 82/100, project card, cashflow indicator.

### Section 03 — Stat Bar
Background: Navy Card.

| 2.400+ | < 14 jam | 4.8 / 5 | Rp 1,2M |
|--------|----------|---------|---------|
| Freelancer aktif | Waktu dapat proyek pertama | Rating klien | Total bayaran cair |

### Section 04 — Pain Point
Background: Navy.
**Headline:** "Kamu bukan satu-satunya yang ngerasa gini."

**Freelancer:**
- "Sudah daftar di mana-mana, tapi tidak ada yang masuk."
- "Klien bilang 'portofoliomu kurang' — padahal skill ada, cuma belum ada yang kasih kesempatan."
- "Udah kerja, tapi akhir bulan bingung uangnya ke mana."
- "Takut undercharge, tapi kalau mahal nanti nggak dapet klien."

**Klien:**
- "Sudah bayar, hasilnya nggak sesuai brief."
- "Freelancer tiba-tiba ghosting setelah DP masuk."
- "Bingung cara bedain yang beneran bisa kerja sama yang cuma bisa ngomong."
- "Butuh hasil cepat, tapi budget terbatas — nggak tahu harus mulai dari mana."

**Bridge:** "Ini bukan salah kamu. Sistemnya yang belum berpihak ke yang baru mulai." (Indigo)

### Section 05 — Features
Background: Navy Card.
**Headline:** "Gawe beda bukan karena fiturnya. Tapi karena tahu kamu mulai dari mana."

**Pilar 1 — Trust from Zero:** "Buktikan kemampuanmu — bahkan sebelum punya klien pertama." Trust Score transparan, skill test, badge terverifikasi, proyek sesuai level.

**Pilar 2 — Smart Matching + Micro-project:** "Proyek kecil yang serius. Cocok dengan skillmu. Bayaran nyata." Proyek Rp 200rb–5jt, algoritma matching otomatis, brief terstruktur, review otomatis.

**Pilar 3 — Cashflow + Escrow:** "Tahu kapan aman. Bayaran dijamin masuk." Dashboard sederhana (pemasukan, proyeksi, status), invoice otomatis, escrow protection.

### Section 06 — How It Works
Background: Navy.
**Headline:** "Dari daftar ke bayaran pertama — dalam hitungan hari."

**Tab Freelancer (4 steps):**
1. Buat profil dalam 10 menit
2. Ambil skill test — 15 menit
3. Ambil proyek pertamamu (platform match otomatis)
4. Selesai. Bayaran masuk via escrow. Ulangi.

**Tab Klien (4 steps):**
1. Post proyek dalam 5 menit (guided brief)
2. Pilih dari freelancer terverifikasi (Trust Score visible)
3. Kerja sama dalam platform (escrow aman)
4. Approve dan selesai

### Section 07 — Testimonials
Background: Navy Card.
**Headline:** "Mereka juga pernah di posisimu."

1. **Rizky A., 23 · UI Designer · Bandung** — "Rabu pagi sudah dapat proyek pertama"
2. **Dina M., 29 · Content Writer · Jakarta** — "Saya bisa tidur lebih tenang" (cashflow dashboard)
3. **Budi S., 36 · Pemilik UMKM · Surabaya** — "freelancer kasih update setiap hari" (klien POV)
4. **Sari W., 31 · Karyawan · Yogyakarta** — "penghasilan sampingan Rp 4jt sebulan" (side hustler)

### Section 08 — Pricing
Background: Navy.
**Headline:** "Gratis untuk daftar. Bayar hanya kalau kamu sudah dapat bayaran."

**Gratis selamanya:** profil, skill test, apply, proposal, cashflow dasar, invoice, chat.
**Biaya:** 10% komisi, dipotong saat bayaran cair. Turun bertahap (8%→6%→5%).
**FAQ:** Kenapa 10%? Kapan turun? Kalau klien tidak bayar? (escrow)

### Section 09 — Final CTA
Background: Navy + Indigo glow.
**Headline:** "Semua orang yang sekarang punya klien, dulu juga belum punya apa-apa."
**CTA:** "Yuk mulai gawe" (large Indigo button)
**Reassurance:** Gratis · Tanpa kartu kredit · Batalkan kapan saja · Tim Indonesia

### Section 10 — Footer
Background: Navy Card. 4 kolom: Brand, Produk, Perusahaan, Legal & Sosmed.

---

## 12. Technical Requirements

### Landing page: single file
HTML + embedded CSS + embedded JS. Google Fonts via link. Inline SVG icons.

### Responsiveness
Mobile (<768px) single col, Tablet (768–1024) 2 col, Desktop (>1024) full.

### Animations
Navbar transition 300ms. Scroll fade-in via IntersectionObserver 20px up. Tab switch 200ms. CTA hover scale(1.02). No parallax.

### Accessibility
Alt text on SVG. Contrast ≥4.5:1. Visible focus. Logical tab order. h1 hero, h2 sections.

---

## 13. Deployment (Gratis)

| Komponen | Platform | Limit |
|----------|----------|-------|
| Frontend | Vercel Hobby | 100GB bw/bln |
| Backend | Render Free | 750 jam, sleep 15min |
| Database | Neon Free | 0.5GB |
| Redis | Upstash Free | 10K cmd/hari |
| Files | Cloudflare R2 Free | 10GB |
| Email | Resend Free | 100/hari |
| DNS/SSL | Cloudflare Free | Unlimited |
| Errors | Sentry Free | 5K events/bln |

**Total: $0/bulan.** Upgrade path: $5→$30-40/bln saat launch.

---

## 14. AI Toolchain & Dev Plan (1 Bulan)

### Tools
**Design:** Google Stitch (gratis) → Figma + Figma Make (free) → v0.dev (free) → Flowstep.ai (free) → Realtime Colors, Fontjoy, Coolors (gratis)

**Code:** Claude Code ($20/bln) → Cursor IDE (free) → ChatGPT (free)

**Services:** Midtrans Sandbox (gratis) → Resend (gratis) → Sentry (gratis)

### Timeline
- Minggu 1: Design system + scaffold project + auth
- Minggu 2: Onboarding, project posting, browsing, application, messaging
- Minggu 3: Midtrans, escrow, wallet, trust score, cashflow dashboard
- Minggu 4: Admin panel, polish, deploy

**Total cost: ~$25/bulan**

---

## 15. Prompts untuk Claude Code

### Landing page
```
Read BRIEF.md Section 11 and Section 2. Build index.html — complete landing page.
Single HTML, all 10 sections, Indonesian copy, brand colors, responsive, scroll animations,
tab functionality, sticky navbar. No dependencies except Google Fonts.
```

### Full-stack foundation
```
Read BRIEF.md Sections 4, 6, 7, 8, 9. Set up monorepo: Next.js + Express + Prisma + PG.
Auth system, dual account roles, database schema (User, FreelancerProfile, ClientProfile,
Project, Application, Transaction, Wallet). Docker compose for local PG + Redis.
```

### Payment
```
Read BRIEF.md Section 9. Implement Midtrans: create-escrow, webhook handler with
signature verification + idempotency, project state machine, wallet with 24h hold,
withdrawal with approval thresholds. All financial ops atomic.
```

---

*Version 2.0 — Mei 2026. All content placeholder for MVP. Brand system TBD by founder.*
*See also: BRIEF_FULLSTACK.md, GAWE_CATATAN_STRATEGI.md*
