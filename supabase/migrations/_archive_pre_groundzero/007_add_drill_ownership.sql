-- Add created_by to track drill ownership
-- Coaches can only manage drills they created
-- Admins can manage all drills

-- Add created_by column
ALTER TABLE public.drills
ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Set existing drills to be owned by first admin (migration fallback)
-- In production, you can manually assign ownership as needed
UPDATE public.drills
SET created_by = (
  SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1
)
WHERE created_by IS NULL;

-- Add RLS policies for drill ownership
-- Drop existing drill policies
DROP POLICY IF EXISTS "Coaches can view all drills" ON public.drills;
DROP POLICY IF EXISTS "Coaches can create drills" ON public.drills;
DROP POLICY IF EXISTS "Coaches can update all drills" ON public.drills;

-- New ownership-based policies
CREATE POLICY "Anyone authenticated can view drills"
  ON public.drills FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches and admins can create drills"
  ON public.drills FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Admins can update any drill"
  ON public.drills FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Coaches can update their own drills"
  ON public.drills FOR UPDATE
  USING (
    created_by = auth.uid()
    AND auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'coach'
    )
  );

CREATE POLICY "Admins can delete any drill"
  ON public.drills FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Coaches can delete their own drills"
  ON public.drills FOR DELETE
  USING (
    created_by = auth.uid()
    AND auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'coach'
    )
  );

-- Add index for faster queries
CREATE INDEX idx_drills_created_by ON public.drills(created_by);

-- Add helpful comment
COMMENT ON COLUMN public.drills.created_by IS 'Coach/admin who created this drill. Coaches can only edit/delete their own drills. Admins can manage all drills.';
