-- Migration 061: Heal slot count drift permanently — INSERT trigger + periodic recalc
--
-- The problem this fixes:
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migrations 052 and 056 introduced `recalculate_slot_availability()` as the
-- single source of truth for keeping `available_slots.current_bookings` and
-- `is_available` in sync with the actual `bookings` table. They wired it to
-- AFTER UPDATE OF status AND AFTER DELETE — but NOT to AFTER INSERT.
--
-- Meanwhile, every code path that creates bookings was updated to TRUST the
-- trigger (we removed manual `current_bookings + 1` calls from
-- `admin/create-booking` and `bookings/pay-on-site` to stop double-counting).
--
-- Net result: creating a new booking silently does NOT update the slot count.
-- Drift accumulates over time. Symptoms Rachel reported:
--   1. Group sessions appear unavailable to athletes when they shouldn't
--      (is_available stuck false on a slot that just got freed).
--   2. Coach schedule view says "slot full" but calendar view shows no booking
--      (schedule reads available_slots.current_bookings; calendar reads
--      actual bookings rows — the two disagreed because of drift).
--
-- The fix (three layers, defense in depth — so this cannot quietly come back):
--   1. EXTEND the recalc function to handle INSERT (currently only handles
--      UPDATE and DELETE), and add an AFTER INSERT trigger.
--   2. One-time recalc of every slot from live data, clearing any current drift.
--   3. SELF-HEALING LAYER: a periodic recalc that runs every hour. Even if a
--      future migration accidentally drops a trigger again, drift can never
--      exceed 1 hour, and we don't depend on remembering this lesson.
--
-- If you ever touch the slot triggers in a future migration:
--   ⚠️  YOU MUST INCLUDE INSERT, UPDATE, AND DELETE BRANCHES ⚠️
--   The pg_cron job below is a guardrail, not an excuse to ship a broken trigger.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


-- ── Step 1: Replace the recalc function with one that handles INSERT too ──

CREATE OR REPLACE FUNCTION recalculate_slot_availability()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
  slot_max     INTEGER;
  target_slot  UUID;
BEGIN
  -- Determine which slot we're recalculating, based on operation
  IF TG_OP = 'INSERT' THEN
    IF NEW.slot_id IS NULL THEN
      RETURN NEW;
    END IF;
    target_slot := NEW.slot_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- For UPDATE, only act on status changes (count membership changes)
    -- OR slot_id changes (booking moved to a different slot).
    IF OLD.slot_id IS NULL AND NEW.slot_id IS NULL THEN
      RETURN NEW;
    END IF;
    IF OLD.status = NEW.status AND OLD.slot_id IS NOT DISTINCT FROM NEW.slot_id THEN
      RETURN NEW;
    END IF;
    target_slot := COALESCE(NEW.slot_id, OLD.slot_id);

    -- If slot_id changed, also recalc the OLD slot (booking moved away from it)
    IF OLD.slot_id IS NOT NULL AND OLD.slot_id IS DISTINCT FROM NEW.slot_id THEN
      SELECT COUNT(*) INTO active_count
      FROM bookings
      WHERE slot_id = OLD.slot_id
        AND status IN ('confirmed', 'pending');
      SELECT max_bookings INTO slot_max FROM available_slots WHERE id = OLD.slot_id;
      IF slot_max IS NOT NULL THEN
        UPDATE available_slots
        SET current_bookings = active_count,
            is_available     = (active_count < slot_max)
        WHERE id = OLD.slot_id;
      END IF;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.slot_id IS NULL THEN
      RETURN OLD;
    END IF;
    target_slot := OLD.slot_id;
  END IF;

  -- Recalculate the target slot exactly from live booking data
  SELECT COUNT(*) INTO active_count
  FROM bookings
  WHERE slot_id = target_slot
    AND status IN ('confirmed', 'pending');

  SELECT max_bookings INTO slot_max
  FROM available_slots
  WHERE id = target_slot;

  -- Slot may have been deleted before the booking row — guard the update
  IF slot_max IS NOT NULL THEN
    UPDATE available_slots
    SET current_bookings = active_count,
        is_available     = (active_count < slot_max)
    WHERE id = target_slot;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── Step 2: Re-create all three triggers (idempotent) ──

DROP TRIGGER IF EXISTS on_booking_inserted       ON bookings;
DROP TRIGGER IF EXISTS on_booking_status_change  ON bookings;
DROP TRIGGER IF EXISTS on_booking_deleted        ON bookings;
DROP TRIGGER IF EXISTS on_booking_cancelled      ON bookings;  -- legacy name from 025

CREATE TRIGGER on_booking_inserted
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_slot_availability();

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE OF status, slot_id ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_slot_availability();

CREATE TRIGGER on_booking_deleted
  AFTER DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_slot_availability();


-- ── Step 3: One-time recalc of every slot to clear any current drift ──

UPDATE available_slots
SET
  current_bookings = COALESCE((
    SELECT COUNT(*) FROM bookings
    WHERE bookings.slot_id = available_slots.id
      AND bookings.status IN ('confirmed', 'pending')
  ), 0),
  is_available = (COALESCE((
    SELECT COUNT(*) FROM bookings
    WHERE bookings.slot_id = available_slots.id
      AND bookings.status IN ('confirmed', 'pending')
  ), 0) < max_bookings);


-- ── Step 4: Self-healing layer — periodic recalc via pg_cron ──
-- Schedules `recalculate_all_slot_counts()` to run every hour. Even if a future
-- migration accidentally removes a trigger, slot count drift can never persist
-- for more than an hour. This is the guardrail that lets us sleep at night.

CREATE OR REPLACE FUNCTION recalculate_all_slot_counts()
RETURNS void AS $$
BEGIN
  UPDATE available_slots
  SET
    current_bookings = COALESCE((
      SELECT COUNT(*) FROM bookings
      WHERE bookings.slot_id = available_slots.id
        AND bookings.status IN ('confirmed', 'pending')
    ), 0),
    is_available = (COALESCE((
      SELECT COUNT(*) FROM bookings
      WHERE bookings.slot_id = available_slots.id
        AND bookings.status IN ('confirmed', 'pending')
    ), 0) < max_bookings)
  WHERE
    -- Only touch upcoming slots (don't churn historical data)
    slot_date >= CURRENT_DATE - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Enable pg_cron (Supabase supports this natively). Safe to run repeatedly.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove any prior schedule (in case this migration re-runs) before scheduling
DO $$
BEGIN
  PERFORM cron.unschedule('psp-recalc-slot-counts')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'psp-recalc-slot-counts');
EXCEPTION WHEN OTHERS THEN
  -- pg_cron not present in this environment — that's OK, the triggers above
  -- still protect us. Just log and continue.
  RAISE NOTICE 'pg_cron unschedule skipped: %', SQLERRM;
END $$;

DO $$
BEGIN
  PERFORM cron.schedule(
    'psp-recalc-slot-counts',
    '0 * * * *',  -- top of every hour
    $cron$SELECT public.recalculate_all_slot_counts();$cron$
  );
EXCEPTION WHEN OTHERS THEN
  -- If pg_cron isn't available we still have the triggers as the primary defense.
  -- Coach can monitor by calling recalculate_all_slot_counts() manually.
  RAISE NOTICE 'pg_cron schedule skipped (extension may not be available here): %', SQLERRM;
END $$;
