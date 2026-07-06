-- ============================================================
-- Migration 042: Consent Tracking Fields
-- COPPA, CAN-SPAM, and GDPR/CCPA compliance
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS newsletter_consent      BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_consent            BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_consent_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS parent_consent_sent_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS parent_consent_verified BOOLEAN DEFAULT false;

-- Index for finding newsletter subscribers who consented
CREATE INDEX IF NOT EXISTS idx_profiles_newsletter_consent ON profiles(newsletter_consent) WHERE newsletter_consent = true;
