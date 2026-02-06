-- ============================================================================
-- Drills Schema Enhancement
-- Adds human-readable duration field alongside duration_seconds
-- ============================================================================

-- 1. Add duration TEXT field for display (human-readable)
ALTER TABLE drills ADD COLUMN IF NOT EXISTS duration TEXT;

-- 2. Populate duration field from existing duration_seconds
UPDATE drills
SET duration = CASE
  WHEN duration_seconds IS NOT NULL THEN
    CASE
      WHEN duration_seconds < 60 THEN duration_seconds || ' seconds'
      WHEN duration_seconds % 60 = 0 THEN (duration_seconds / 60) || ' minutes'
      ELSE FLOOR(duration_seconds / 60) || ':' || LPAD((duration_seconds % 60)::TEXT, 2, '0') || ' minutes'
    END
  ELSE '15 minutes'
END
WHERE duration IS NULL;

-- 3. Add helpful comments
COMMENT ON COLUMN drills.duration IS 'Human-readable duration for display (e.g., "15 minutes", "45 seconds")';
COMMENT ON COLUMN drills.duration_seconds IS 'Duration in seconds for calculations and sorting';

-- Note: All other columns (video_url, equipment_needed, published, featured)
-- are already correctly named and match the code. No renaming needed.
