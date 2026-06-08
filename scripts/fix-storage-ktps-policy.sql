-- Jalankan di Supabase SQL Editor
-- Fix storage policy untuk bucket 'ktps'

-- Izinkan authenticated user upload ke folder milik mereka sendiri
CREATE POLICY "Users can upload own KTP"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ktps'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Izinkan authenticated user update (upsert) file milik mereka
CREATE POLICY "Users can update own KTP"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ktps'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Izinkan user lihat file milik mereka (untuk getPublicUrl / download)
CREATE POLICY "Users can read own KTP"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ktps'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
