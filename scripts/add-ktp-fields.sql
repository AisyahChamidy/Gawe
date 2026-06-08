-- Jalankan di Supabase SQL Editor
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ktp_status text DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS ktp_url text;

-- Buat bucket ktps kalau belum ada (via Supabase Storage UI atau pakai ini sebagai referensi)
-- Storage > New Bucket > "ktps" > Public: false (private)
