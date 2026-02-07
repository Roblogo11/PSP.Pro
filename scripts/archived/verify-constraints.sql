-- Verify Double-Booking Prevention Constraints
-- Run this in Supabase SQL Editor to confirm migration 019 worked

-- 1. Check for unique constraint on coach time slots
SELECT
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'available_slots'
  AND constraint_name = 'unique_coach_time_slot';
-- Expected: 1 row with constraint_type = 'UNIQUE'

-- 2. Check for booking limit constraint
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'available_slots'
  AND constraint_name = 'check_bookings_within_limit';
-- Expected: 1 row with constraint_type = 'CHECK'

-- 3. Check if safe increment function exists
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'increment_slot_booking';
-- Expected: 1 row with routine_type = 'FUNCTION'

-- 4. Check triggers on bookings table
SELECT
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'bookings'
  AND trigger_name IN ('on_booking_created', 'on_booking_deleted');
-- Expected: 2 rows (INSERT and DELETE triggers)

-- 5. Test the constraint (should fail with unique violation)
-- Uncomment to test:
/*
INSERT INTO available_slots (coach_id, slot_date, start_time, end_time, location, max_bookings, current_bookings, is_available)
VALUES
  ('fc81d2bc-d35c-4b0e-a080-c584b8970356', '2026-02-10', '15:00', '16:00', 'Test Location', 1, 0, true),
  ('fc81d2bc-d35c-4b0e-a080-c584b8970356', '2026-02-10', '15:00', '16:00', 'Test Location', 1, 0, true);
-- Expected: ERROR - duplicate key value violates unique constraint "unique_coach_time_slot"
*/
