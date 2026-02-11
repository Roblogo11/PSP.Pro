-- Migration 030: Fix available_slots RLS policies
-- master_admin was missing from the SELECT policies added in migration 009
-- This caused master admins to be unable to see their own slots after creating them

-- Drop ALL old available_slots policies and recreate cleanly
DROP POLICY IF EXISTS "Anyone can view available slots" ON public.available_slots;
DROP POLICY IF EXISTS "Coaches can view own slots" ON public.available_slots;
DROP POLICY IF EXISTS "Admins can view all slots" ON public.available_slots;
DROP POLICY IF EXISTS "Coaches can manage own slots" ON public.available_slots;
DROP POLICY IF EXISTS "Admins can manage all slots" ON public.available_slots;
DROP POLICY IF EXISTS "master_admin_manage_all_slots" ON public.available_slots;

-- 1. Anyone can view available future slots (for booking page)
CREATE POLICY "Anyone can view available slots"
  ON public.available_slots FOR SELECT
  USING (is_available = TRUE AND slot_date >= CURRENT_DATE);

-- 2. Staff can view ALL their own slots (including past/unavailable)
CREATE POLICY "Staff can view own slots"
  ON public.available_slots FOR SELECT
  USING (coach_id = auth.uid());

-- 3. Admins and master admins can view ALL slots from any coach
CREATE POLICY "Admins can view all slots"
  ON public.available_slots FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'master_admin')
    )
  );

-- 4. Staff can manage (insert/update/delete) their own slots
CREATE POLICY "Staff can manage own slots"
  ON public.available_slots FOR ALL
  USING (
    coach_id = auth.uid()
    AND auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('coach', 'admin', 'master_admin')
    )
  );

-- 5. Admins and master admins can manage ANY coach's slots
CREATE POLICY "Admins can manage all slots"
  ON public.available_slots FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'master_admin')
    )
  );
