-- ========================================
-- PSP.Pro Complete Booking & Coach-Athlete System
-- ========================================
-- Works with existing services and bookings tables
-- ========================================

-- ========================================
-- 1. SERVICES - Add slug if missing
-- ========================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'slug') THEN
    ALTER TABLE public.services ADD COLUMN slug TEXT;
    UPDATE public.services SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
    ALTER TABLE public.services ALTER COLUMN slug SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS services_slug_unique ON public.services(slug);
  END IF;
END $$;

-- Insert/update default services
INSERT INTO public.services (
  name, slug, description, duration_minutes, price_cents, category, max_participants, is_active, stripe_price_id
) VALUES
  ('1-on-1 Pitching', '1-on-1-pitching', 'Individual pitching mechanics and velocity training', 60, 7500, 'training', 1, true, NULL),
  ('1-on-1 Hitting', '1-on-1-hitting', 'Individual hitting mechanics and bat speed training', 60, 7500, 'training', 1, true, NULL),
  ('Group Training', 'group-training', 'Small group training session (2-4 athletes)', 90, 5000, 'training', 4, true, NULL),
  ('Video Analysis', 'video-analysis', 'In-depth video breakdown of mechanics', 30, 5000, 'analysis', 1, true, NULL),
  ('Recovery Session', 'recovery-session', 'Mobility, recovery, and injury prevention', 45, 4500, 'recovery', 1, true, NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  price_cents = EXCLUDED.price_cents,
  category = EXCLUDED.category,
  max_participants = EXCLUDED.max_participants,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ========================================
-- 2. PACKAGES TABLE (create first, needed for bookings FK)
-- ========================================
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  total_sessions INTEGER NOT NULL CHECK (total_sessions > 0),
  sessions_remaining INTEGER NOT NULL CHECK (sessions_remaining >= 0),
  price_paid NUMERIC(10,2) NOT NULL CHECK (price_paid >= 0),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_packages_athlete ON public.packages(athlete_id);
CREATE INDEX IF NOT EXISTS idx_packages_active ON public.packages(active) WHERE active = TRUE;

-- ========================================
-- 3. BOOKINGS - Add missing columns
-- ========================================
DO $$
BEGIN
  -- Add package_id if missing (now packages table exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'package_id') THEN
    ALTER TABLE public.bookings ADD COLUMN package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL;
  END IF;

  -- Add athlete_notes if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'athlete_notes') THEN
    ALTER TABLE public.bookings ADD COLUMN athlete_notes TEXT;
  END IF;

  -- Add coach_notes if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'coach_notes') THEN
    ALTER TABLE public.bookings ADD COLUMN coach_notes TEXT;
  END IF;

  -- Add internal_notes if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'internal_notes') THEN
    ALTER TABLE public.bookings ADD COLUMN internal_notes TEXT;
  END IF;

  -- Add checked_in_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'checked_in_at') THEN
    ALTER TABLE public.bookings ADD COLUMN checked_in_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add completed_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'completed_at') THEN
    ALTER TABLE public.bookings ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Make coach_id nullable if it's not
  BEGIN
    ALTER TABLE public.bookings ALTER COLUMN coach_id DROP NOT NULL;
  EXCEPTION
    WHEN OTHERS THEN NULL; -- Ignore if already nullable
  END;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_bookings_package ON public.bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_athlete ON public.bookings(athlete_id);
CREATE INDEX IF NOT EXISTS idx_bookings_coach ON public.bookings(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- ========================================
-- 4. COACH-ATHLETE RELATIONSHIPS
-- ========================================
CREATE TABLE IF NOT EXISTS public.coach_athletes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'coach_athletes_coach_id_athlete_id_key') THEN
    ALTER TABLE public.coach_athletes ADD CONSTRAINT coach_athletes_coach_id_athlete_id_key UNIQUE(coach_id, athlete_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coach_athletes_coach ON public.coach_athletes(coach_id) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_coach_athletes_athlete ON public.coach_athletes(athlete_id) WHERE active = TRUE;

-- ========================================
-- 5. UPDATE ASSIGNED_DRILLS
-- ========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assigned_drills' AND column_name = 'assigned_by_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'assigned_drills' AND column_name = 'assigned_by'
    ) THEN
      ALTER TABLE public.assigned_drills DROP COLUMN assigned_by;
    END IF;

    ALTER TABLE public.assigned_drills
      ADD COLUMN assigned_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_assigned_drills_assigned_by ON public.assigned_drills(assigned_by_id);
  END IF;
