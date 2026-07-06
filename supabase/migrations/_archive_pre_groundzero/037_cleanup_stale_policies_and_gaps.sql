-- Migration 037: Cleanup stale/duplicate RLS policies + fix gaps
-- Drops old-naming policies left over from early migrations,
-- fixes missing master_admin on packages table,
-- adds INSERT policies for newsletter_subscribers and contact_submissions.

-- ============================================================
-- 1. ASSIGNED_DRILLS — drop old 005-era policies
--    Keep only: assigned_drills_select, _insert, _update, _delete (from 032)
-- ============================================================
DROP POLICY IF EXISTS "Coaches and admins can assign drills" ON public.assigned_drills;
DROP POLICY IF EXISTS "Coaches and admins can delete assigned drills" ON public.assigned_drills;
DROP POLICY IF EXISTS "Coaches and admins can update assigned drills" ON public.assigned_drills;
DROP POLICY IF EXISTS "Users can view own assigned drills" ON public.assigned_drills;
DROP POLICY IF EXISTS "Users can update own assigned drills" ON public.assigned_drills;

-- ============================================================
-- 2. BOOKINGS — drop stale 002-era SELECT policy
--    Keep only: bookings_select_policy, _insert_policy, _update_policy, _delete_policy
-- ============================================================
DROP POLICY IF EXISTS "Athletes can view their own bookings" ON public.bookings;

-- ============================================================
-- 3. DRILL_COMPLETIONS — drop old pre-existing + 005-era policies
--    Keep only: drill_completions_select, _insert, _update (from 032)
-- ============================================================
DROP POLICY IF EXISTS "Users can view own completions" ON public.drill_completions;
DROP POLICY IF EXISTS "Users can create own completions" ON public.drill_completions;
DROP POLICY IF EXISTS "Users can delete own completions" ON public.drill_completions;
DROP POLICY IF EXISTS "Coaches and admins can view all completions" ON public.drill_completions;
DROP POLICY IF EXISTS "Coaches can create completions for athletes" ON public.drill_completions;

-- ============================================================
-- 4. VELOCITY_LOGS — drop old pre-existing + 005-era policies
--    Keep only: velocity_logs_select, _insert, _update (from 032)
-- ============================================================
DROP POLICY IF EXISTS "Users can view own velocity logs" ON public.velocity_logs;
DROP POLICY IF EXISTS "Users can create own velocity logs" ON public.velocity_logs;
DROP POLICY IF EXISTS "Users can delete own velocity logs" ON public.velocity_logs;
DROP POLICY IF EXISTS "Coaches and admins can view all velocity logs" ON public.velocity_logs;
DROP POLICY IF EXISTS "Coaches can create velocity logs for athletes" ON public.velocity_logs;

-- ============================================================
-- 5. AVAILABLE_SLOTS — drop stale 002-era policy
--    Keep only the 5 from migration 030:
--    "Anyone can view available slots", "Staff can view own slots",
--    "Admins can view all slots", "Staff can manage own slots",
--    "Admins can manage all slots"
-- ============================================================
DROP POLICY IF EXISTS "Available slots are viewable by everyone" ON public.available_slots;
DROP POLICY IF EXISTS "Coaches can manage their own slots" ON public.available_slots;

-- ============================================================
-- 6. SESSIONS — drop old pre-existing policies
--    Keep only: sessions_select, sessions_delete (from 032)
--    + pre-existing insert/update that are still needed
-- ============================================================
DROP POLICY IF EXISTS "Users can view own sessions" ON public.sessions;
-- Note: keeping "Users can create own sessions" and "Users can update own sessions"
-- because migration 032 only created sessions_select and sessions_delete,
-- so INSERT and UPDATE still rely on the original policies.

-- ============================================================
-- 7. PACKAGES — missing master_admin entirely (skipped by 028/032)
-- ============================================================
DROP POLICY IF EXISTS "Athletes can view own packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;

CREATE POLICY "packages_select" ON public.packages FOR SELECT TO authenticated
  USING (
    athlete_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "packages_insert" ON public.packages FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );
CREATE POLICY "packages_update" ON public.packages FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );
CREATE POLICY "packages_delete" ON public.packages FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- ============================================================
-- 8. NEWSLETTER_SUBSCRIBERS — missing INSERT policy
--    API uses service role, but adding for defense-in-depth
-- ============================================================
DROP POLICY IF EXISTS "newsletter_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_insert" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- 9. CONTACT_SUBMISSIONS — missing INSERT policy
--    API uses service role, but adding for defense-in-depth
-- ============================================================
DROP POLICY IF EXISTS "contact_insert" ON public.contact_submissions;
CREATE POLICY "contact_insert" ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- 10. COACH_SCHEDULES — add admin view-all for inactive schedules
-- ============================================================
DROP POLICY IF EXISTS "coach_schedules_admin_select" ON public.coach_schedules;
CREATE POLICY "coach_schedules_admin_select" ON public.coach_schedules
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

DO $$
BEGIN
  RAISE NOTICE 'Migration 037: Cleaned up stale policies, fixed packages master_admin, added INSERT policies for newsletter/contact, added admin view-all for coach_schedules.';
END $$;
