-- Migration 050: Parent/Guardian Account Support
--
-- For COPPA compliance, under-13 athletes get "parent/guardian" accounts:
-- the account belongs to the parent (login email, name), while the child's
-- name and age are stored separately. The parent views the child's
-- training dashboard.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'standard'
    CHECK (account_type IN ('standard', 'parent_guardian')),
  ADD COLUMN IF NOT EXISTS child_name TEXT,
  ADD COLUMN IF NOT EXISTS child_age INTEGER;

CREATE INDEX IF NOT EXISTS idx_profiles_account_type
  ON profiles(account_type) WHERE account_type = 'parent_guardian';

COMMENT ON COLUMN profiles.account_type IS 'standard = normal account, parent_guardian = parent managing under-13 child athlete';
COMMENT ON COLUMN profiles.child_name IS 'Child athlete name (only when account_type = parent_guardian)';
COMMENT ON COLUMN profiles.child_age IS 'Child athlete age (only when account_type = parent_guardian)';
