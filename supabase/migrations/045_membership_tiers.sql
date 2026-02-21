-- Membership Tiers System
-- Supports BASIC (free) and ELITE ($60/mo) with future scalability

-- Membership tiers definition table
CREATE TABLE IF NOT EXISTS public.membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  billing_interval TEXT CHECK (billing_interval IN ('monthly', 'yearly', 'one_time', 'free')) DEFAULT 'free',
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Feature flags table (maps features to tiers)
CREATE TABLE IF NOT EXISTS public.membership_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID NOT NULL REFERENCES public.membership_tiers(id) ON DELETE CASCADE,
  feature_slug TEXT NOT NULL,
  feature_label TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(tier_id, feature_slug)
);

-- Athlete memberships (subscriptions)
CREATE TABLE IF NOT EXISTS public.athlete_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.membership_tiers(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')) DEFAULT 'active',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(athlete_id)
);

-- Add membership_tier to profiles for quick lookups
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'basic';

-- Insert default tiers
INSERT INTO public.membership_tiers (slug, name, description, price_cents, billing_interval, sort_order, features) VALUES
(
  'basic_membership',
  'BASIC',
  'Start your athlete''s development journey.',
  0,
  'free',
  1,
  '["PSP Pro Dashboard (Limited)", "Track Key Performance Metrics", "Foundational Drill Library", "Enroll in Courses (paid)"]'::jsonb
),
(
  'elite_membership',
  'ELITE',
  'For athletes serious about accelerated development.',
  6000,
  'monthly',
  2,
  '["Full PSP Pro Dashboard", "10% Off Lessons, Camps & Academies", "FREE Proper Pitching Course", "Advanced Drill Library", "Priority Enrollment Access", "Monthly Member Q&A Sessions"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Insert feature flags for Basic tier
INSERT INTO public.membership_features (tier_id, feature_slug, feature_label) VALUES
  ((SELECT id FROM membership_tiers WHERE slug = 'basic_membership'), 'psp_dashboard_basic', 'PSP Dashboard (Basic)'),
  ((SELECT id FROM membership_tiers WHERE slug = 'basic_membership'), 'drill_library_basic', 'Drill Library (Basic)'),
  ((SELECT id FROM membership_tiers WHERE slug = 'basic_membership'), 'course_enrollment', 'Course Enrollment (Paid)')
ON CONFLICT (tier_id, feature_slug) DO NOTHING;

-- Insert feature flags for Elite tier
INSERT INTO public.membership_features (tier_id, feature_slug, feature_label) VALUES
  ((SELECT id FROM membership_tiers WHERE slug = 'elite_membership'), 'psp_dashboard_full', 'Full PSP Dashboard'),
  ((SELECT id FROM membership_tiers WHERE slug = 'elite_membership'), 'drill_library_full', 'Complete Drill Library'),
  ((SELECT id FROM membership_tiers WHERE slug = 'elite_membership'), 'course_proper_pitching', 'Proper Pitching Course (Free)'),
  ((SELECT id FROM membership_tiers WHERE slug = 'elite_membership'), 'discount_10_percent', '10% Service Discount'),
  ((SELECT id FROM membership_tiers WHERE slug = 'elite_membership'), 'priority_registration', 'Priority Registration'),
  ((SELECT id FROM membership_tiers WHERE slug = 'elite_membership'), 'member_qna', 'Monthly Member Q&A')
ON CONFLICT (tier_id, feature_slug) DO NOTHING;

-- RLS policies
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_memberships ENABLE ROW LEVEL SECURITY;

-- Everyone can read tiers (public pricing page)
CREATE POLICY "tiers_public_read" ON public.membership_tiers
  FOR SELECT USING (true);

-- Everyone can read features
CREATE POLICY "features_public_read" ON public.membership_features
  FOR SELECT USING (true);

-- Athletes see their own membership; staff see all
CREATE POLICY "memberships_select" ON public.athlete_memberships
  FOR SELECT TO authenticated
  USING (
    athlete_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- System inserts (via service role or admin)
CREATE POLICY "memberships_insert" ON public.athlete_memberships
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- System updates
CREATE POLICY "memberships_update" ON public.athlete_memberships
  FOR UPDATE TO authenticated
  USING (
    athlete_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- Admin tiers management
CREATE POLICY "tiers_admin_write" ON public.membership_tiers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- Admin features management
CREATE POLICY "features_admin_write" ON public.membership_features
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master_admin')
    )
  );
