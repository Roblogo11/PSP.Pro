-- Add trial period support for coach-created athletes
-- Coaches can set a trial_expires_at date when creating athletes
-- After trial expires, athletes must purchase a package to access dashboard

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ;

-- Set a default 30-day trial for existing coach-created athletes (those with sports set)
UPDATE profiles
SET trial_expires_at = created_at + INTERVAL '30 days'
WHERE role = 'athlete'
  AND sports IS NOT NULL
  AND array_length(sports, 1) > 0
  AND trial_expires_at IS NULL;
