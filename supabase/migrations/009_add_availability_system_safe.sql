-- ========================================
-- Availability System (SAFE VERSION)
-- ========================================
-- Adds missing pieces to existing available_slots table
-- ========================================

-- Table already exists, just ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_available_slots_coach ON public.available_slots(coach_id);
CREATE INDEX IF NOT EXISTS idx_available_slots_date ON public.available_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_available_slots_available ON public.available_slots(is_available, slot_date)
  WHERE is_available = TRUE;

-- ========================================
-- UPDATE BOOKINGS TO LINK TO SLOTS (if not already linked)
-- ========================================
-- Bookings already has slot_id from schema inspection

CREATE INDEX IF NOT EXISTS idx_bookings_slot ON public.bookings(slot_id);

-- ========================================
-- TRIGGER: Update slot booking count
-- ========================================
CREATE OR REPLACE FUNCTION update_slot_booking_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.slot_id IS NOT NULL THEN
    -- Increment count when booking is created
    UPDATE available_slots
    SET current_bookings = current_bookings + 1
    WHERE id = NEW.slot_id;

    -- Mark slot as unavailable if full
    UPDATE available_slots
    SET is_available = FALSE
    WHERE id = NEW.slot_id
      AND current_bookings >= max_bookings;

  ELSIF TG_OP = 'DELETE' AND OLD.slot_id IS NOT NULL THEN
    -- Decrement count when booking is deleted
    UPDATE available_slots
    SET current_bookings = current_bookings - 1,
        is_available = TRUE
    WHERE id = OLD.slot_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes (cancelled bookings)
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' AND NEW.slot_id IS NOT NULL THEN
      UPDATE available_slots
      SET current_bookings = current_bookings - 1,
          is_available = TRUE
      WHERE id = NEW.slot_id;
    END IF;

    -- Handle slot_id changes
    IF OLD.slot_id IS DISTINCT FROM NEW.slot_id THEN
      IF OLD.slot_id IS NOT NULL THEN
        UPDATE available_slots
        SET current_bookings = current_bookings - 1,
            is_available = TRUE
        WHERE id = OLD.slot_id;
      END IF;

      IF NEW.slot_id IS NOT NULL THEN
        UPDATE available_slots
        SET current_bookings = current_bookings + 1
        WHERE id = NEW.slot_id;

        UPDATE available_slots
        SET is_available = FALSE
        WHERE id = NEW.slot_id
          AND current_bookings >= max_bookings;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_slot_booking_count ON public.bookings;

CREATE TRIGGER trigger_update_slot_booking_count
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_booking_count();

-- ========================================
-- RLS POLICIES
-- ========================================
ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can view available slots
DROP POLICY IF EXISTS "Anyone can view available slots" ON public.available_slots;
CREATE POLICY "Anyone can view available slots"
  ON public.available_slots FOR SELECT
  USING (is_available = TRUE AND slot_date >= CURRENT_DATE);

-- Coaches can view their own slots (including unavailable)
DROP POLICY IF EXISTS "Coaches can view own slots" ON public.available_slots;
CREATE POLICY "Coaches can view own slots"
  ON public.available_slots FOR SELECT
  USING (coach_id = auth.uid());

-- Admins can view all slots
DROP POLICY IF EXISTS "Admins can view all slots" ON public.available_slots;
CREATE POLICY "Admins can view all slots"
  ON public.available_slots FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Coaches can manage their own slots
DROP POLICY IF EXISTS "Coaches can manage own slots" ON public.available_slots;
CREATE POLICY "Coaches can manage own slots"
  ON public.available_slots FOR ALL
  USING (
    coach_id = auth.uid()
    AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('coach', 'admin'))
  );

-- Admins can manage all slots
DROP POLICY IF EXISTS "Admins can manage all slots" ON public.available_slots;
CREATE POLICY "Admins can manage all slots"
  ON public.available_slots FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ========================================
-- HELPER FUNCTION: Generate Weekly Slots
-- ========================================
CREATE OR REPLACE FUNCTION generate_weekly_slots(
  p_coach_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_days_of_week INTEGER[], -- Array of day numbers: 0=Sunday, 1=Monday, etc.
  p_start_time TIME,
  p_end_time TIME,
  p_slot_duration_minutes INTEGER,
  p_location TEXT DEFAULT 'PSP Training Facility',
  p_max_bookings INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  v_current_date DATE;
  v_current_time TIME;
  v_slots_created INTEGER := 0;
BEGIN
  v_current_date := p_start_date;

  WHILE v_current_date <= p_end_date LOOP
    -- Check if this day of week is in the array
    IF EXTRACT(DOW FROM v_current_date)::INTEGER = ANY(p_days_of_week) THEN
      v_current_time := p_start_time;

      WHILE v_current_time < p_end_time LOOP
        INSERT INTO available_slots (
          coach_id,
          slot_date,
          start_time,
          end_time,
          location,
          max_bookings,
          is_recurring,
          recurrence_pattern
        ) VALUES (
          p_coach_id,
          v_current_date,
          v_current_time,
          v_current_time + (p_slot_duration_minutes || ' minutes')::INTERVAL,
          p_location,
          p_max_bookings,
          TRUE,
          'weekly'
        );

        v_slots_created := v_slots_created + 1;
        v_current_time := v_current_time + (p_slot_duration_minutes || ' minutes')::INTERVAL;
      END LOOP;
    END IF;

    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  RETURN v_slots_created;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- SUCCESS
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Availability system ready! Triggers, policies, and helper function configured.';
END $$;
