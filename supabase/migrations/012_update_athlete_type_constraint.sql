-- Update athlete_type check constraint to allow soccer, basketball, softball
-- instead of baseball

-- Drop the old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_athlete_type_check;

-- Add the new constraint with updated sports
ALTER TABLE profiles ADD CONSTRAINT profiles_athlete_type_check
  CHECK (athlete_type IN ('soccer', 'basketball', 'softball'));

-- Update any existing 'baseball' values to 'soccer' (if any exist)
UPDATE profiles SET athlete_type = 'soccer' WHERE athlete_type = 'baseball';
UPDATE profiles SET athlete_type = 'softball' WHERE athlete_type = 'softball';
-- 'other' becomes 'soccer' as default
UPDATE profiles SET athlete_type = 'soccer' WHERE athlete_type = 'other';
