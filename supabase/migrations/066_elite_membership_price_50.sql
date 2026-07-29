-- ============================================================================
-- 066: Elite membership price → $50/month (client request, 2026-07-28)
-- ============================================================================
--
-- STATUS: APPLIED to the live DB on 2026-07-28, and the Stripe side is DONE.
--
-- ⚠ IF YOU EVER CHANGE A TIER PRICE AGAIN, the DB is only half the job.
--    Stripe price objects are IMMUTABLE — you cannot edit $60 into $50. The
--    full sequence that was actually performed here:
--      1. Create a new recurring price on prod_U2CksacYNIHyph
--         -> created price_1TyKlRDvIKXE2EmOPgxfWKHf ($50/mo, live)
--      2. Set it as the product's default_price. This MUST come before step 3:
--         Stripe refuses to archive a price that is its product's default
--         ("This price cannot be archived because it is the default price").
--      3. Archive the old price (price_1T48LRDvIKXE2EmOfXLJ6UDr, $60) so it
--         can never be selected again.
--      4. Repoint membership_tiers.stripe_price_id at the new price
--         (done by migration 066b / elite_repoint_stripe_price_50).
--    Skip 1-2 and 4 and the DB advertises $50 while checkout charges $60 —
--    which is exactly the class of mismatch this whole ticket was about.
--
-- VERIFIED after the change: DB price_cents = 5000 and stripe_price_id
--    resolves to a price with unit_amount = 5000, active = true; the $60
--    price reads active = false.
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
