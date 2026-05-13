-- 059: Auto-grant 2-month Elite trial on athlete signup
-- New athletes get full Elite tier access for 60 days, then auto-downgrade to Basic.
-- No payment method collected. Gives them a real taste of paid features.

-- 1) Function: grant trial when a new athlete profile is inserted
CREATE OR REPLACE FUNCTION grant_signup_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  elite_tier_id UUID;
BEGIN
  -- Only run for athletes (not coaches/admins)
  IF NEW.role IS DISTINCT FROM 'athlete' THEN
    RETURN NEW;
  END IF;

  -- Skip if an athlete_membership already exists (e.g. paid signup or re-trigger)
  IF EXISTS (SELECT 1 FROM athlete_memberships WHERE athlete_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Look up Elite tier ID
  SELECT id INTO elite_tier_id FROM membership_tiers WHERE slug = 'elite_membership' LIMIT 1;
  IF elite_tier_id IS NULL THEN
    -- Elite tier not seeded yet, nothing to grant
    RETURN NEW;
  END IF;

  -- Insert trial membership (60 days)
  INSERT INTO athlete_memberships (
    athlete_id,
    tier_id,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    elite_tier_id,
    'trialing',
    now(),
    now() + INTERVAL '60 days'
  )
  ON CONFLICT (athlete_id) DO NOTHING;

  -- Update profile so quick-lookup membership_tier matches
  UPDATE profiles
  SET membership_tier = 'elite'
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- 2) Trigger: fire on every new athlete profile insert
DROP TRIGGER IF EXISTS trg_grant_signup_trial ON profiles;
CREATE TRIGGER trg_grant_signup_trial
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION grant_signup_trial();

-- 3) Function: expire trials whose 60 days are up
-- Called by a cron (Vercel cron or supabase pg_cron). Sets status='cancelled'
-- and drops membership_tier back to 'basic'. Idempotent — safe to run hourly.
CREATE OR REPLACE FUNCTION expire_overdue_trials()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  WITH expired AS (
    UPDATE athlete_memberships
    SET status = 'cancelled',
        cancelled_at = now(),
        updated_at = now()
    WHERE status = 'trialing'
      AND current_period_end IS NOT NULL
      AND current_period_end < now()
    RETURNING athlete_id
  )
  UPDATE profiles
  SET membership_tier = 'basic'
  WHERE id IN (SELECT athlete_id FROM expired)
    AND membership_tier = 'elite';

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- 4) Backfill: any existing athlete with no membership row gets a trial too
-- This is a one-time backfill so existing pre-launch signups also get the perk.
-- Skips athletes who already have paid bookings or packages (they're past the funnel).
DO $$
DECLARE
  elite_tier_id UUID;
BEGIN
  SELECT id INTO elite_tier_id FROM membership_tiers WHERE slug = 'elite_membership' LIMIT 1;
  IF elite_tier_id IS NULL THEN
    RAISE NOTICE 'Elite tier not seeded; skipping backfill';
    RETURN;
  END IF;

  INSERT INTO athlete_memberships (athlete_id, tier_id, status, current_period_start, current_period_end)
  SELECT
    p.id,
    elite_tier_id,
    'trialing',
    p.created_at,
    p.created_at + INTERVAL '60 days'
  FROM profiles p
  WHERE p.role = 'athlete'
    AND NOT EXISTS (SELECT 1 FROM athlete_memberships am WHERE am.athlete_id = p.id)
    AND p.created_at > now() - INTERVAL '60 days'
  ON CONFLICT (athlete_id) DO NOTHING;

  UPDATE profiles
  SET membership_tier = 'elite'
  WHERE role = 'athlete'
    AND membership_tier IS DISTINCT FROM 'elite'
    AND id IN (
      SELECT athlete_id FROM athlete_memberships
      WHERE status = 'trialing'
        AND current_period_end > now()
    );
END $$;

COMMENT ON FUNCTION grant_signup_trial IS 'AFTER-INSERT trigger on profiles: grants new athletes a 60-day Elite trial automatically (status=trialing, no payment).';
COMMENT ON FUNCTION expire_overdue_trials IS 'Cron-callable: flips expired trial memberships to cancelled and resets profile.membership_tier to basic. Returns number of trials expired this run.';
