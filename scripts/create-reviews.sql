-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id),
  reviewer_id uuid REFERENCES auth.users(id),
  reviewee_id uuid REFERENCES auth.users(id),
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT ON public.reviews TO authenticated;
