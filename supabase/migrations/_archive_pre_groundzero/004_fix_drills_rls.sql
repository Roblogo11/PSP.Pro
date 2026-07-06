-- =============================================
-- Fix Drills RLS Policies
-- Allow admins and coaches to create/update drills
-- =============================================

-- Drop existing restrictive policy if exists
DROP POLICY IF EXISTS "Drills are viewable by authenticated users" ON public.drills;

-- Create new policies

-- Anyone authenticated can view published drills
CREATE POLICY "Published drills are viewable by authenticated users"
  ON public.drills FOR SELECT
  USING (auth.role() = 'authenticated' AND published = true);

-- Admins and coaches can insert drills
CREATE POLICY "Admins and coaches can create drills"
  ON public.drills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Admins and coaches can update drills
CREATE POLICY "Admins and coaches can update drills"
  ON public.drills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Admins can delete drills
CREATE POLICY "Admins can delete drills"
  ON public.drills FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
