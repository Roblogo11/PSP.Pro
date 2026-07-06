-- Migration 031: Fix remaining RLS gaps for master_admin and coach roles
--
-- Problems found:
-- 1. bookings_select_policy (migration 014) only checks 'admin', missing 'master_admin'
-- 2. bookings_delete_policy (migration 014) only checks 'admin', missing 'master_admin'
-- 3. bookings_update_policy (migration 014) only checks 'admin', missing 'master_admin'
-- 4. coach_schedules policies (migration 002) only check 'admin', missing 'coach' self-manage and 'master_admin'
--
-- Note: bookings_insert_policy was already fixed in migration 028.
-- Note: available_slots policies were already fixed in migration 030.

-- ═══════════════════════════════════════════════════════
-- BOOKINGS TABLE — fix SELECT, UPDATE, DELETE to include master_admin
-- ═══════════════════════════════════════════════════════

-- SELECT: Athletes see own, coaches see their bookings, admins + master_admins see all
DROP POLICY IF EXISTS "bookings_select_policy" ON public.bookings;
CREATE POLICY "bookings_select_policy" ON public.bookings FOR SELECT
  USING (
    athlete_id = auth.uid()
    OR
    coach_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- UPDATE: Athletes update own, coaches update their bookings, admins + master_admins update all
DROP POLICY IF EXISTS "bookings_update_policy" ON public.bookings;
DROP POLICY IF EXISTS "Coaches can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "master_admin_update_all_bookings" ON public.bookings;
CREATE POLICY "bookings_update_policy" ON public.bookings FOR UPDATE
  USING (
    athlete_id = auth.uid()
    OR
    coach_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- DELETE: Athletes delete own, coaches delete their bookings, admins + master_admins delete all
DROP POLICY IF EXISTS "bookings_delete_policy" ON public.bookings;
CREATE POLICY "bookings_delete_policy" ON public.bookings FOR DELETE
  USING (
    athlete_id = auth.uid()
    OR
    coach_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- COACH_SCHEDULES TABLE — add master_admin support
-- ═══════════════════════════════════════════════════════

-- SELECT: anyone can view active schedules (unchanged)
-- Already exists from migration 002: "Active coach schedules are viewable by everyone"

-- ALL: Coaches manage own, admins + master_admins manage all
DROP POLICY IF EXISTS "Coaches can manage their own schedules" ON public.coach_schedules;
CREATE POLICY "Coaches can manage their own schedules" ON public.coach_schedules
  FOR ALL USING (
    auth.uid() = coach_id
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════
DO $$
BEGIN
  RAISE NOTICE 'Migration 031: Fixed bookings + coach_schedules RLS for master_admin role.';
END $$;
