-- ============================================================
-- Migration 041: Stripe Connect Coach Payouts
-- Tracks connected accounts and split payment history
-- ============================================================

-- ── Coach Payout Accounts ──────────────────────────────────
-- Each coach/org can connect their Stripe account
CREATE TABLE IF NOT EXISTS coach_payout_accounts (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id                  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id                    UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Stripe Connect
  stripe_account_id         TEXT UNIQUE,           -- acct_xxx
  stripe_account_type       TEXT DEFAULT 'express'
                            CHECK (stripe_account_type IN ('express','standard','custom')),
  stripe_onboarding_url     TEXT,                  -- temp onboarding link
  account_status            TEXT DEFAULT 'not_connected'
                            CHECK (account_status IN (
                              'not_connected','pending','active','restricted','disabled'
                            )),

  -- Payout split (coach keeps this % of each booking after platform fee)
  coach_revenue_percent     NUMERIC(5,2) DEFAULT 70.00
                            CHECK (coach_revenue_percent >= 0 AND coach_revenue_percent <= 100),

  -- Capabilities
  charges_enabled           BOOLEAN DEFAULT false,
  payouts_enabled           BOOLEAN DEFAULT false,
  details_submitted         BOOLEAN DEFAULT false,

  -- Bank info (summary only — full details in Stripe)
  bank_last4                TEXT,
  bank_routing              TEXT,
  country                   TEXT DEFAULT 'US',
  currency                  TEXT DEFAULT 'usd',

  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now(),

  UNIQUE(coach_id, org_id)
);

-- ── Payout Ledger ──────────────────────────────────────────
-- Records every split payment event
CREATE TABLE IF NOT EXISTS coach_payouts (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id                UUID REFERENCES bookings(id) ON DELETE SET NULL,
  org_id                    UUID REFERENCES organizations(id) ON DELETE SET NULL,
  coach_id                  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payout_account_id         UUID REFERENCES coach_payout_accounts(id),

  -- Amounts (all in cents)
  gross_amount_cents        INTEGER NOT NULL,       -- full booking price
  platform_fee_cents        INTEGER NOT NULL,       -- PSP keeps this
  coach_amount_cents        INTEGER NOT NULL,       -- coach receives this

  -- Stripe references
  stripe_charge_id          TEXT,
  stripe_transfer_id        TEXT,                   -- transfer to connected account
  stripe_payment_intent_id  TEXT,

  -- Status
  status                    TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','transferred','failed','refunded')),
  transferred_at            TIMESTAMPTZ,
  failure_reason            TEXT,

  -- Metadata
  notes                     TEXT,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payout_accounts_coach   ON coach_payout_accounts(coach_id);
CREATE INDEX IF NOT EXISTS idx_payout_accounts_org     ON coach_payout_accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_payouts_coach           ON coach_payouts(coach_id);
CREATE INDEX IF NOT EXISTS idx_payouts_org             ON coach_payouts(org_id);
CREATE INDEX IF NOT EXISTS idx_payouts_booking         ON coach_payouts(booking_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status          ON coach_payouts(status);

-- ── Updated_at triggers ────────────────────────────────────
DROP TRIGGER IF EXISTS update_payout_accounts_updated_at ON coach_payout_accounts;
CREATE TRIGGER update_payout_accounts_updated_at
  BEFORE UPDATE ON coach_payout_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payouts_updated_at ON coach_payouts;
CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON coach_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE coach_payout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_payouts ENABLE ROW LEVEL SECURITY;

-- Coaches can see their own payout account
CREATE POLICY "Coaches see their own payout account"
  ON coach_payout_accounts FOR SELECT
  USING (coach_id = auth.uid());

-- Coaches can update their own payout account
CREATE POLICY "Coaches update their own payout account"
  ON coach_payout_accounts FOR UPDATE
  USING (coach_id = auth.uid());

-- Coaches can insert their own payout account
CREATE POLICY "Coaches insert their own payout account"
  ON coach_payout_accounts FOR INSERT
  WITH CHECK (coach_id = auth.uid());

-- Admins/master_admin can see all payout accounts
CREATE POLICY "Admins see all payout accounts"
  ON coach_payout_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
    )
  );

-- Coaches see their own payouts
CREATE POLICY "Coaches see their own payouts"
  ON coach_payouts FOR SELECT
  USING (coach_id = auth.uid());

-- Admins see all payouts
CREATE POLICY "Admins see all payouts"
  ON coach_payouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
    )
  );
