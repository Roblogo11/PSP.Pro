-- Migration 028: Add master_admin to all RLS policies
-- master_admin role was added after initial RLS setup and was missing from permission checks
-- This grants master_admin the same (or higher) access as admin across all tables

-- ═══════════════════════════════════════════════════════
-- PROFILES TABLE (from migration 014)
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
  USING (
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- SERVICES TABLE (from migration 014)
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "services_insert_policy" ON public.services;
CREATE POLICY "services_insert_policy" ON public.services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

DROP POLICY IF EXISTS "services_update_policy" ON public.services;
CREATE POLICY "services_update_policy" ON public.services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

DROP POLICY IF EXISTS "services_delete_policy" ON public.services;
CREATE POLICY "services_delete_policy" ON public.services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- BOOKINGS TABLE (from migration 014)
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "bookings_insert_policy" ON public.bookings;
CREATE POLICY "bookings_insert_policy" ON public.bookings FOR INSERT
  WITH CHECK (
    athlete_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- AVAILABLE SLOTS TABLE (from migration 009)
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Coaches can manage own slots" ON public.available_slots;
CREATE POLICY "Coaches can manage own slots"
  ON public.available_slots FOR ALL
  USING (
    coach_id = auth.uid()
    AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('coach', 'admin', 'master_admin'))
  );

-- Master admins can also manage any coach's slots
DROP POLICY IF EXISTS "master_admin_manage_all_slots" ON public.available_slots;
CREATE POLICY "master_admin_manage_all_slots"
  ON public.available_slots FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'master_admin')
  );

-- ═══════════════════════════════════════════════════════
-- BOOKINGS UPDATE (from migration 008)
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Coaches can update their bookings" ON public.bookings;
CREATE POLICY "Coaches can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    coach_id = auth.uid()
    AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('coach', 'admin', 'master_admin'))
  );

-- Master admins can update any booking
DROP POLICY IF EXISTS "master_admin_update_all_bookings" ON public.bookings;
CREATE POLICY "master_admin_update_all_bookings"
  ON public.bookings FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'master_admin')
  );

-- ═══════════════════════════════════════════════════════
-- DRILLS TABLE (from migration 007)
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Coaches and admins can create drills" ON public.drills;
CREATE POLICY "Coaches and admins can create drills"
  ON public.drills FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('coach', 'admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- PERFORMANCE TRACKING TABLES (from migration 011)
-- Actual table names: athlete_performance_metrics, athlete_performance_goals, athlete_performance_notes
-- ═══════════════════════════════════════════════════════

-- athlete_performance_metrics
DROP POLICY IF EXISTS "Coaches and admins can insert performance metrics" ON public.athlete_performance_metrics;
CREATE POLICY "Coaches and admins can insert performance metrics"
  ON public.athlete_performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

DROP POLICY IF EXISTS "Coaches and admins can view all performance metrics" ON public.athlete_performance_metrics;
CREATE POLICY "Coaches and admins can view all performance metrics"
  ON public.athlete_performance_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
    OR athlete_id = auth.uid()
  );

DROP POLICY IF EXISTS "Coaches and admins can update performance metrics" ON public.athlete_performance_metrics;
CREATE POLICY "Coaches and admins can update performance metrics"
  ON public.athlete_performance_metrics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

DROP POLICY IF EXISTS "Coaches and admins can delete performance metrics" ON public.athlete_performance_metrics;
CREATE POLICY "Coaches and admins can delete performance metrics"
  ON public.athlete_performance_metrics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- athlete_performance_goals
DROP POLICY IF EXISTS "Coaches and admins can manage goals" ON public.athlete_performance_goals;
CREATE POLICY "Coaches and admins can manage goals"
  ON public.athlete_performance_goals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
    OR athlete_id = auth.uid()
  );

-- athlete_performance_notes
DROP POLICY IF EXISTS "Coaches and admins can manage notes" ON public.athlete_performance_notes;
CREATE POLICY "Coaches and admins can manage notes"
  ON public.athlete_performance_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
    OR (athlete_id = auth.uid() AND is_private = false)
  );

-- ═══════════════════════════════════════════════════════
-- NEWSLETTER & CONTACT TABLES (from migration 026)
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Staff can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Staff can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

DROP POLICY IF EXISTS "Staff can view submissions" ON public.contact_submissions;
CREATE POLICY "Staff can view submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

DROP POLICY IF EXISTS "Staff can update submissions" ON public.contact_submissions;
CREATE POLICY "Staff can update submissions"
  ON public.contact_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );
