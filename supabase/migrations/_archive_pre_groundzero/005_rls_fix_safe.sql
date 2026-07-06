-- =============================================
-- Safe RLS Policy Additions
-- Only adds missing policies, won't conflict with existing ones
-- =============================================

-- DRILLS TABLE: Add INSERT/UPDATE/DELETE policies for admins/coaches
-- =============================================

-- Drop and recreate the restrictive SELECT policy
DROP POLICY IF EXISTS "Drills are viewable by authenticated users" ON public.drills;
DROP POLICY IF EXISTS "Published drills are viewable by authenticated users" ON public.drills;

CREATE POLICY "Published drills are viewable by authenticated users"
  ON public.drills FOR SELECT
  USING (auth.role() = 'authenticated' AND published = true);

-- INSERT policy
DROP POLICY IF EXISTS "Admins and coaches can create drills" ON public.drills;
CREATE POLICY "Admins and coaches can create drills"
  ON public.drills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- UPDATE policy
DROP POLICY IF EXISTS "Admins and coaches can update drills" ON public.drills;
CREATE POLICY "Admins and coaches can update drills"
  ON public.drills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- DELETE policy
DROP POLICY IF EXISTS "Admins can delete drills" ON public.drills;
CREATE POLICY "Admins can delete drills"
  ON public.drills FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


-- ASSIGNED DRILLS: Add missing INSERT/DELETE policies
-- =============================================

DROP POLICY IF EXISTS "Coaches and admins can assign drills" ON public.assigned_drills;
CREATE POLICY "Coaches and admins can assign drills"
  ON public.assigned_drills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

DROP POLICY IF EXISTS "Coaches and admins can delete assigned drills" ON public.assigned_drills;
CREATE POLICY "Coaches and admins can delete assigned drills"
  ON public.assigned_drills FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

DROP POLICY IF EXISTS "Coaches and admins can update assigned drills" ON public.assigned_drills;
CREATE POLICY "Coaches and admins can update assigned drills"
  ON public.assigned_drills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );


-- SESSIONS: Add policies for coaches to view/manage
-- =============================================

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.sessions;
CREATE POLICY "Users can delete own sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches and admins can view all sessions" ON public.sessions;
CREATE POLICY "Coaches and admins can view all sessions"
  ON public.sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );


-- VELOCITY LOGS: Add policies for coaches
-- =============================================

DROP POLICY IF EXISTS "Users can update own velocity logs" ON public.velocity_logs;
CREATE POLICY "Users can update own velocity logs"
  ON public.velocity_logs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches and admins can view all velocity logs" ON public.velocity_logs;
CREATE POLICY "Coaches and admins can view all velocity logs"
  ON public.velocity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

DROP POLICY IF EXISTS "Coaches can create velocity logs for athletes" ON public.velocity_logs;
CREATE POLICY "Coaches can create velocity logs for athletes"
  ON public.velocity_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );


-- DRILL COMPLETIONS: Add policies for coaches
-- =============================================

DROP POLICY IF EXISTS "Users can update own completions" ON public.drill_completions;
CREATE POLICY "Users can update own completions"
  ON public.drill_completions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches and admins can view all completions" ON public.drill_completions;
CREATE POLICY "Coaches and admins can view all completions"
  ON public.drill_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

DROP POLICY IF EXISTS "Coaches can create completions for athletes" ON public.drill_completions;
CREATE POLICY "Coaches can create completions for athletes"
  ON public.drill_completions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );


-- PROFILES: Add admin management policies
-- =============================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
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
-- Done! All RLS policies are now in place.
-- =============================================
