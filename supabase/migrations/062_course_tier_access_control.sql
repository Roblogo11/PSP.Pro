-- ============================================================================
-- 062: Course tier access control — close the free-enrollment revenue leak
-- ============================================================================
--
-- ⚠ IF YOU TOUCH COURSE ACCESS, YOU MUST:
--    1. Keep enrollment INSERT locked to service-role/staff only. The athlete
--       self-insert path is what allowed anyone to enroll in a paid course for
--       free. Client code must go through /api/courses/enroll, never a direct
--       supabase.from('course_enrollments').insert().
--    2. Keep course_lessons SELECT gated on enrollment. It was USING (true),
--       which exposed every paid lesson's video_url to any logged-in user.
--       Preview lessons (is_preview = true) stay public on purpose.
--    3. Set courses.required_tier_id on any NEW paid course, or it will be
--       treated as free. Nullable = free/public.
--
-- WHAT THIS FIXES (audited 2026-07-28):
--    Leak B1: courses/page.tsx inserted course_enrollments client-side with
--             payment_status:'free'. RLS only checked athlete_id = auth.uid(),
--             never price. Any user could enroll in any paid course, free.
--    Leak B2: course_lessons_select was USING (true) — paid video_url readable
--             by every authenticated user even without enrollment.
--
-- This migration is idempotent and safe to re-run.
-- ============================================================================

DO $$
DECLARE
  v_elite_tier_id  uuid;
  v_paid_courses   integer;
  v_bogus_enrolls  integer;
BEGIN
  RAISE NOTICE '--- 062: course tier access control ---';

  -- ---------------------------------------------------------------------
  -- 1. courses.required_tier_id — each course declares the tier that unlocks it
  -- ---------------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses'
      AND column_name = 'required_tier_id'
  ) THEN
    ALTER TABLE public.courses ADD COLUMN required_tier_id uuid;
    RAISE NOTICE '  [1/5] added courses.required_tier_id';
  ELSE
    RAISE NOTICE '  [1/5] courses.required_tier_id already present — skipped';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'courses_required_tier_id_fkey'
      AND conrelid = 'public.courses'::regclass
  ) THEN
    ALTER TABLE public.courses
      ADD CONSTRAINT courses_required_tier_id_fkey
      FOREIGN KEY (required_tier_id) REFERENCES public.membership_tiers(id)
      ON DELETE SET NULL;
    RAISE NOTICE '        + FK -> membership_tiers(id)';
  END IF;

  CREATE INDEX IF NOT EXISTS idx_courses_required_tier_id
    ON public.courses USING btree (required_tier_id);

  -- ---------------------------------------------------------------------
  -- 2. Backfill: existing membership courses require ELITE
  --    included_in_membership was a boolean with no tier reference.
  -- ---------------------------------------------------------------------
  SELECT id INTO v_elite_tier_id
  FROM public.membership_tiers WHERE slug = 'elite_membership' LIMIT 1;

  IF v_elite_tier_id IS NULL THEN
    RAISE NOTICE '  [2/5] no elite_membership tier found — backfill skipped';
  ELSE
    UPDATE public.courses
    SET required_tier_id = v_elite_tier_id
    WHERE required_tier_id IS NULL
      AND (included_in_membership = true OR price_cents > 0);
    GET DIAGNOSTICS v_paid_courses = ROW_COUNT;
    RAISE NOTICE '  [2/5] backfilled % course(s) -> ELITE required', v_paid_courses;
  END IF;

  -- ---------------------------------------------------------------------
  -- 2b. Grandfather existing enrollments on now-tier-gated courses.
  --     Audited 2026-07-28: all 23 live enrollments are on $0 courses, but
  --     'Train Like an Athlete' is included_in_membership and just became
  --     ELITE-gated. Re-stamping those rows as 'membership' keeps the people
  --     already enrolled from losing access they legitimately have today.
  --     Access is never silently revoked from a real user by a migration.
  -- ---------------------------------------------------------------------
  UPDATE public.course_enrollments ce
  SET payment_status = 'membership'
  FROM public.courses c
  WHERE c.id = ce.course_id
    AND ce.payment_status = 'free'
    AND c.required_tier_id IS NOT NULL;
  GET DIAGNOSTICS v_paid_courses = ROW_COUNT;
  RAISE NOTICE '  [2b/5] grandfathered % existing enrollment(s) on tier-gated courses', v_paid_courses;

  -- ---------------------------------------------------------------------
  -- 3. Report (do NOT auto-delete) enrollments that were never paid for.
  --    Deleting would strip access from real users; Rob decides.
  -- ---------------------------------------------------------------------
  SELECT count(*) INTO v_bogus_enrolls
  FROM public.course_enrollments ce
  JOIN public.courses c ON c.id = ce.course_id
  WHERE ce.payment_status = 'free'
    AND (c.price_cents > 0 OR c.included_in_membership = true);

  IF v_bogus_enrolls > 0 THEN
    RAISE NOTICE '  [3/5] ⚠ % enrollment(s) on paid courses marked payment_status=free.', v_bogus_enrolls;
    RAISE NOTICE '        NOT deleted — review before revoking (see AGENT-LEDGER).';
  ELSE
    RAISE NOTICE '  [3/5] no unpaid enrollments on paid courses — clean';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 4. Lock down enrollment INSERT: athletes may NO LONGER self-enroll.
--    Server route uses the service role key, which bypasses RLS entirely.
--    Staff keep the manual-grant path.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS enrollments_insert ON public.course_enrollments;
CREATE POLICY enrollments_insert ON public.course_enrollments
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])
    )
  );

-- ---------------------------------------------------------------------
-- 5. Gate lesson content on enrollment. Previews stay public.
--    Was USING (true) — every paid video_url was readable by any user.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS course_lessons_select ON public.course_lessons;
CREATE POLICY course_lessons_select ON public.course_lessons
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (
    is_preview = true
    OR EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = course_lessons.course_id
        AND ce.athlete_id = auth.uid()
        AND (ce.expires_at IS NULL OR ce.expires_at > now())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])
    )
  );

DO $$
BEGIN
  RAISE NOTICE '  [4/5] enrollments_insert -> staff/service-role only';
  RAISE NOTICE '  [5/5] course_lessons_select -> gated on enrollment (previews public)';
  RAISE NOTICE '--- 062 complete ---';
END $$;
