-- Jalankan di Supabase SQL Editor
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS revision_note text;
