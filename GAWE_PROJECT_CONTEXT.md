# Gawe — Project Context & Development Log
> File ini berisi semua keputusan, konteks, dan progress yang sudah dicapai.
> Paste file ini di awal chat baru supaya tidak perlu menjelaskan ulang.

---

## Tentang Proyek

**Gawe** adalah platform freelance Indonesia yang ditujukan untuk **freelancer pemula** yang belum punya portofolio dan struggle dengan cashflow. Berbeda dari Sribu/Fastwork/Fiverr yang fokus ke talent berpengalaman.

**Tiga value pillar:**
1. Trust from Zero — sistem reputasi untuk pemula tanpa portofolio
2. Micro-project Marketplace — proyek Rp 100rb–5jt
3. Cashflow Clarity — financial tools untuk pantau pendapatan

**Brand voice:** Seperti kakak senior yang pernah gagal — hangat, langsung, tidak korporat. Semua copy dalam Bahasa Indonesia.

---

## Status Saat Ini (Update: 16 Mei 2026)

### Yang Sudah Ada di Repository
- `BRIEF_FULLSTACK.md` — brief teknis lengkap (~80 halaman)
- `GAWE_CATATAN_STRATEGI.md` — strategi bisnis, monetisasi, AI toolchain
- `GAWE_PROJECT_CONTEXT.md` — file ini

### Environment
- ✅ Node.js v20.20.2
- ✅ npm v10.8.2
- ✅ Git v2.50.1
- ✅ VS Code terinstall
- ✅ GitHub: github.com/AisyahChamidy/Gawe
- ✅ Supabase project "Gawe" (region: Asia Pacific Singapore)
- ✅ Vercel: gawe.vercel.app (LIVE)
- ✅ Next.js 16.2.6 project sudah ada di ~/Desktop/gawe
- ✅ framer-motion terinstall
- ✅ lucide-react terinstall

### Device
- MacBook Air (Apple Silicon / ARM)
- macOS, Terminal: zsh
- Username: midy
- Folder project: ~/Desktop/gawe

---

## Stack Yang Dipakai

```
Frontend + API  →  Next.js 16.2.6 (App Router) — satu app
Database        →  Supabase (PostgreSQL + Auth)
Styling         →  Inline styles + CSS-in-JS (bukan Tailwind)
Animasi         →  Framer Motion
Icons           →  Lucide React
Deploy          →  Vercel (gawe.vercel.app)
Payment         →  SKIP untuk MVP
```

---

## Brand System

```
Background: Navy #0A0E1A
Primary:    Electric Indigo #4F6EF7
Secondary:  Violet #8B5CF6
Accent:     Cyan #22D3EE
Font:       Outfit Bold (headline), Work Sans (body), Geist Mono (data)
```

---

## Supabase Config

```
Project URL:    https://boonfgucuvowmarkqslw.supabase.co
Project ID:     boonfgucuvowmarkqslw
Anon Key:       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (legacy JWT key)
                → diambil dari Settings > JWT Keys > Legacy JWT Secret
```

**PENTING:** Gunakan legacy JWT key (`eyJ...`), BUKAN publishable key (`sb_publishable_...`).
Legacy key ada di: Supabase dashboard → Settings → JWT Keys → tab "Legacy JWT Secret"

### Database Tables
```sql
-- profiles: extends auth.users
public.profiles (
  id uuid (FK ke auth.users),
  full_name text,
  role text ('freelancer' | 'client' | 'both'),
  headline text, bio text, city text,
  avatar_url text,
  trust_score integer default 0,
  created_at timestamp
)

-- projects: proyek yang dipost klien
public.projects (
  id uuid,
  client_id uuid (FK ke auth.users),
  title text, description text,
  category text, budget_min int, budget_max int,
  estimated_days int, skills_required text[],
  status text ('open' | 'in_progress' | 'completed' | 'cancelled'),
  created_at timestamp
)

-- applications: lamaran freelancer ke proyek
public.applications (
  id uuid,
  project_id uuid (FK projects),
  freelancer_id uuid (FK auth.users),
  cover_letter text,
  status text ('pending' | 'accepted' | 'rejected'),
  created_at timestamp,
  UNIQUE(project_id, freelancer_id)
)
```

