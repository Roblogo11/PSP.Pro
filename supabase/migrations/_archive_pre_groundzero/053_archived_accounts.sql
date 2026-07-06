-- Migration 053: Archived accounts for deleted users
-- When a user deletes their account, their data is archived here.
-- On re-signup with the same email, they can optionally restore it.

CREATE TABLE IF NOT EXISTS archived_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id uuid NOT NULL,
  email text NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now(),
  -- Snapshot of profile data
  profile_snapshot jsonb,
  -- Snapshot of bookings
  bookings_snapshot jsonb,
  -- Snapshot of performance metrics
  metrics_snapshot jsonb,
  -- Whether restore was offered/used on re-signup
  restore_offered_at timestamptz,
  restore_accepted_at timestamptz,
  restored_to_user_id uuid
);

-- Index for fast email lookup on signup
CREATE INDEX IF NOT EXISTS archived_accounts_email_idx ON archived_accounts (email);
-- Index for original user lookup
CREATE INDEX IF NOT EXISTS archived_accounts_user_idx ON archived_accounts (original_user_id);

-- Only service role can access this table
ALTER TABLE archived_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON archived_accounts
  USING (false)
  WITH CHECK (false);
