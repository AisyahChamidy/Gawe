-- Jalankan di Supabase SQL Editor

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS selected_freelancer_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS funded_at timestamp,
ADD COLUMN IF NOT EXISTS started_at timestamp,
ADD COLUMN IF NOT EXISTS submitted_at timestamp,
ADD COLUMN IF NOT EXISTS completed_at timestamp,
ADD COLUMN IF NOT EXISTS submission_note text,
ADD COLUMN IF NOT EXISTS submission_files text[];

-- Status valid: 'open', 'in_review', 'funded', 'in_progress', 'submitted', 'revision', 'completed', 'cancelled'

GRANT UPDATE ON public.projects TO authenticated;

DO $$ BEGIN
  CREATE POLICY "Selected freelancer can update project status"
  ON public.projects FOR UPDATE
  USING (auth.uid() = selected_freelancer_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;
