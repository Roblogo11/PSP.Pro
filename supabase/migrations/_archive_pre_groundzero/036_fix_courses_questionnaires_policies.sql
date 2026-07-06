-- Migration 036: Fix RLS policies for courses & questionnaires
-- Re-run safe: drops existing policies before recreating them.

-- ============================================================
-- COURSES
-- ============================================================
DROP POLICY IF EXISTS "courses_select" ON public.courses;
DROP POLICY IF EXISTS "courses_insert" ON public.courses;
DROP POLICY IF EXISTS "courses_update" ON public.courses;
DROP POLICY IF EXISTS "courses_delete" ON public.courses;

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

-- ============================================================
-- COURSE LESSONS
-- ============================================================
DROP POLICY IF EXISTS "course_lessons_select" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_insert" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_update" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_delete" ON public.course_lessons;

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

-- ============================================================
-- COURSE ENROLLMENTS
-- ============================================================
DROP POLICY IF EXISTS "enrollments_select" ON public.course_enrollments;
DROP POLICY IF EXISTS "enrollments_insert" ON public.course_enrollments;
DROP POLICY IF EXISTS "enrollments_delete" ON public.course_enrollments;

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

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
DROP POLICY IF EXISTS "progress_select" ON public.lesson_progress;
DROP POLICY IF EXISTS "progress_insert" ON public.lesson_progress;
DROP POLICY IF EXISTS "progress_update" ON public.lesson_progress;

CREATE POLICY "progress_select" ON public.lesson_progress FOR SELECT TO authenticated
  USING (
    athlete_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "progress_insert" ON public.lesson_progress FOR INSERT TO authenticated
  WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "progress_update" ON public.lesson_progress FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid());

-- ============================================================
-- QUESTIONNAIRES
-- ============================================================
DROP POLICY IF EXISTS "questionnaires_select" ON public.questionnaires;
DROP POLICY IF EXISTS "questionnaires_insert" ON public.questionnaires;
DROP POLICY IF EXISTS "questionnaires_update" ON public.questionnaires;
DROP POLICY IF EXISTS "questionnaires_delete" ON public.questionnaires;

CREATE POLICY "questionnaires_select" ON public.questionnaires FOR SELECT TO authenticated USING (true);
CREATE POLICY "questionnaires_insert" ON public.questionnaires FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "questionnaires_update" ON public.questionnaires FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );
CREATE POLICY "questionnaires_delete" ON public.questionnaires FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- ============================================================
-- ASSIGNED QUESTIONNAIRES
-- ============================================================
DROP POLICY IF EXISTS "assigned_q_select" ON public.assigned_questionnaires;
DROP POLICY IF EXISTS "assigned_q_insert" ON public.assigned_questionnaires;
DROP POLICY IF EXISTS "assigned_q_update" ON public.assigned_questionnaires;
DROP POLICY IF EXISTS "assigned_q_delete" ON public.assigned_questionnaires;

CREATE POLICY "assigned_q_select" ON public.assigned_questionnaires FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "assigned_q_insert" ON public.assigned_questionnaires FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "assigned_q_update" ON public.assigned_questionnaires FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "assigned_q_delete" ON public.assigned_questionnaires FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

DO $$
BEGIN
  RAISE NOTICE 'Migration 036: Re-created RLS policies for courses & questionnaires (idempotent).';
END $$;
