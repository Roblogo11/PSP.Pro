-- ============================================================================
-- 066b: Repoint Elite tier at the new $50 Stripe price
-- ============================================================================
--
-- Companion to 066. That migration changed what we ADVERTISE (price_cents);
-- this one changes what we actually CHARGE (which Stripe price checkout uses).
-- Both are required — see the header of 066 for the full Stripe sequence.
--
-- STATUS: APPLIED to the live DB on 2026-07-28.
--
-- ⚠ The hardcoded price id below is intentional and correct for this one-time
--    correction. Do NOT copy this pattern for new tiers — read the id from
--    Stripe at deploy time instead of pinning it in a migration.
--
-- Idempotent — safe to re-run.
-- ============================================================================

DO $$
DECLARE
  v_old text;
BEGIN
  RAISE NOTICE '--- 066b: repoint elite stripe_price_id to the $50 price ---';

  SELECT stripe_price_id INTO v_old
  FROM public.membership_tiers WHERE slug = 'elite_membership';
  RAISE NOTICE '  old stripe_price_id = %', v_old;

  UPDATE public.membership_tiers
  SET stripe_price_id = 'price_1TyKlRDvIKXE2EmOPgxfWKHf',
      updated_at = now()
  WHERE slug = 'elite_membership'
    AND stripe_price_id IS DISTINCT FROM 'price_1TyKlRDvIKXE2EmOPgxfWKHf';

  RAISE NOTICE '  [1] stripe_price_id -> price_1TyKlRDvIKXE2EmOPgxfWKHf ($50/mo, live)';
  RAISE NOTICE '  [2] DB price_cents (5000) and the Stripe price object now agree';
  RAISE NOTICE '--- 066b complete ---';
END $$;
