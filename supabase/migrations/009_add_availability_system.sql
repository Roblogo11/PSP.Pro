-- ========================================
-- Availability System for Coach Scheduling
-- ========================================
-- Allows coaches to set their available time slots
-- Athletes book from these available slots
-- ========================================

-- ========================================
-- AVAILABLE SLOTS TABLE
-- ========================================
CREATE TABLE public.available_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Coach & Date
  coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slot_date DATE NOT NULL,

  -- Time
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  max_bookings INTEGER DEFAULT 1 CHECK (max_bookings > 0),
  current_bookings INTEGER DEFAULT 0 CHECK (current_bookings >= 0),

  -- Location
  location TEXT DEFAULT 'PSP Training Facility',

  -- Repeating (for recurring availability)
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- 'weekly', 'daily', etc.
  recurrence_end_date DATE,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_bookings CHECK (current_bookings <= max_bookings),
  CONSTRAINT valid_coach CHECK (
    coach_id IN (SELECT id FROM profiles WHERE role IN ('coach', 'admin'))
  )
);

-- Indexes
CREATE INDEX idx_available_slots_coach ON public.available_slots(coach_id);
CREATE INDEX idx_available_slots_date ON public.available_slots(slot_date);
CREATE INDEX idx_available_slots_available ON public.available_slots(is_available, slot_date)
  WHERE is_available = TRUE;

-- ========================================
-- UPDATE BOOKINGS TO LINK TO SLOTS
-- ========================================
-- Add optional link to available_slot
ALTER TABLE public.bookings
  ADD COLUMN slot_id UUID REFERENCES public.available_slots(id) ON DELETE SET NULL;

CREATE INDEX idx_bookings_slot ON public.bookings(slot_id);

-- ========================================
-- TRIGGER: Update slot booking count
-- ========================================
-- When a booking is created/cancelled, update the slot's current_bookings
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

CREATE TRIGGER trigger_update_slot_booking_count
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_booking_count();

-- ========================================
-- RLS POLICIES
-- ========================================
ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can view available slots
CREATE POLICY "Anyone can view available slots"
  ON public.available_slots FOR SELECT
  USING (is_available = TRUE AND slot_date >= CURRENT_DATE);

-- Coaches can view their own slots (including unavailable)
CREATE POLICY "Coaches can view own slots"
  ON public.available_slots FOR SELECT
  USING (coach_id = auth.uid());

-- Admins can view all slots
CREATE POLICY "Admins can view all slots"
  ON public.available_slots FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Coaches can manage their own slots
CREATE POLICY "Coaches can manage own slots"
  ON public.available_slots FOR ALL
  USING (
    coach_id = auth.uid()
    AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('coach', 'admin'))
  );

-- Admins can manage all slots
CREATE POLICY "Admins can manage all slots"
  ON public.available_slots FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ========================================
-- HELPER FUNCTION: Generate Weekly Slots
-- ========================================
-- Coaches can call this to quickly create slots for a week
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
-- COMMENTS
-- ========================================
COMMENT ON TABLE public.available_slots IS 'Coach availability slots for booking';
COMMENT ON FUNCTION generate_weekly_slots IS 'Helper to bulk-create recurring slots for a coach';
COMMENT ON TRIGGER trigger_update_slot_booking_count ON public.bookings IS 'Automatically updates slot booking counts';
