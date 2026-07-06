-- Migration 032: Fix ALL remaining RLS gaps for master_admin
-- This is the comprehensive cleanup — adds master_admin to every table
-- that was missed in earlier migrations (005, 007, 008, 015).
-- Also cleans up redundant/stale policies.

-- ═══════════════════════════════════════════════════════
-- DRILLS — master_admin missing from UPDATE and DELETE
-- ═══════════════════════════════════════════════════════

-- Drop all stale/redundant drill policies and recreate clean
DROP POLICY IF EXISTS "Published drills are viewable by authenticated users" ON public.drills;
DROP POLICY IF EXISTS "Anyone authenticated can view drills" ON public.drills;
DROP POLICY IF EXISTS "Admins and coaches can create drills" ON public.drills;
DROP POLICY IF EXISTS "Coaches and admins can create drills" ON public.drills;
DROP POLICY IF EXISTS "Admins and coaches can update drills" ON public.drills;
DROP POLICY IF EXISTS "Admins can delete drills" ON public.drills;
DROP POLICY IF EXISTS "Coaches can update their own drills" ON public.drills;
DROP POLICY IF EXISTS "Admins can update any drill" ON public.drills;
DROP POLICY IF EXISTS "Coaches can delete their own drills" ON public.drills;
DROP POLICY IF EXISTS "Admins can delete any drill" ON public.drills;

-- SELECT: any authenticated user
CREATE POLICY "drills_select" ON public.drills FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: coach, admin, master_admin
CREATE POLICY "drills_insert" ON public.drills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- UPDATE: own drills (coach) OR any drill (admin/master_admin)
CREATE POLICY "drills_update" ON public.drills FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- DELETE: own drills (coach) OR any drill (admin/master_admin)
CREATE POLICY "drills_delete" ON public.drills FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- DRILL_COMPLETIONS — master_admin missing from SELECT and INSERT
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Coaches and admins can view all completions" ON public.drill_completions;
DROP POLICY IF EXISTS "Coaches can create completions for athletes" ON public.drill_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON public.drill_completions;

-- SELECT: own user OR coach/admin/master_admin
CREATE POLICY "drill_completions_select" ON public.drill_completions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- INSERT: own user OR coach/admin/master_admin
CREATE POLICY "drill_completions_insert" ON public.drill_completions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- UPDATE: own user only
CREATE POLICY "drill_completions_update" ON public.drill_completions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════
-- ASSIGNED_DRILLS — master_admin missing from all write ops
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Coaches and admins can assign drills" ON public.assigned_drills;
DROP POLICY IF EXISTS "Coaches and admins can update assigned drills" ON public.assigned_drills;
DROP POLICY IF EXISTS "Coaches and admins can delete assigned drills" ON public.assigned_drills;

-- SELECT: own athlete OR coach/admin/master_admin
CREATE POLICY "assigned_drills_select" ON public.assigned_drills FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- INSERT: coach/admin/master_admin
CREATE POLICY "assigned_drills_insert" ON public.assigned_drills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- UPDATE: coach/admin/master_admin
CREATE POLICY "assigned_drills_update" ON public.assigned_drills FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- DELETE: coach/admin/master_admin
CREATE POLICY "assigned_drills_delete" ON public.assigned_drills FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- VELOCITY_LOGS — master_admin missing from SELECT and INSERT
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Coaches and admins can view all velocity logs" ON public.velocity_logs;
DROP POLICY IF EXISTS "Coaches can create velocity logs for athletes" ON public.velocity_logs;
DROP POLICY IF EXISTS "Users can update own velocity logs" ON public.velocity_logs;

-- SELECT: own user OR coach/admin/master_admin
CREATE POLICY "velocity_logs_select" ON public.velocity_logs FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- INSERT: own user OR coach/admin/master_admin
CREATE POLICY "velocity_logs_insert" ON public.velocity_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- UPDATE: own user only
CREATE POLICY "velocity_logs_update" ON public.velocity_logs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════
-- SESSIONS — master_admin missing from SELECT
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Coaches and admins can view all sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.sessions;

-- SELECT: own user OR coach/admin/master_admin
CREATE POLICY "sessions_select" ON public.sessions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- DELETE: own user only
CREATE POLICY "sessions_delete" ON public.sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════
-- TRAINING_PACKAGES — master_admin missing entirely
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Admins can manage packages" ON public.training_packages;
-- Keep: "Active packages are viewable by everyone" (SELECT, unchanged)

