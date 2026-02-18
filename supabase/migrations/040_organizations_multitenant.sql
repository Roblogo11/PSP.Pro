-- ============================================================
-- Migration 040: Multi-Tenant Organizations System
-- Creates organizations, membership, and ties core tables to orgs
-- ============================================================

-- ── Organizations ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  owner_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,

  -- Branding / white-label
  logo_url              TEXT,
  primary_color         TEXT DEFAULT '#f97316',   -- orange brand default
  secondary_color       TEXT DEFAULT '#06b6d4',   -- cyan brand default
  accent_color          TEXT DEFAULT '#ffffff',
  custom_domain         TEXT UNIQUE,              -- e.g. "train.myacademy.com"
  tagline               TEXT,
  hero_headline         TEXT,
  hero_subheadline      TEXT,
  about_text            TEXT,

  -- Stripe Connect
  stripe_connect_account_id   TEXT UNIQUE,        -- acct_xxx (connected account)
  stripe_connect_status       TEXT DEFAULT 'not_connected'
                              CHECK (stripe_connect_status IN (
                                'not_connected','pending','active','restricted','disabled'
                              )),
  platform_fee_percent        NUMERIC(5,2) DEFAULT 15.00  -- PSP platform takes 15% by default
                              CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 100),

  -- Settings
  is_active             BOOLEAN DEFAULT true,
  allow_self_signup     BOOLEAN DEFAULT true,      -- athletes can self-register to this org
  require_approval      BOOLEAN DEFAULT false,     -- coach must approve athlete signups
  timezone              TEXT DEFAULT 'America/New_York',
  sport_focus           TEXT[],                    -- primary sports this org trains

  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ── Organization Members ───────────────────────────────────
CREATE TABLE IF NOT EXISTS organization_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'athlete'
                CHECK (role IN ('owner','coach','athlete','admin')),
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','pending','suspended','removed')),
  invited_by    UUID REFERENCES profiles(id),
  joined_at     TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- ── Add org_id to core business tables ────────────────────
-- Bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Services
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Available slots
ALTER TABLE available_slots
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Training packages
ALTER TABLE training_packages
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Athlete packages
ALTER TABLE athlete_packages
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_org_members_org_id   ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id  ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_org_id       ON bookings(org_id);
CREATE INDEX IF NOT EXISTS idx_services_org_id       ON services(org_id);
CREATE INDEX IF NOT EXISTS idx_slots_org_id          ON available_slots(org_id);

-- ── Updated_at triggers ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Organizations: public can read basic info (for custom domain lookup)
CREATE POLICY "Organizations are publicly readable"
  ON organizations FOR SELECT USING (true);

-- Organizations: only master_admin or owner can insert/update/delete
CREATE POLICY "Master admins can manage organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'master_admin'
    )
  );

-- Org owner can update their own org
CREATE POLICY "Org owner can update their org"
  ON organizations FOR UPDATE
  USING (owner_id = auth.uid());

-- Org members: members can see their own memberships
CREATE POLICY "Users can see their own org memberships"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());

-- Org members: coaches/admins in the org can see all members
CREATE POLICY "Org coaches can see all org members"
  ON organization_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.org_id = organization_members.org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner','coach','admin')
        AND om.status = 'active'
    )
  );

-- Master admin can see/manage all memberships
CREATE POLICY "Master admin manages all org members"
  ON organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'master_admin'
    )
  );

-- Athletes can join orgs (insert their own membership)
CREATE POLICY "Users can join orgs"
  ON organization_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Members can leave orgs (delete their own membership)
CREATE POLICY "Users can leave orgs"
  ON organization_members FOR DELETE
  USING (user_id = auth.uid());
