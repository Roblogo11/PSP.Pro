-- Migration 052: Fix slot counts after cancellation + harden trigger
--
-- Problem: Slots still show "Full" after bookings are cancelled.
-- Root cause: Prior double-increment corruption left current_bookings > 1 for
-- single-capacity slots. Cancelling one booking decrements by 1, but the count
-- was already 2, leaving it at 1 (still "Full").
--
-- Fix 1: Recalculate ALL slot counts from actual active bookings (confirmed + pending).
-- Fix 2: Replace the increment/decrement trigger with a recalculate-on-change
--         approach that is immune to drift — it always sets the count to the
--         exact number of confirmed/pending bookings for that slot.

-- ── Step 1: Recalculate all slot counts from live booking data ──

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

-- ── Step 2: Replace the cancellation trigger with a recalculate approach ──
-- This is immune to drift: instead of ±1, we always set to the exact count.

CREATE OR REPLACE FUNCTION recalculate_slot_availability()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
  slot_max     INTEGER;
BEGIN
  -- Only act when slot_id is set and status actually changed
  IF NEW.slot_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Recalculate exact count of active (confirmed + pending) bookings for this slot
  SELECT COUNT(*) INTO active_count
  FROM bookings
  WHERE slot_id = NEW.slot_id
    AND status IN ('confirmed', 'pending');

  SELECT max_bookings INTO slot_max
  FROM available_slots
  WHERE id = NEW.slot_id;

  UPDATE available_slots
  SET
    current_bookings = active_count,
    is_available     = (active_count < slot_max)
  WHERE id = NEW.slot_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the old drift-prone trigger and replace it
DROP TRIGGER IF EXISTS on_booking_cancelled ON bookings;

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_slot_availability();
