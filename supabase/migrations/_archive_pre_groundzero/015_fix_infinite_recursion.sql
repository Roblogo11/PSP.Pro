-- Fix infinite recursion in RLS policies
-- Create SECURITY DEFINER function in public schema to avoid recursion

-- Drop the broken policies first
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Create a SECURITY DEFINER function in public schema to get current user's role
-- This function bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Now recreate the policies using the function instead of querying profiles directly
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
  USING (
    id = auth.uid() -- Users can see their own profile
    OR
    (public.get_current_user_role() IN ('coach', 'admin') AND role = 'athlete') -- Coaches see athletes
    OR
    public.get_current_user_role() = 'admin' -- Admins see all
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT
  WITH CHECK (
    id = auth.uid() -- Users can insert their own profile
    OR
    public.get_current_user_role() = 'admin' -- Admins can insert any profile
  );

CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
  USING (
    id = auth.uid() -- Users can update their own profile
    OR
    (public.get_current_user_role() IN ('coach', 'admin') AND role = 'athlete') -- Coaches update athletes
    OR
    public.get_current_user_role() = 'admin' -- Admins update all
  );

CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE
  USING (
    public.get_current_user_role() = 'admin' -- Only admins can delete
  );

-- Also update other tables that might have the same recursion issue
-- SERVICES - these are fine, they don't have recursion

-- BOOKINGS - these are fine, they use coach_id/athlete_id directly

-- COACH_ATHLETES
DROP POLICY IF EXISTS "coach_athletes_select_policy" ON public.coach_athletes;
DROP POLICY IF EXISTS "coach_athletes_insert_policy" ON public.coach_athletes;
DROP POLICY IF EXISTS "coach_athletes_update_policy" ON public.coach_athletes;
DROP POLICY IF EXISTS "coach_athletes_delete_policy" ON public.coach_athletes;

CREATE POLICY "coach_athletes_select_policy" ON public.coach_athletes FOR SELECT
  USING (
    coach_id = auth.uid()
    OR
    athlete_id = auth.uid()
    OR
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "coach_athletes_insert_policy" ON public.coach_athletes FOR INSERT
  WITH CHECK (
    coach_id = auth.uid()
    OR
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "coach_athletes_update_policy" ON public.coach_athletes FOR UPDATE
  USING (
    coach_id = auth.uid()
    OR
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "coach_athletes_delete_policy" ON public.coach_athletes FOR DELETE
  USING (
    coach_id = auth.uid()
    OR
    public.get_current_user_role() = 'admin'
  );

-- ATHLETE PERFORMANCE METRICS
DROP POLICY IF EXISTS "performance_metrics_select_policy" ON public.athlete_performance_metrics;
DROP POLICY IF EXISTS "Coaches and admins can insert performance metrics" ON public.athlete_performance_metrics;
DROP POLICY IF EXISTS "Coaches and admins can update performance metrics" ON public.athlete_performance_metrics;
DROP POLICY IF EXISTS "Coaches and admins can delete performance metrics" ON public.athlete_performance_metrics;

CREATE POLICY "performance_metrics_select_policy" ON public.athlete_performance_metrics FOR SELECT
  USING (
    athlete_id = auth.uid()
    OR
    public.get_current_user_role() IN ('coach', 'admin')
  );

CREATE POLICY "performance_metrics_insert_policy" ON public.athlete_performance_metrics FOR INSERT
  WITH CHECK (
    public.get_current_user_role() IN ('coach', 'admin')
  );

CREATE POLICY "performance_metrics_update_policy" ON public.athlete_performance_metrics FOR UPDATE
  USING (
    public.get_current_user_role() IN ('coach', 'admin')
  );

CREATE POLICY "performance_metrics_delete_policy" ON public.athlete_performance_metrics FOR DELETE
  USING (
    public.get_current_user_role() IN ('coach', 'admin')
  );

-- ATHLETE PERFORMANCE GOALS
DROP POLICY IF EXISTS "performance_goals_select_policy" ON public.athlete_performance_goals;
DROP POLICY IF EXISTS "performance_goals_insert_policy" ON public.athlete_performance_goals;
DROP POLICY IF EXISTS "performance_goals_update_policy" ON public.athlete_performance_goals;
DROP POLICY IF EXISTS "performance_goals_delete_policy" ON public.athlete_performance_goals;

CREATE POLICY "performance_goals_select_policy" ON public.athlete_performance_goals FOR SELECT
  USING (
    athlete_id = auth.uid()
    OR
    public.get_current_user_role() IN ('coach', 'admin')
  );

CREATE POLICY "performance_goals_insert_policy" ON public.athlete_performance_goals FOR INSERT
  WITH CHECK (
    public.get_current_user_role() IN ('coach', 'admin')
  );

CREATE POLICY "performance_goals_update_policy" ON public.athlete_performance_goals FOR UPDATE
  USING (
    public.get_current_user_role() IN ('coach', 'admin')
  );

CREATE POLICY "performance_goals_delete_policy" ON public.athlete_performance_goals FOR DELETE
  USING (
    public.get_current_user_role() IN ('coach', 'admin')
  );

-- ATHLETE PERFORMANCE NOTES
DROP POLICY IF EXISTS "performance_notes_select_policy" ON public.athlete_performance_notes;
DROP POLICY IF EXISTS "performance_notes_insert_policy" ON public.athlete_performance_notes;
DROP POLICY IF EXISTS "performance_notes_update_policy" ON public.athlete_performance_notes;
DROP POLICY IF EXISTS "performance_notes_delete_policy" ON public.athlete_performance_notes;

CREATE POLICY "performance_notes_select_policy" ON public.athlete_performance_notes FOR SELECT
  USING (
    (athlete_id = auth.uid() AND is_private = false)
    OR
    public.get_current_user_role() IN ('coach', 'admin')
  );

CREATE POLICY "performance_notes_insert_policy" ON public.athlete_performance_notes FOR INSERT
  WITH CHECK (
    public.get_current_user_role() IN ('coach', 'admin')
  );

CREATE POLICY "performance_notes_update_policy" ON public.athlete_performance_notes FOR UPDATE
  USING (
    public.get_current_user_role() IN ('coach', 'admin')
  );

CREATE POLICY "performance_notes_delete_policy" ON public.athlete_performance_notes FOR DELETE
  USING (
    public.get_current_user_role() IN ('coach', 'admin')
  );
