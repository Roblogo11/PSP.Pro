-- =============================================
-- PSP.Pro Booking System Schema
-- =============================================

-- First, add role column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'athlete' CHECK (role IN ('athlete', 'coach', 'admin'));
  END IF;
END $$;

-- Services/Training Types Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER NOT NULL, -- Price in cents for Stripe
  category TEXT NOT NULL, -- 'individual', 'group', 'package'
  max_participants INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT, -- Stripe Price ID for recurring/package items
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coach/Trainer Availability Table
CREATE TABLE IF NOT EXISTS coach_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Available Time Slots Table (for specific dates)
CREATE TABLE IF NOT EXISTS available_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  max_bookings INTEGER DEFAULT 1, -- For group sessions
  current_bookings INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_slot_time CHECK (end_time > start_time),
  CONSTRAINT valid_booking_count CHECK (current_bookings <= max_bookings)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  slot_id UUID REFERENCES available_slots(id) ON DELETE SET NULL,

  -- Booking Details
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  location TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show')),

  -- Payment
  amount_cents INTEGER NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,

  -- Metadata
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training Packages Table (for multi-session purchases)
CREATE TABLE IF NOT EXISTS training_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sessions_included INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  validity_days INTEGER DEFAULT 90, -- Package expires after X days
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Athlete Package Purchases
CREATE TABLE IF NOT EXISTS athlete_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES training_packages(id) ON DELETE RESTRICT,

  sessions_total INTEGER NOT NULL,
  sessions_used INTEGER DEFAULT 0,
  sessions_remaining INTEGER GENERATED ALWAYS AS (sessions_total - sessions_used) STORED,

  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,

  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_session_usage CHECK (sessions_used <= sessions_total)
);

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX idx_bookings_athlete ON bookings(athlete_id);
CREATE INDEX idx_bookings_coach ON bookings(coach_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

CREATE INDEX idx_available_slots_coach ON available_slots(coach_id);
CREATE INDEX idx_available_slots_date ON available_slots(slot_date);
CREATE INDEX idx_available_slots_available ON available_slots(is_available);

CREATE INDEX idx_coach_schedules_coach ON coach_schedules(coach_id);
CREATE INDEX idx_coach_schedules_day ON coach_schedules(day_of_week);

CREATE INDEX idx_athlete_packages_athlete ON athlete_packages(athlete_id);
CREATE INDEX idx_athlete_packages_active ON athlete_packages(is_active);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_packages ENABLE ROW LEVEL SECURITY;

-- Services: Public read, admin write
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Coach Schedules: Public read active schedules, coaches and admins can manage their own
CREATE POLICY "Active coach schedules are viewable by everyone" ON coach_schedules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can manage their own schedules" ON coach_schedules
  FOR ALL USING (auth.uid() = coach_id OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Available Slots: Public read available slots, coaches and admins can manage
CREATE POLICY "Available slots are viewable by everyone" ON available_slots
  FOR SELECT USING (is_available = true);

CREATE POLICY "Coaches can manage their own slots" ON available_slots
  FOR ALL USING (auth.uid() = coach_id OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Bookings: Athletes see their own, coaches see their bookings, admins see all
CREATE POLICY "Athletes can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = athlete_id);

CREATE POLICY "Coaches can view their bookings" ON bookings
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Athletes can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = athlete_id);

CREATE POLICY "Coaches and admins can update bookings" ON bookings
  FOR UPDATE USING (
    auth.uid() = coach_id OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Training Packages: Public read active packages, admin write
CREATE POLICY "Active packages are viewable by everyone" ON training_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON training_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Athlete Packages: Athletes see their own, admins see all
CREATE POLICY "Athletes can view their own packages" ON athlete_packages
  FOR SELECT USING (auth.uid() = athlete_id);

CREATE POLICY "Admins can view all athlete packages" ON athlete_packages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Athletes can purchase packages" ON athlete_packages
  FOR INSERT WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Admins can manage athlete packages" ON athlete_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =============================================
-- Functions and Triggers
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_schedules_updated_at BEFORE UPDATE ON coach_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_available_slots_updated_at BEFORE UPDATE ON available_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_packages_updated_at BEFORE UPDATE ON training_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_packages_updated_at BEFORE UPDATE ON athlete_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to decrement available slots when booking is created
CREATE OR REPLACE FUNCTION decrement_slot_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slot_id IS NOT NULL THEN
    UPDATE available_slots
    SET current_bookings = current_bookings + 1,
        is_available = CASE
          WHEN current_bookings + 1 >= max_bookings THEN false
          ELSE true
        END
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_booking_created AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION decrement_slot_availability();

-- Function to increment slot availability when booking is cancelled
CREATE OR REPLACE FUNCTION increment_slot_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND NEW.slot_id IS NOT NULL THEN
    UPDATE available_slots
    SET current_bookings = GREATEST(current_bookings - 1, 0),
        is_available = true
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_booking_cancelled AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION increment_slot_availability();

-- =============================================
-- Seed Data (Example Services)
-- =============================================

INSERT INTO services (name, description, duration_minutes, price_cents, category) VALUES
  ('1-on-1 Pitching Session', 'Individual pitching mechanics and velocity training', 60, 7500, 'individual'),
  ('1-on-1 Hitting Session', 'Personalized hitting mechanics and power development', 60, 7500, 'individual'),
  ('Group Speed & Agility', 'Small group speed training and athletic development', 90, 5000, 'group'),
  ('Recovery & Mobility', 'Guided recovery session with mobility work', 45, 4500, 'individual'),
  ('Video Analysis Session', 'In-depth video breakdown of mechanics', 30, 5000, 'individual')
ON CONFLICT DO NOTHING;
