-- Allow coaches to view athlete profiles
-- This is needed so coaches can see the athletes list in the admin panel

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Coaches can view athlete profiles" ON public.profiles;

-- Create policy for coaches to view athlete profiles
CREATE POLICY "Coaches can view athlete profiles"
  ON public.profiles FOR SELECT
  USING (
    -- Coaches can view athlete profiles
    (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('coach', 'admin')
      )
      AND role = 'athlete'
    )
    OR
    -- Admins can view all profiles
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    -- Users can view their own profile
    id = auth.uid()
  );
