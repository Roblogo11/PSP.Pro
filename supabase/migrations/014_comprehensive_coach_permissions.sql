-- Comprehensive RLS policy updates for coach permissions
-- This ensures coaches have all necessary permissions for full admin panel functionality

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

-- Drop old policies that might conflict
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can view athlete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- SELECT: Users can view their own profile, coaches can view athletes, admins see all
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
  USING (
    id = auth.uid() -- Users can see their own profile
    OR
    EXISTS ( -- Coaches can see athlete profiles
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
      AND public.profiles.role = 'athlete'
    )
    OR
    EXISTS ( -- Admins can see all profiles
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- INSERT: Users can create their own profile, admins can create any
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT
  WITH CHECK (
    id = auth.uid() -- Users can insert their own profile
    OR
    EXISTS ( -- Admins can insert any profile
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- UPDATE: Users update own, coaches update athletes, admins update all
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
  USING (
    id = auth.uid() -- Users can update their own profile
    OR
    EXISTS ( -- Coaches can update athlete profiles
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
      AND public.profiles.role = 'athlete'
    )
    OR
    EXISTS ( -- Admins can update any profile
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- DELETE: Only admins can delete profiles
CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SERVICES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

-- Everyone can view services
CREATE POLICY "services_select_policy" ON public.services FOR SELECT
  USING (true);

-- Coaches and admins can manage services
CREATE POLICY "services_insert_policy" ON public.services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "services_update_policy" ON public.services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "services_delete_policy" ON public.services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Athletes can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Coaches can view their assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Coaches can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Athletes can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Athletes can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Athletes can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Coaches can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Coaches and admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;

-- SELECT: Athletes see own, coaches see their bookings, admins see all
CREATE POLICY "bookings_select_policy" ON public.bookings FOR SELECT
  USING (
    athlete_id = auth.uid() -- Athletes see their own
    OR
    coach_id = auth.uid() -- Coaches see their bookings
    OR
    EXISTS ( -- Admins see all
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- INSERT: Athletes can create, coaches/admins can create for athletes
CREATE POLICY "bookings_insert_policy" ON public.bookings FOR INSERT
  WITH CHECK (
    athlete_id = auth.uid() -- Athletes can create their own
    OR
    EXISTS ( -- Coaches and admins can create for athletes
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

-- UPDATE: Athletes update own, coaches/admins update their bookings
CREATE POLICY "bookings_update_policy" ON public.bookings FOR UPDATE
  USING (
    athlete_id = auth.uid() -- Athletes can update their own
    OR
    coach_id = auth.uid() -- Coaches can update their bookings
    OR
    EXISTS ( -- Admins can update all
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- DELETE: Same as update
CREATE POLICY "bookings_delete_policy" ON public.bookings FOR DELETE
  USING (
    athlete_id = auth.uid()
    OR
    coach_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- COACH_ATHLETES TABLE (if exists)
-- ============================================================================

DROP POLICY IF EXISTS "Coaches can view their athletes" ON public.coach_athletes;
DROP POLICY IF EXISTS "Athletes can view their coaches" ON public.coach_athletes;
DROP POLICY IF EXISTS "Admins can view all relationships" ON public.coach_athletes;
DROP POLICY IF EXISTS "Admins can manage relationships" ON public.coach_athletes;

-- SELECT: Coaches see their athletes, athletes see their coaches, admins see all
CREATE POLICY "coach_athletes_select_policy" ON public.coach_athletes FOR SELECT
  USING (
    coach_id = auth.uid()
    OR
    athlete_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- INSERT/UPDATE/DELETE: Coaches and admins can manage
CREATE POLICY "coach_athletes_insert_policy" ON public.coach_athletes FOR INSERT
  WITH CHECK (
    coach_id = auth.uid() -- Coaches can add their own relationships
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "coach_athletes_update_policy" ON public.coach_athletes FOR UPDATE
  USING (
    coach_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "coach_athletes_delete_policy" ON public.coach_athletes FOR DELETE
  USING (
    coach_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- ATHLETE PERFORMANCE METRICS
-- ============================================================================

-- Athletes should also be able to view their own metrics
DROP POLICY IF EXISTS "Coaches and admins can view all performance metrics" ON public.athlete_performance_metrics;

CREATE POLICY "performance_metrics_select_policy" ON public.athlete_performance_metrics FOR SELECT
  USING (
    athlete_id = auth.uid() -- Athletes can view their own
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

-- ============================================================================
-- ATHLETE PERFORMANCE GOALS
-- ============================================================================

DROP POLICY IF EXISTS "Coaches and admins can manage goals" ON public.athlete_performance_goals;

CREATE POLICY "performance_goals_select_policy" ON public.athlete_performance_goals FOR SELECT
  USING (
    athlete_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "performance_goals_insert_policy" ON public.athlete_performance_goals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "performance_goals_update_policy" ON public.athlete_performance_goals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "performance_goals_delete_policy" ON public.athlete_performance_goals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

-- ============================================================================
-- ATHLETE PERFORMANCE NOTES
-- ============================================================================

DROP POLICY IF EXISTS "Coaches and admins can manage notes" ON public.athlete_performance_notes;

CREATE POLICY "performance_notes_select_policy" ON public.athlete_performance_notes FOR SELECT
  USING (
    athlete_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "performance_notes_insert_policy" ON public.athlete_performance_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "performance_notes_update_policy" ON public.athlete_performance_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "performance_notes_delete_policy" ON public.athlete_performance_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );
