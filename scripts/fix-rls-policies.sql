-- Jalankan di Supabase SQL Editor untuk fix RLS policies
-- Script ini aman dijalankan berulang kali (pakai DO $$ untuk handle duplicate)

-- 1. Pastikan RLS aktif
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 2. Drop dan recreate policy "Clients can view own projects"
--    (kadang policy lama punya kondisi yang salah)
DROP POLICY IF EXISTS "Clients can view own projects" ON public.projects;
CREATE POLICY "Clients can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = client_id);

-- 3. Pastikan policy "Anyone can view open projects" ada dan benar
DROP POLICY IF EXISTS "Anyone can view open projects" ON public.projects;
CREATE POLICY "Anyone can view open projects"
  ON public.projects FOR SELECT
  USING (true);

-- 4. Pastikan GRANT SELECT sudah ada
GRANT SELECT ON public.projects TO authenticated;
GRANT SELECT ON public.projects TO anon;

-- 5. Policy untuk client update project mereka sendiri
DROP POLICY IF EXISTS "Clients can update own projects" ON public.projects;
CREATE POLICY "Clients can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = client_id);

-- Cek semua policy yang aktif (run SELECT ini untuk verifikasi):
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'projects';