END $$;

-- ========================================
-- 6. RLS POLICIES
-- ========================================

-- Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Athletes can view own packages" ON public.packages;
CREATE POLICY "Athletes can view own packages"
  ON public.packages FOR SELECT
  USING (athlete_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all packages" ON public.packages;
CREATE POLICY "Admins can view all packages"
  ON public.packages FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;
CREATE POLICY "Admins can manage packages"
  ON public.packages FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Athletes can view own bookings" ON public.bookings;
CREATE POLICY "Athletes can view own bookings"
  ON public.bookings FOR SELECT
  USING (athlete_id = auth.uid());

DROP POLICY IF EXISTS "Coaches can view their assigned bookings" ON public.bookings;
CREATE POLICY "Coaches can view their assigned bookings"
  ON public.bookings FOR SELECT
  USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Athletes can create bookings" ON public.bookings;
CREATE POLICY "Athletes can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    athlete_id = auth.uid()
    AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'athlete')
  );

DROP POLICY IF EXISTS "Coaches can update their bookings" ON public.bookings;
CREATE POLICY "Coaches can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    coach_id = auth.uid()
    AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('coach', 'admin'))
  );

DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Coach-Athletes
ALTER TABLE public.coach_athletes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coaches can view their athletes" ON public.coach_athletes;
CREATE POLICY "Coaches can view their athletes"
  ON public.coach_athletes FOR SELECT
  USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "Athletes can view their coaches" ON public.coach_athletes;
CREATE POLICY "Athletes can view their coaches"
  ON public.coach_athletes FOR SELECT
  USING (athlete_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all relationships" ON public.coach_athletes;
CREATE POLICY "Admins can view all relationships"
  ON public.coach_athletes FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage relationships" ON public.coach_athletes;
CREATE POLICY "Admins can manage relationships"
  ON public.coach_athletes FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ========================================
-- 7. HELPFUL VIEWS
-- ========================================

DROP VIEW IF EXISTS coach_upcoming_sessions CASCADE;
CREATE OR REPLACE VIEW coach_upcoming_sessions AS
SELECT
  b.id,
  b.booking_date,
  b.start_time,
  b.end_time,
  b.status,
  s.name as service_name,
  s.duration_minutes,
  a.full_name as athlete_name,
  a.avatar_url as athlete_avatar,
  b.coach_id
FROM bookings b
JOIN profiles a ON b.athlete_id = a.id
JOIN services s ON b.service_id = s.id
WHERE b.status IN ('pending', 'confirmed')
  AND b.booking_date >= CURRENT_DATE
ORDER BY b.booking_date, b.start_time;

DROP VIEW IF EXISTS athlete_progress_summary CASCADE;
CREATE OR REPLACE VIEW athlete_progress_summary AS
SELECT
  p.id as athlete_id,
  p.full_name as athlete_name,
  p.avatar_url,
  ca.coach_id,
  COUNT(DISTINCT ad.id) as drills_assigned,
  COUNT(DISTINCT CASE WHEN ad.completed THEN ad.id END) as drills_completed,
  COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as sessions_completed,
  MAX(b.booking_date) as last_session_date,
  MAX(vl.velocity_mph) as max_velocity,
  AVG(vl.velocity_mph) as avg_velocity,
  COUNT(vl.id) as velocity_readings
FROM profiles p
LEFT JOIN coach_athletes ca ON p.id = ca.athlete_id AND ca.active = TRUE
LEFT JOIN assigned_drills ad ON p.id = ad.user_id
LEFT JOIN bookings b ON p.id = b.athlete_id
LEFT JOIN velocity_logs vl ON p.id = vl.user_id
WHERE p.role = 'athlete'
GROUP BY p.id, p.full_name, p.avatar_url, ca.coach_id;

-- ========================================
-- SUCCESS
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed! Tables updated with missing columns.';
END $$;