### RLS & Grants Yang Sudah Diset
```sql
-- profiles
alter table public.profiles enable row level security;
create policy "Users can view all profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- projects
alter table public.projects enable row level security;
create policy "Anyone can view open projects" on public.projects for select using (true);
create policy "Clients can create projects" on public.projects for insert with check (auth.uid() = client_id);
create policy "Clients can update own projects" on public.projects for update using (auth.uid() = client_id);
create policy "Clients can view own projects" on public.projects for select using (auth.uid() = client_id);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.projects TO authenticated;
GRANT INSERT ON public.projects TO authenticated;

-- applications
alter table public.applications enable row level security;
create policy "Freelancers can apply" on public.applications for insert with check (auth.uid() = freelancer_id);
create policy "Users can view own applications" on public.applications for select using (...);
create policy "Clients can update applications for their projects" on public.applications for update using (...);
GRANT SELECT ON public.applications TO authenticated;
GRANT INSERT ON public.applications TO authenticated;
GRANT UPDATE ON public.applications TO authenticated;
```

### Trigger
```sql
-- Auto-create profile saat user daftar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Halaman Yang Sudah Dibangun

```
✅ /                          Landing page (industrial design, framer motion)
✅ /auth/daftar               Halaman daftar (email, password, role)
✅ /auth/masuk                Halaman masuk
✅ /app/dasbor                Dashboard freelancer (dengan navbar navigasi)
✅ /app/jelajah               Browse proyek + lamar proyek
✅ /app/lamaran               Daftar lamaran freelancer + status
✅ /klien/post-proyek         Form post proyek baru
✅ /klien/proyek              Daftar proyek klien + lihat pelamar + terima/tolak
```

---

## Fitur Yang Sudah Jalan

### Auth
- Daftar dengan email, password, nama, role (freelancer/client)
- Masuk dengan email + password
- Logout → redirect ke landing page `/`
- Session tersimpan di Supabase Auth
- Profile auto-created via trigger saat daftar

### Freelancer Flow
- Browse semua proyek yang open
- Lamar proyek dengan satu klik
- Tombol berubah jadi "✓ Sudah Dilamar" setelah apply
- Lihat semua lamaran + status (Menunggu/Diterima/Ditolak)

### Client Flow
- Post proyek baru (judul, deskripsi, kategori, budget, estimasi, skills)
- Lihat semua proyek yang sudah dipost
- Lihat daftar pelamar per proyek
- Terima atau tolak pelamar → status berubah realtime

### Landing Page
- Hero section dengan Trust Score dashboard widget
- Animated counter (500+, 100+, 10%)
- Framer Motion reveal animations
- Ticker proyek berjalan horizontal
- Bento grid features
- Cara kerja 3 langkah
- Dual CTA freelancer vs klien
- Comparison komisi (Gawe 10% vs Sribu 15-20% vs Fiverr 20%)
- Final CTA + Footer

---

## Vercel Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://boonfgucuvowmarkqslw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[legacy JWT key eyJ...]
```

Set di: Vercel → project gawe → Environment Variables
Scope: Production and Preview

---

## Yang Belum Selesai / Next Steps

### Segera (sebelum presentasi)
- [ ] Fix logout redirect ke `/` bukan `/auth/masuk` (sudah mulai)
- [ ] Rapikan navbar di halaman jelajah, lamaran, post-proyek, klien/proyek
- [ ] Test golden path end-to-end di gawe.vercel.app
- [ ] Seed data dummy yang bagus untuk presentasi

### Nice to Have
- [ ] Profil edit page
- [ ] Fix tampilkan nama freelancer di halaman klien/proyek (sekarang hardcoded "Freelancer")
- [ ] Landing page gap di sisi kiri (minor visual bug)
- [ ] Responsive mobile

