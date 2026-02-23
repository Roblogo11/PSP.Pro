-- Migration 049: Athlete invite links
-- Coaches and admins can generate invite links that allow athletes to self-register

CREATE TABLE IF NOT EXISTS invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  sport TEXT CHECK (sport IN ('softball', 'basketball', 'soccer')),
  trial_days INTEGER NOT NULL DEFAULT 30,
  max_uses INTEGER NOT NULL DEFAULT 1,
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for token lookup (used on public invite page)
CREATE INDEX IF NOT EXISTS invite_links_token_idx ON invite_links (token);
-- Index for coach queries
CREATE INDEX IF NOT EXISTS invite_links_coach_id_idx ON invite_links (coach_id);

-- RLS policies
ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;

-- Coaches/admins can read their own invite links
CREATE POLICY "coaches_read_own_invite_links"
  ON invite_links FOR SELECT
  USING (
    coach_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'master_admin')
    )
  );

-- Coaches/admins can insert invite links
CREATE POLICY "coaches_insert_invite_links"
  ON invite_links FOR INSERT
  WITH CHECK (
    coach_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin', 'master_admin')
    )
  );

-- Coaches can only delete their own links
CREATE POLICY "coaches_delete_own_invite_links"
  ON invite_links FOR DELETE
  USING (
    coach_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'master_admin')
    )
  );

-- Allow public read of a specific token (for validation on invite page)
-- We use service role in the API route instead of RLS for this, so no public policy needed.
-- The admin client in the API route bypasses RLS entirely.
