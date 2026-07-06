-- ============================================================================
-- Multi-Sport Athletes
-- Allows athletes to select multiple sports instead of just one
-- ============================================================================

-- 1. Add new array column for multiple sports
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sports TEXT[];

-- 2. Migrate existing single athlete_type to sports array
UPDATE profiles
SET sports = ARRAY[athlete_type]
WHERE athlete_type IS NOT NULL AND (sports IS NULL OR array_length(sports, 1) IS NULL);

-- 3. Add helpful comment
COMMENT ON COLUMN profiles.sports IS 'Array of sports the athlete participates in (e.g., ["softball", "basketball"])';

-- 4. Keep athlete_type for backwards compatibility (can be removed later)
-- For now, athlete_type will store the primary sport (first in array)
COMMENT ON COLUMN profiles.athlete_type IS 'DEPRECATED: Primary sport (kept for backwards compatibility). Use sports array instead.';

-- Note: We're not dropping athlete_type column yet to maintain backwards compatibility
-- Code should read from 'sports' array going forward, falling back to athlete_type if needed
