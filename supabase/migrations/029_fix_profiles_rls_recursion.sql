-- Migration 029: Fix recursive RLS policies on profiles table
-- The original policies queried profiles FROM WITHIN profiles policies,
-- causing infinite recursion and 500 errors from Supabase.
-- Staff operations use the admin client (service role key) which bypasses RLS,
-- so these simple policies are sufficient.
--
-- ALREADY RUN on Supabase production — this file is for reference only.

-- SELECT: anyone can read profiles (name, role, avatar are not sensitive)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  TO public
  USING (true);

-- INSERT: users can only insert their own profile
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK (id = auth.uid());

-- UPDATE: users can only update their own profile
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  TO public
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- DELETE: users can only delete their own profile
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE
  TO public
  USING (id = auth.uid());
