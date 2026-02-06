-- Check Drills Table Schema
-- Run this in Supabase SQL Editor to see actual column names

-- 1. List all columns in drills table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'drills'
ORDER BY ordinal_position;

-- 2. Show sample drill data (if any exists)
SELECT * FROM drills LIMIT 1;

-- 3. Common fixes based on schema mismatch:

-- If duration column is missing, add it:
-- ALTER TABLE drills ADD COLUMN duration TEXT;

-- If it's named duration_minutes instead:
-- ALTER TABLE drills RENAME COLUMN duration_minutes TO duration;
-- OR update code to use duration_minutes

-- If you want both (text and numeric):
-- ALTER TABLE drills ADD COLUMN duration TEXT;
-- UPDATE drills SET duration = duration_minutes || ' minutes' WHERE duration_minutes IS NOT NULL;
