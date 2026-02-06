-- Add parent/guardian fields to profiles table
-- Only needed for athletes under 18

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS parent_guardian_name TEXT,
ADD COLUMN IF NOT EXISTS parent_guardian_email TEXT,
ADD COLUMN IF NOT EXISTS parent_guardian_phone TEXT;

-- Add index for parent email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_parent_email ON public.profiles(parent_guardian_email);

-- Add comment
COMMENT ON COLUMN public.profiles.parent_guardian_name IS 'Parent or guardian name for athletes under 18';
COMMENT ON COLUMN public.profiles.parent_guardian_email IS 'Parent or guardian email for athletes under 18';
COMMENT ON COLUMN public.profiles.parent_guardian_phone IS 'Parent or guardian phone for athletes under 18';
