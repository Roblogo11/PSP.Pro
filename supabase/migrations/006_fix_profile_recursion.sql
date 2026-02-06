-- =============================================
-- Fix Profiles RLS Infinite Recursion
-- =============================================

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create simple, non-recursive policies

-- 1. Users can ALWAYS view their own profile (no role check = no recursion)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Users can update their own profile
-- (This should already exist but let's ensure it)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Users can insert their own profile during signup
-- (This should already exist)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- For admin functionality, we'll handle it differently:
-- Admins will need to use the service role key for
-- viewing all profiles, or we can add a stored procedure
-- =============================================

-- Note: The previous "Admins can view all profiles" policy
-- caused infinite recursion. Admin views should be handled
-- via API routes with service role or stored procedures.
