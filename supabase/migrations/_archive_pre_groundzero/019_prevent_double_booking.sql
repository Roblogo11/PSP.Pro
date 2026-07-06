-- ============================================================================
-- Prevent Double-Booking System
-- Adds database-level constraints to prevent two athletes booking same slot
-- ============================================================================

-- 1. Add unique constraint on coach_id + slot_date + start_time
-- This prevents a coach from having multiple slots at the same time
ALTER TABLE available_slots
ADD CONSTRAINT unique_coach_time_slot
UNIQUE (coach_id, slot_date, start_time);

-- 2. Add constraint to prevent current_bookings from exceeding max_bookings
ALTER TABLE available_slots
ADD CONSTRAINT check_bookings_within_limit
CHECK (current_bookings <= max_bookings);

-- 3. Create function to safely increment booking count with lock
CREATE OR REPLACE FUNCTION increment_slot_booking(slot_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT, available BOOLEAN) AS $$
DECLARE
  slot_record RECORD;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT * INTO slot_record
  FROM available_slots
  WHERE id = slot_id
  FOR UPDATE;

  -- Check if slot exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Slot not found'::TEXT, FALSE;
    RETURN;
  END IF;

  -- Check if slot is available
  IF NOT slot_record.is_available THEN
    RETURN QUERY SELECT FALSE, 'Slot is not available'::TEXT, FALSE;
    RETURN;
  END IF;

  -- Check if slot is full
  IF slot_record.current_bookings >= slot_record.max_bookings THEN
    RETURN QUERY SELECT FALSE, 'Slot is full'::TEXT, FALSE;
    RETURN;
  END IF;

  -- Increment the booking count
  UPDATE available_slots
  SET
    current_bookings = current_bookings + 1,
    is_available = CASE
      WHEN current_bookings + 1 >= max_bookings THEN FALSE
      ELSE TRUE
    END,
    updated_at = NOW()
  WHERE id = slot_id;

  -- Return success
  RETURN QUERY SELECT TRUE, 'Booking count incremented'::TEXT, TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. Add index for faster booking lookups
CREATE INDEX IF NOT EXISTS idx_available_slots_coach_date
ON available_slots(coach_id, slot_date, is_available);

-- 5. Add index for booking slot lookups
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id
ON bookings(slot_id);

-- 6. Add check to ensure booking references valid slot
-- (This might already exist, but adding it to be safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bookings_slot_id_fkey'
    AND table_name = 'bookings'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_slot_id_fkey
    FOREIGN KEY (slot_id) REFERENCES available_slots(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 7. Update the booking trigger to use the safe function
-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_booking_created ON bookings;
DROP TRIGGER IF EXISTS on_booking_deleted ON bookings;

-- Create new trigger function using the safe increment
CREATE OR REPLACE FUNCTION handle_booking_count()
RETURNS TRIGGER AS $$
DECLARE
  result RECORD;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Use the safe increment function
    SELECT * INTO result FROM increment_slot_booking(NEW.slot_id);

    IF NOT result.success THEN
      RAISE EXCEPTION 'Cannot book slot: %', result.message;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement on cancellation
    UPDATE available_slots
    SET
      current_bookings = GREATEST(0, current_bookings - 1),
      is_available = TRUE,
      updated_at = NOW()
    WHERE id = OLD.slot_id;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the new triggers
CREATE TRIGGER on_booking_created
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_count();

CREATE TRIGGER on_booking_deleted
  AFTER DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_count();

-- Add helpful comments
COMMENT ON CONSTRAINT unique_coach_time_slot ON available_slots IS 'Prevents coach from having multiple slots at same time';
COMMENT ON CONSTRAINT check_bookings_within_limit ON available_slots IS 'Ensures current_bookings never exceeds max_bookings';
COMMENT ON FUNCTION increment_slot_booking IS 'Safely increments booking count with row-level locking to prevent race conditions';