-- ALL management: admin + master_admin
CREATE POLICY "staff_manage_training_packages" ON public.training_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- ATHLETE_PACKAGES — master_admin missing entirely
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Admins can view all athlete packages" ON public.athlete_packages;
DROP POLICY IF EXISTS "Admins can manage athlete packages" ON public.athlete_packages;
-- Keep: "Athletes can view their own packages" (SELECT, unchanged)
-- Keep: "Athletes can purchase packages" (INSERT, unchanged)

-- SELECT all: coach/admin/master_admin
CREATE POLICY "staff_view_athlete_packages" ON public.athlete_packages FOR SELECT
  TO authenticated
  USING (
    athlete_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- ALL management: admin/master_admin
CREATE POLICY "staff_manage_athlete_packages" ON public.athlete_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- COACH_ATHLETES — master_admin missing entirely
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Coaches can view their athletes" ON public.coach_athletes;
DROP POLICY IF EXISTS "Athletes can view their coaches" ON public.coach_athletes;
DROP POLICY IF EXISTS "Admins can view all relationships" ON public.coach_athletes;
DROP POLICY IF EXISTS "Admins can manage relationships" ON public.coach_athletes;
DROP POLICY IF EXISTS "coach_athletes_select_policy" ON public.coach_athletes;
DROP POLICY IF EXISTS "coach_athletes_insert_policy" ON public.coach_athletes;
DROP POLICY IF EXISTS "coach_athletes_update_policy" ON public.coach_athletes;
DROP POLICY IF EXISTS "coach_athletes_delete_policy" ON public.coach_athletes;

-- SELECT: own coach, own athlete, OR admin/master_admin
CREATE POLICY "coach_athletes_select" ON public.coach_athletes FOR SELECT
  TO authenticated
  USING (
    coach_id = auth.uid()
    OR
    athlete_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- INSERT: own coach OR admin/master_admin
CREATE POLICY "coach_athletes_insert" ON public.coach_athletes FOR INSERT
  TO authenticated
  WITH CHECK (
    coach_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- UPDATE: own coach OR admin/master_admin
CREATE POLICY "coach_athletes_update" ON public.coach_athletes FOR UPDATE
  TO authenticated
  USING (
    coach_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- DELETE: own coach OR admin/master_admin
CREATE POLICY "coach_athletes_delete" ON public.coach_athletes FOR DELETE
  TO authenticated
  USING (
    coach_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- CLEANUP: Remove redundant policies from 015
-- These are fully superseded by 028 policies
-- ═══════════════════════════════════════════════════════

DROP POLICY IF EXISTS "performance_metrics_select_policy" ON public.athlete_performance_metrics;
DROP POLICY IF EXISTS "performance_metrics_insert_policy" ON public.athlete_performance_metrics;
DROP POLICY IF EXISTS "performance_metrics_update_policy" ON public.athlete_performance_metrics;
DROP POLICY IF EXISTS "performance_metrics_delete_policy" ON public.athlete_performance_metrics;

DROP POLICY IF EXISTS "performance_goals_select_policy" ON public.athlete_performance_goals;
DROP POLICY IF EXISTS "performance_goals_insert_policy" ON public.athlete_performance_goals;
DROP POLICY IF EXISTS "performance_goals_update_policy" ON public.athlete_performance_goals;
DROP POLICY IF EXISTS "performance_goals_delete_policy" ON public.athlete_performance_goals;

DROP POLICY IF EXISTS "performance_notes_select_policy" ON public.athlete_performance_notes;
DROP POLICY IF EXISTS "performance_notes_insert_policy" ON public.athlete_performance_notes;
DROP POLICY IF EXISTS "performance_notes_update_policy" ON public.athlete_performance_notes;
DROP POLICY IF EXISTS "performance_notes_delete_policy" ON public.athlete_performance_notes;

-- Also clean up redundant newsletter/contact policies from 026
DROP POLICY IF EXISTS "Coaches can view newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Coaches can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Coaches can update contact submissions" ON public.contact_submissions;

-- ═══════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════
DO $$
BEGIN
  RAISE NOTICE 'Migration 032: ALL RLS gaps fixed. master_admin now has full access across all tables.';
END $$;
