-- Migration 048: Fix corrupted slot booking counts
--
-- Problem: API routes were manually incrementing current_bookings AFTER
-- the BEFORE INSERT trigger (handle_booking_count) already did it.
-- This caused current_bookings to be double-counted, so cancelling a
-- booking only decremented by 1, leaving the slot "Full" when it should
-- be available.
--
-- Fix: Recalculate all slot counts from actual confirmed/pending bookings.

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
