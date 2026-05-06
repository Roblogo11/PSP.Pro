-- Migration 056: Ensure slot recalc runs on cancellation (idempotent re-apply of 052)
--
-- Problem (Rachel's report): Cancelled bookings still show the slot as unavailable.
--
-- Root cause hypothesis: Migration 052 was the fix for this (recalculate trigger
-- on UPDATE OF status), but in some environments it may not have applied cleanly,
-- or slot counts may have drifted again from edge cases (e.g. direct DELETE,
-- bookings created before 052, manual data fixes).
--
-- This migration:
--   1. Re-runs the slot count recalculation across ALL slots (safe to repeat).
--   2. Re-creates the AFTER UPDATE OF status trigger (idempotent).
--   3. Adds an AFTER DELETE trigger so direct DELETEs also free the slot.

-- ── Step 1: Recalculate every slot from current active bookings ──
UPDATE available_slots
SET
  current_bookings = COALESCE((
    SELECT COUNT(*)
    FROM bookings
    WHERE bookings.slot_id = available_slots.id
      AND bookings.status IN ('confirmed', 'pending')
  ), 0),
  is_available = CASE
    WHEN COALESCE((
      SELECT COUNT(*)
      FROM bookings
      WHERE bookings.slot_id = available_slots.id
        AND bookings.status IN ('confirmed', 'pending')
    ), 0) >= max_bookings THEN FALSE
    ELSE TRUE
  END;

-- ── Step 2: Re-create the recalc function (idempotent) ──
CREATE OR REPLACE FUNCTION recalculate_slot_availability()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
  slot_max     INTEGER;
  target_slot  UUID;
BEGIN
  -- For UPDATE: bail if slot_id is null or status didn't change
  IF TG_OP = 'UPDATE' THEN
    IF NEW.slot_id IS NULL THEN
      RETURN NEW;
    END IF;
    IF OLD.status = NEW.status THEN
      RETURN NEW;
    END IF;
    target_slot := NEW.slot_id;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.slot_id IS NULL THEN
      RETURN OLD;
    END IF;
    target_slot := OLD.slot_id;
  END IF;

  SELECT COUNT(*) INTO active_count
  FROM bookings
  WHERE slot_id = target_slot
    AND status IN ('confirmed', 'pending');

  SELECT max_bookings INTO slot_max
  FROM available_slots
  WHERE id = target_slot;

  UPDATE available_slots
  SET
    current_bookings = active_count,
    is_available     = (active_count < slot_max)
  WHERE id = target_slot;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Step 3: Re-create triggers (idempotent) ──
DROP TRIGGER IF EXISTS on_booking_status_change ON bookings;
DROP TRIGGER IF EXISTS on_booking_cancelled ON bookings;
DROP TRIGGER IF EXISTS on_booking_deleted ON bookings;

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_slot_availability();

CREATE TRIGGER on_booking_deleted
  AFTER DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_slot_availability();
