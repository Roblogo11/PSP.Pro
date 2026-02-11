-- Migration 034: Video Courses System
-- Courses with multiple video lessons, enrollments, and progress tracking.

-- Courses: a collection of video lessons
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  price_cents INTEGER DEFAULT 0,
  pricing_type TEXT DEFAULT 'free' CHECK (pricing_type IN ('free', 'one_time', 'monthly')),
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  included_in_membership BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Individual lessons within a course
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Track which athletes have access to which courses
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  payment_status TEXT DEFAULT 'free' CHECK (payment_status IN ('free', 'paid', 'comp')),
  stripe_payment_intent_id TEXT,
  expires_at TIMESTAMPTZ,
  UNIQUE(athlete_id, course_id)
);

-- Track lesson completion progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  watch_time_seconds INTEGER DEFAULT 0,
  UNIQUE(athlete_id, lesson_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_athlete_id ON public.course_enrollments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_athlete_id ON public.lesson_progress(athlete_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Courses: anyone authenticated can read active courses, staff can write
CREATE POLICY "courses_select" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "courses_insert" ON public.courses FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "courses_update" ON public.courses FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );
CREATE POLICY "courses_delete" ON public.courses FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- Course Lessons: anyone authenticated can read, staff can write
CREATE POLICY "course_lessons_select" ON public.course_lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "course_lessons_insert" ON public.course_lessons FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "course_lessons_update" ON public.course_lessons FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "course_lessons_delete" ON public.course_lessons FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- Enrollments: athletes can read own, staff can read/write all
CREATE POLICY "enrollments_select" ON public.course_enrollments FOR SELECT TO authenticated
  USING (
    athlete_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "enrollments_insert" ON public.course_enrollments FOR INSERT TO authenticated
  WITH CHECK (
    athlete_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "enrollments_delete" ON public.course_enrollments FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- Lesson Progress: athletes can read/write own
CREATE POLICY "progress_select" ON public.lesson_progress FOR SELECT TO authenticated
  USING (
    athlete_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "progress_insert" ON public.lesson_progress FOR INSERT TO authenticated
  WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "progress_update" ON public.lesson_progress FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid());

DO $$
BEGIN
  RAISE NOTICE 'Migration 034: Courses system created (courses, course_lessons, course_enrollments, lesson_progress).';
END $$;
