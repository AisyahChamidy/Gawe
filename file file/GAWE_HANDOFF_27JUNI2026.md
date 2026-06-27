# Gawe — Handoff Document
> Update lengkap semua yang dikerjakan di sesi 25–27 Juni 2026.
> Paste di awal chat baru untuk melanjutkan tanpa perlu jelaskan ulang.

**Tanggal update:** 27 Juni 2026
**Status:** H-1 deadline presentasi (28 Juni 2026, jam 23.59)

---

## Tentang Proyek

**Gawe** adalah platform freelance Indonesia untuk **freelancer pemula** yang belum punya portofolio dan struggle dengan cashflow.

**Tiga value pillar:**
1. Trust from Zero — Trust Score menggantikan portofolio
2. Micro-project Marketplace — proyek Rp 100rb–5jt
3. Cashflow Clarity — financial tools untuk pantau pendapatan

**Brand voice:** Seperti kakak senior — hangat, langsung, tidak korporat. Semua copy Bahasa Indonesia.

---

## Environment & Stack

```
Project path    : ~/gawe
GitHub          : github.com/AisyahChamidy/Gawe
Deploy          : gawe.vercel.app (Vercel auto-deploy dari branch main)
Framework       : Next.js App Router
Database        : Supabase (PostgreSQL + Auth)
Styling         : Inline styles ONLY — TIDAK pakai Tailwind
Animasi         : Framer Motion
Icons           : Lucide React (strokeWidth 1.5 selalu)
Runtime         : macOS/zsh, ~/gawe, npm run dev → localhost:3000
```

**Supabase:**
```
URL  : https://boonfgucuvowmarkqslw.supabase.co
Key  : Legacy JWT key (eyJ...) dari Settings → JWT Keys → Legacy JWT Secret
       BUKAN publishable key (sb_publishable_...)
```

**Environment variables di .env.local:**
```
NEXT_PUBLIC_SUPABASE_URL=https://boonfgucuvowmarkqslw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[legacy JWT key eyJ...]
GEMINI_API_KEY=[Gemini API key dari aistudio.google.com]
```

**Test accounts:**
- Aisyah Chamidy: UUID `9341a613-32b7-46bb-977d-e8e53370d2d0`, role: both
- Ichaaamidy: UUID `ecae2c4a-1579-4fd7-837a-d63416bfbd6a`, role: client

---

## Design System

Token warna & font ada di `src/lib/theme.ts` — SATU-SATUNYA sumber kebenaran.
TIDAK BOLEH hardcode hex baru di file page manapun. Selalu pakai `C.` token.

**Pola visual:**
- Background: putih / lavender sangat pucat
- Card: putih, border 1px halus, shadow lembut
- Badge status: soft-pill (background pucat + teks warna terkait)
- Font: Playfair Display (heading), Work Sans (body), Geist Mono (angka/data)
- Primary: `#534AB7` (indigo)
- primaryTint: `#EEEDFE` (lavender pucat)

---

## Semua Halaman yang Ada (27 route)

```
PUBLIC
/ ......................... Landing page (Bobbin light theme — BARU DIPOLISH HABIS)
/proyek ................... Browse proyek publik
/proyek/[id] .............. Detail proyek publik
/freelancer/[username] .... Profil publik freelancer

AUTH
/auth/masuk ............... Login
/auth/daftar .............. Register
/auth/lupa-password ....... Request reset email
/auth/reset-password ...... Input password baru

FREELANCER (/app/*)
/app/dasbor ............... Dashboard freelancer
/app/jelajah .............. Browse proyek + smart matching + apply
/app/lamaran .............. Daftar lamaran + status + urgency timer
/app/proyek/[id] .......... Chat workspace per proyek
/app/profil ............... Edit profil + AI suggestions (BARU)
/app/profil/verifikasi .... KYC upload KTP
/app/profil/skill-test .... List skill test
/app/profil/skill-test/[id] Ambil skill test
/app/keuangan ............. Chart cashflow + transaksi
/notifikasi ............... Inbox notifikasi

KLIEN (/klien/*)
/klien/dasbor ............. Dashboard klien
/klien/proyek ............. Kelola proyek + lamaran
/klien/proyek/[id] ........ Chat workspace
/klien/proyek/[id]/bayar .. Simulasi escrow payment
/klien/proyek/[id]/review . Approve hasil kerja
/klien/proyek/[id]/rating . Rating freelancer
/klien/post-proyek ........ Form post proyek (+ AI brief helper BARU)
/klien/keuangan ........... Riwayat pengeluaran

SHARED
/api/ai/generate .......... API route untuk semua fitur AI (BARU)
```

---

## Yang Dikerjakan di Sesi 25–27 Juni 2026

### Landing Page Polish (MAJOR)

Semua perubahan di `src/app/page.tsx`:

**Layout & Structure:**
- Hero split layout: teks kiri (55%), cycling cards kanan (45%)
- Cycling cards 3 kartu bergantian (interval 7 detik, fade 0.8s):
  - Card A: Trust Score profile (Rizky Ananda, 82/100)
  - Card B: Project match (Rp 800rb, 95% cocok)
  - Card C: Cashflow (Rp 3.250.000 bulan ini)
- Dot indicator di bawah card
- Tiga Pilar: 3 kolom dark cards sejajar (bukan stacked vertikal)
- Cara Kerja: grid 2×2 (bukan list vertikal)
- Testimoni: 2×2 static grid (4 card sekaligus, bukan carousel)
- Biaya Platform: layout kiri (gratis list + 10% card) / kanan (kalkulator)
- Final CTA: animated mesh gradient (CSS keyframes, 8 detik)

**Typography:**
- Semua section h2: `clamp(36px, 3.8vw, 48px)`, fontWeight 700
- Konsisten di semua section

**Background & Atmosphere:**
- Hero: dual radial gradient dengan token primary (#534AB7) opacity rendah
- Noise texture overlay 0.025 opacity

**Copywriting yang diubah:**
- Hero badge: "500+ freelancer bergabung minggu ini"
- Tiga Pilar heading: "Dirancang khusus agar pemula langsung kerja."
- Cara Kerja heading: "Daftar hari ini, gajian dalam hitungan hari."
- Biaya Platform heading: "Gratis selamanya. Potongan 10% hanya saat proyek beres." (dengan `<br/>`)
- CTA hero: "Mulai Tanpa Portofolio"
- CTA cara kerja: "Siap Mulai Gajian?"
- CTA final: "Mulai dari Nol di Sini"
- Microcopy di bawah CTA hero dihapus

### Fitur AI (BARU)

**API Route:** `src/app/api/ai/generate/route.ts`
- POST endpoint menerima `{ type, context }`
- Menggunakan Gemini API: `gemini-flash-latest`
- URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`
- API key via header `X-goog-api-key` (bukan query param)
- GEMINI_API_KEY hanya di server, tidak expose ke client

**Fitur 1 — "Saran dari AI" di profil:**
- File: `src/app/profil/page.tsx`
- Tombol di sebelah label Bio
- Generate saran headline + bio berdasarkan skills & info profil
- Tampil sebagai suggestion box dengan "Pakai saran ini" / "Abaikan"

**Fitur 2 — "Bantu tulis lamaran" di detail proyek:**
- File: `src/app/jelajah/[id]/page.tsx` atau ProyekDetailClient.tsx
- Tombol sebelum textarea cover letter
- Generate draft cover letter berdasarkan deskripsi proyek + skills freelancer

**Fitur 3 — "Bantu isi brief" di post proyek:**
- File: `src/app/klien/post-proyek/page.tsx`
- Tombol di sebelah label deskripsi
- Hasil AI langsung isi textarea, bisa diedit

**Status AI:** Jalan di local. Perlu tambahkan GEMINI_API_KEY ke Vercel Environment Variables untuk production.

### Security Fix

- Role check ditambahkan di semua halaman `/klien/*`
- Freelancer yang coba akses `/klien/dasbor`, `/klien/post-proyek`, dll → redirect ke `/app/dasbor`
- Pattern: fetch profile role → if `role === 'freelancer'` → `router.push('/app/dasbor')`

---

## Aturan Teknis Wajib

1. **Warna:** SELALU dari `src/lib/theme.ts`. Zero hardcoded hex.
2. **File writing zsh:** SELALU `python3 << 'PYEOF'` atau `cat << 'EOF'`. JANGAN `python3 -c "..."`.
3. **SQL:** Jalankan manual di Supabase SQL Editor.
4. **Git:** Midy commit dan push manual. Claude Code tidak pernah git push.
5. **TypeScript:** `npx tsc --noEmit` 0 error sebelum selesai setiap sesi.
6. **Logic:** Perubahan visual TIDAK boleh ubah logic bisnis.
7. **Notification insert:** Selalu try-catch terpisah dari logic utama.
8. **Project path:** Selalu `cd ~/gawe`.
9. **Dev server:** Kalau port 3000 in use → `kill [PID]` dulu baru `npm run dev`.
10. **GEMINI_API_KEY:** Jangan pernah paste di chat atau commit ke git.

---

## Backlog yang Belum Dikerjakan

### Bug kecil
- Status label salah saat revisi (mapping `status → label` di halaman klien)
- Urutan lamaran di `/app/lamaran` — yang "Terlambat Xh" belum otomatis naik ke atas

### Fitur yang belum ada (dari brief)
- Email notifications via Resend
- Google OAuth
- Foto profil di chat & lamaran (avatar_url sudah ada di DB)
- Sistem bidding (proposedBudget di apply)
- Admin panel (spec lengkap di BRIEF_FULLSTACK.md Section 11)
- Midtrans payment nyata (sekarang masih simulasi)
- Invoice PDF generation
- Milestone payment system
- Wallet & withdrawal nyata
- Halaman publik: /cara-kerja, /fitur, /harga, /syarat-ketentuan, /privasi, /faq
- Mobile carousel untuk Tiga Pilar & Testimoni

---

## Golden Path Demo (untuk presentasi)

```
1.  Buka gawe.vercel.app → landing page (cycling cards, animated gradient)
2.  Klik "Proyek" di navbar → /proyek (publik, tanpa login)
3.  Klik "Lamar Proyek" → diarahkan ke login
4.  Daftar/masuk sebagai freelancer
5.  Dashboard → stats real, bell icon
6.  Jelajah Proyek → search + filter + badge "X% Cocok"
7.  Lamar proyek → tombol "✓ Sudah Dilamar"
8.  Lamaranku → status + urgency badge
9.  Tab baru → masuk sebagai klien (Ichaaamidy)
10. Dashboard klien → bell "Lamaran baru masuk"
11. Post proyek baru → coba tombol "Bantu isi brief" (AI)
12. Proyekku → lihat proyek + pelamar
13. Klik "Terima" → notifikasi ke freelancer
14. Chat muncul → masuk chat
15. Tab freelancer → bell "Lamaran diterima", Lamaranku → "Diterima" + Chat
16. Profil → coba tombol "Saran dari AI" (AI)
```

---

## File Penting

```
src/app/page.tsx ................. Landing page (JANGAN ubah sembarangan)
src/app/api/ai/generate/route.ts . API route Gemini (BARU)
src/lib/theme.ts ................. Token warna & font
src/lib/supabase.ts .............. Supabase client
src/utils/matchScore.ts .......... Smart matching algorithm
src/components/Navbar.tsx ........ Navbar freelancer
src/components/NavbarKlien.tsx ... Navbar klien
src/app/notifikasi/page.tsx ...... Inbox notifikasi
src/app/profil/page.tsx .......... Profil + AI feature
src/app/klien/post-proyek/page.tsx Form post proyek + AI feature
```

---

## Cara Lanjutkan di Chat Baru

Buka chat baru di Claude (dalam project Gawe yang sama), lalu:

> "Lanjutkan bantu build Gawe. Konteks ada di GAWE_HANDOFF_27JUNI2026.md. Sekarang mau [sebutkan yang mau dikerjakan]."

---

*Last updated: 27 Juni 2026 — pre-deadline sprint*
*Dikerjakan: Midy (AisyahChamidy) + Claude Sonnet 4.6*
