-- Migration 054: Add soft-delete (archive) support for athlete profiles
-- Coaches can archive athletes; admins can permanently delete archived athletes.
-- Archived athletes are hidden from normal queries but data is preserved.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS archived_by uuid DEFAULT NULL REFERENCES profiles(id);

-- Index for fast filtering of active vs archived
CREATE INDEX IF NOT EXISTS profiles_archived_at_idx ON profiles (archived_at) WHERE archived_at IS NOT NULL;

COMMENT ON COLUMN profiles.archived_at IS 'When set, athlete is soft-deleted (hidden from roster but data preserved)';
COMMENT ON COLUMN profiles.archived_by IS 'User ID of the coach/admin who archived this athlete';
