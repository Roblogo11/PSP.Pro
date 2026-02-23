-- Migration 047: Security Hardening
-- Adds: Calendar token expiration, audit logging, atomic promo increment

-- ═══════════════════════════════════════════════════════════════
-- 1. CALENDAR TOKEN EXPIRATION
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'calendar_token_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN calendar_token_expires_at TIMESTAMPTZ
      DEFAULT (now() + interval '90 days');
  END IF;
END $$;

-- Backfill: set expiration for existing tokens (90 days from now)
UPDATE profiles
SET calendar_token_expires_at = now() + interval '90 days'
WHERE calendar_token IS NOT NULL AND calendar_token_expires_at IS NULL;

-- ═══════════════════════════════════════════════════════════════
-- 2. AUDIT LOG TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- RLS: Only admins can read audit logs, system writes via service role
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 3. ATOMIC PROMO CODE INCREMENT (RPC)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_promo_usage(promo_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE promo_codes
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = promo_id;
END;
$$;
