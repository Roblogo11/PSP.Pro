-- Migration 057: Multi-child parent accounts
--
-- Background: Migration 050 added parent_guardian accounts with a SINGLE child
-- (profiles.child_name, profiles.child_age). Coaches frequently work with multiple
-- siblings under one parent, but each child needs their own record (separate
-- bookings, metrics, progress).
--
-- This migration:
--   1. Adds a children table (one row per athlete, owned by a parent profile).
--   2. Adds active_child_id on parent profile for the UI selector.
--   3. Backfills existing parent_guardian profiles into the new table.
--   4. Keeps profiles.child_name / profiles.child_age for backward compat
--      (treated as the "primary child" mirror).

-- ── Table: parent_children ──────────────────────────────────────────
-- One row per athlete that a parent manages. Children are not separate
-- auth users; they are managed entirely under the parent's account.
CREATE TABLE IF NOT EXISTS parent_children (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_name   TEXT NOT NULL,
  child_age    INTEGER,
  athlete_type TEXT,                  -- e.g. 'softball', 'basketball'
  sports       TEXT[],                -- multiple sports
  notes        TEXT,                  -- coach notes about this child
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);

-- ── Profile column: active_child_id ────────────────────────────────
-- Which child the parent is currently "operating as" in the dashboard
-- (booking, viewing progress, etc.). Null = parent hasn't picked yet
-- (UI defaults to the first child).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS active_child_id UUID REFERENCES parent_children(id) ON DELETE SET NULL;

-- ── Bookings: track which child the booking is for ────────────────
-- For non-parent accounts this stays NULL (the athlete_id IS the athlete).
-- For parent_guardian accounts, this tells the coach which sibling is on the schedule.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES parent_children(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_child ON bookings(child_id);

-- ── Metrics: track which child the metrics are for ────────────────
ALTER TABLE athlete_performance_metrics
  ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES parent_children(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_metrics_child ON athlete_performance_metrics(child_id);

-- ── Backfill: every existing parent_guardian profile → one child row ──
INSERT INTO parent_children (parent_id, child_name, child_age, athlete_type, sports)
SELECT
  id,
  child_name,
  child_age,
  athlete_type,
  sports
FROM profiles
WHERE account_type = 'parent_guardian'
  AND child_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM parent_children WHERE parent_id = profiles.id
  );

-- Set active_child_id to the first (and only) child after backfill
UPDATE profiles p
SET active_child_id = c.id
FROM parent_children c
WHERE c.parent_id = p.id
  AND p.account_type = 'parent_guardian'
  AND p.active_child_id IS NULL;

-- ── RLS: parent_children ──────────────────────────────────────────
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

-- Parent can see/manage their own children
CREATE POLICY "Parent manages own children"
  ON parent_children FOR ALL
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Staff can see all children
CREATE POLICY "Staff sees all children"
  ON parent_children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('coach', 'admin', 'master_admin')
    )
  );

-- Admins can update/delete any child record (for support/cleanup)
CREATE POLICY "Admins manage all children"
  ON parent_children FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'master_admin')
    )
  );

-- ── Trigger: keep profiles.child_name in sync with active child ──
-- Backward compat: existing code reads profiles.child_name. When the
-- parent switches active child, mirror that name onto profiles.
CREATE OR REPLACE FUNCTION sync_active_child_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.active_child_id IS NOT NULL AND NEW.active_child_id IS DISTINCT FROM OLD.active_child_id THEN
    UPDATE profiles
    SET
      child_name = (SELECT child_name FROM parent_children WHERE id = NEW.active_child_id),
      child_age  = (SELECT child_age FROM parent_children WHERE id = NEW.active_child_id)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_active_child_change ON profiles;
CREATE TRIGGER on_active_child_change
  AFTER UPDATE OF active_child_id ON profiles
  FOR EACH ROW
  WHEN (NEW.account_type = 'parent_guardian')
  EXECUTE FUNCTION sync_active_child_to_profile();