### Fase 2 (setelah presentasi)
- [ ] Midtrans payment integration
- [ ] Skill test system
- [ ] Cashflow dashboard
- [ ] KYC verification
- [ ] Invoice PDF
- [ ] Admin panel

---

## Known Issues

1. **Nama freelancer di halaman klien** — tampil "Freelancer" bukan nama asli karena join ke profiles dimatikan sementara (RLS issue). Fix: tambahkan RLS policy untuk clients mengakses profiles.

2. **Landing page whitespace kiri** — hero section punya `maxWidth: 1200` tapi wrapper tidak full-width. Minor visual bug.

3. **Confirm email Supabase** — dimatikan untuk development. Nyalakan kembali sebelum production launch.

4. **npm audit warnings** — ada 2 moderate vulnerabilities di postcss. Jangan jalankan `npm audit fix --force` karena akan downgrade Next.js ke versi 9.

---

## Cara Jalankan Lokal

```bash
cd ~/Desktop/gawe
npm run dev
# Buka http://localhost:3000
```

---

## Cara Deploy

```bash
git add .
git commit -m "pesan commit"
git push
# Vercel auto-deploy dari branch main
```

---

## Golden Path untuk Presentasi

```
1. Buka gawe.vercel.app → tunjukkan landing page
2. Klik "Mulai Cari Kerja" → daftar sebagai freelancer baru
3. Masuk → lihat dashboard
4. Klik "Jelajah Proyek" → lihat 6+ proyek tersedia
5. Lamar satu proyek → tombol berubah "✓ Sudah Dilamar"
6. Klik "Lamaranku" → lihat status "Menunggu"
7. Buka tab baru → masuk sebagai akun klien
8. Klik "Post Proyek" → isi form → submit
9. Klik "Proyekku" → lihat proyek + pelamar
10. Klik "Terima" → status berubah "✓ Diterima"
11. Kembali ke tab freelancer → Lamaranku → status berubah "Diterima"
```

---

## Konteks Founder

- **Nama:** Midy (AisyahChamidy)
- **Email:** ichaaamidy@gmail.com
- **Background coding:** Beginner — baru pertama kali bikin web app
- **Solo founder** — tidak ada developer lain
- **Lokasi:** Bandung, Indonesia
- **Tujuan jangka pendek:** Presentasi tugas ke dosen (deadline: minggu ke-2 Juni 2026)
- **Tujuan jangka panjang:** Platform nyata untuk freelancer pemula Indonesia

---

## Log Progres

### 15 Mei 2026 — Hari 1
- ✅ Setup Next.js project
- ✅ Push ke GitHub
- ✅ Deploy ke Vercel
- ✅ Supabase terkoneksi
- ✅ Auth system (daftar, masuk, logout)
- ✅ Database tables: profiles, projects, applications
- ✅ Dashboard freelancer
- ✅ Halaman jelajah proyek
- ✅ Post proyek (klien)
- ✅ Lamar proyek (freelancer)
- ✅ Halaman lamaranku
- ✅ Halaman proyekku klien + terima/tolak
- ✅ Landing page v1

### 16 Mei 2026 — Hari 2
- ✅ Landing page redesign total (industrial design, framer motion)
- ✅ Install framer-motion + lucide-react
- ✅ Fix TypeScript error (ease type)
- ✅ Update anon key Vercel ke legacy JWT key
- ✅ gawe.vercel.app live dengan landing page baru
- ✅ Navbar navigasi di dashboard (Dashboard, Jelajah, Lamaranku, Post Proyek, Proyekku)
- 🔲 Fix logout redirect ke landing page (in progress)
- 🔲 Rapikan navbar di semua halaman lain

---

## Cara Pakai File Ini di Chat Baru

1. Buka chat baru di Claude (dalam project Gawe yang sama)
2. Tulis: *"Lanjutkan membantu saya build Gawe. Konteks ada di GAWE_PROJECT_CONTEXT.md di project ini. Sekarang saya mau [sebutkan yang mau dikerjakan]."*

---

*Last updated: 16 Mei 2026*
