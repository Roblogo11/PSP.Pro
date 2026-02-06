-- =============================================
-- Comprehensive RLS Policy Fix
-- Ensures all tables have proper INSERT/UPDATE/DELETE policies
-- for admins and coaches where appropriate
-- =============================================

-- =============================================
-- 1. DRILLS TABLE
-- =============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Drills are viewable by authenticated users" ON public.drills;

-- SELECT: Anyone authenticated can view published drills
CREATE POLICY "Published drills are viewable by authenticated users"
  ON public.drills FOR SELECT
  USING (auth.role() = 'authenticated' AND published = true);

-- INSERT: Admins and coaches can create drills
CREATE POLICY "Admins and coaches can create drills"
  ON public.drills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- UPDATE: Admins and coaches can update drills
CREATE POLICY "Admins and coaches can update drills"
  ON public.drills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- DELETE: Admins can delete drills
CREATE POLICY "Admins can delete drills"
  ON public.drills FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


-- =============================================
-- 2. ASSIGNED DRILLS TABLE
-- =============================================

-- Add missing INSERT policy for coaches/admins
CREATE POLICY "Coaches and admins can assign drills"
  ON public.assigned_drills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Add missing DELETE policy for coaches/admins
CREATE POLICY "Coaches and admins can delete assigned drills"
  ON public.assigned_drills FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Add policy for coaches/admins to UPDATE assigned drills
DROP POLICY IF EXISTS "Users can update own assigned drills" ON public.assigned_drills;

CREATE POLICY "Athletes can update their own assigned drills"
  ON public.assigned_drills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches and admins can update assigned drills"
  ON public.assigned_drills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );


-- =============================================
-- 3. SESSIONS TABLE
-- =============================================

-- Add missing DELETE policy
CREATE POLICY "Users can delete own sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Add policy for coaches/admins to view all sessions
CREATE POLICY "Coaches and admins can view all sessions"
  ON public.sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );


-- =============================================
-- 4. VELOCITY LOGS TABLE
-- =============================================

-- Add missing UPDATE policy
CREATE POLICY "Users can update own velocity logs"
  ON public.velocity_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Add policy for coaches/admins to view all velocity logs
CREATE POLICY "Coaches and admins can view all velocity logs"
  ON public.velocity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Add policy for coaches to create velocity logs on behalf of athletes
CREATE POLICY "Coaches can create velocity logs for athletes"
  ON public.velocity_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );


-- =============================================
-- 5. DRILL COMPLETIONS TABLE
-- =============================================

-- Add missing UPDATE policy
CREATE POLICY "Users can update own completions"
  ON public.drill_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Add policy for coaches/admins to view all completions
CREATE POLICY "Coaches and admins can view all completions"
  ON public.drill_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Add policy for coaches to create completions on behalf of athletes
CREATE POLICY "Coaches can create completions for athletes"
  ON public.drill_completions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );


-- =============================================
-- 6. PROFILES TABLE (Admin management)
-- =============================================

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add policy for admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


-- =============================================
-- SUMMARY
-- =============================================
-- ✅ Drills: Admins/coaches can INSERT/UPDATE, admins can DELETE
-- ✅ Assigned Drills: Coaches/admins can INSERT/UPDATE/DELETE
-- ✅ Sessions: Users can DELETE own, coaches/admins can view all
-- ✅ Velocity Logs: Coaches can INSERT/view all, users can UPDATE own
-- ✅ Drill Completions: Coaches can INSERT/view all, users can UPDATE own
-- ✅ Profiles: Admins can view/update all profiles
-- ✅ All booking system tables already had proper policies (from 002_booking_system.sql)
-- =============================================
