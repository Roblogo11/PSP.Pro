-- ============================================================================
-- Migration 030: Leaderboard Opt-In + Region
-- Adds opt-in flag and region field to profiles for regional leaderboards
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS leaderboard_opt_in BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region TEXT;

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard ON profiles(leaderboard_opt_in) WHERE leaderboard_opt_in = true;
CREATE INDEX IF NOT EXISTS idx_profiles_region ON profiles(region) WHERE region IS NOT NULL;
