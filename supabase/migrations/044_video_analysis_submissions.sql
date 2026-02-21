-- Video Analysis Submissions table
CREATE TABLE IF NOT EXISTS public.video_analysis_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  video_url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'youtube')) DEFAULT 'upload',
  athlete_name TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_review', 'completed')) DEFAULT 'pending',
  coach_feedback TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.video_analysis_submissions ENABLE ROW LEVEL SECURITY;

-- Athletes can view their own submissions
CREATE POLICY "video_analysis_select_own" ON public.video_analysis_submissions
  FOR SELECT TO authenticated
  USING (
    athlete_id = auth.uid()
    OR submitted_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- Authenticated users can insert submissions
CREATE POLICY "video_analysis_insert" ON public.video_analysis_submissions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Coaches/admins can update (add feedback)
CREATE POLICY "video_analysis_update" ON public.video_analysis_submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- Admins can delete
CREATE POLICY "video_analysis_delete" ON public.video_analysis_submissions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );
