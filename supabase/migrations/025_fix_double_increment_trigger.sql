-- ============================================================================
-- Fix: Remove duplicate booking triggers causing double-increment
--
-- Problem: Migration 002 created an AFTER INSERT trigger (decrement_slot_availability)
-- and Migration 019 created a BEFORE INSERT trigger (handle_booking_count).
-- Both increment current_bookings, causing it to go +2 per booking instead of +1.
-- ============================================================================

-- Drop ALL booking-related triggers to start clean
DROP TRIGGER IF EXISTS on_booking_created ON bookings;
DROP TRIGGER IF EXISTS on_booking_deleted ON bookings;
DROP TRIGGER IF EXISTS on_booking_cancelled ON bookings;

-- Drop the old function from migration 002
DROP FUNCTION IF EXISTS decrement_slot_availability();

-- Keep only the safe handle_booking_count from migration 019
-- Re-create the triggers using ONLY the safe function

CREATE TRIGGER on_booking_created
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_count();

CREATE TRIGGER on_booking_deleted
  AFTER DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_count();

-- Keep the cancellation trigger from migration 002 (different behavior)
-- increment_slot_availability handles status changes from non-cancelled to cancelled
CREATE TRIGGER on_booking_cancelled
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION increment_slot_availability();

-- Reset any corrupted slot counts
UPDATE available_slots
SET current_bookings = (
  SELECT COUNT(*) FROM bookings
  WHERE bookings.slot_id = available_slots.id
  AND bookings.status IN ('confirmed', 'pending')
),
is_available = CASE
  WHEN (
    SELECT COUNT(*) FROM bookings
    WHERE bookings.slot_id = available_slots.id
    AND bookings.status IN ('confirmed', 'pending')
  ) >= max_bookings THEN FALSE
  ELSE TRUE
END;
