-- ============================================================================
-- 066: Elite membership price → $50/month (client request, 2026-07-28)
-- ============================================================================
--
-- ⚠ BEFORE RUNNING THIS, YOU MUST ALSO:
--    1. Create a NEW $50/month recurring price in Stripe on product
--       prod_U2CksacYNIHyph ("PSP.Pro Elite Membership"). Stripe price objects
--       are immutable — you cannot edit $60 into $50, you create a new one.
--    2. Repoint membership_tiers.stripe_price_id at the new price id.
--    3. Archive the old $60 price (price_1T48LRDvIKXE2EmOfXLJ6UDr) so it can't
--       be selected again.
--    Without step 1-2, the DB will advertise $50 while Stripe checkout charges
--    $60. That mismatch is exactly what this whole ticket was about.
--
-- WHY THIS IS SAFE TO RUN NOW (audited 2026-07-28):
--    - athlete_memberships rows carrying a stripe_subscription_id: 0
--    - Stripe subscriptions of ANY status: 0
--    Nobody is on a recurring bill, so no existing customer's charge changes.
--    If that is no longer true when you run this, STOP and re-audit —
--    changing an advertised price under active subscribers needs a migration
--    plan (grandfather existing subs on the old price).
--
-- Idempotent — safe to re-run.
-- ============================================================================

DO $$
DECLARE
  v_old   integer;
  v_rows  integer;
  v_subs  integer;
BEGIN
  RAISE NOTICE '--- 066: Elite membership price -> $50/mo ---';

  -- Re-check the safety precondition at run time, don't trust the audit date.
  SELECT count(*) INTO v_subs
  FROM public.athlete_memberships
  WHERE stripe_subscription_id IS NOT NULL;

  IF v_subs > 0 THEN
    RAISE EXCEPTION 'ABORT: % membership(s) carry a stripe_subscription_id. Changing the advertised price under active subscribers needs a grandfathering plan — re-audit before running.', v_subs;
  END IF;
  RAISE NOTICE '  [0] precondition OK — 0 active stripe subscriptions';

  SELECT price_cents INTO v_old FROM public.membership_tiers WHERE slug = 'elite_membership';
  RAISE NOTICE '      current price_cents = %', v_old;

  UPDATE public.membership_tiers
  SET price_cents = 5000,
      updated_at  = now()
  WHERE slug = 'elite_membership'
    AND price_cents IS DISTINCT FROM 5000;
  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows > 0 THEN
    RAISE NOTICE '  [1] elite_membership price_cents % -> 5000', v_old;
  ELSE
    RAISE NOTICE '  [1] already 5000 - no change';
  END IF;

  RAISE NOTICE '  [2] REMINDER: stripe_price_id still points at the $60 price object.';
  RAISE NOTICE '      Create the $50 Stripe price and repoint it before selling a subscription.';
  RAISE NOTICE '--- 066 complete ---';
END $$;
