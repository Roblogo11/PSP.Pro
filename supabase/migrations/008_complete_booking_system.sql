-- ========================================
-- PSP.Pro Complete Booking & Coach-Athlete System
-- ========================================
-- Adds:
-- 1. Services (session types & pricing)
-- 2. Bookings (complete scheduling with coach/athlete tracking)
-- 3. Packages (session bundles)
-- 4. Coach-Athlete Relationships
-- 5. Enhanced session tracking
-- ========================================

-- ========================================
-- 1. SERVICES TABLE
-- ========================================
-- Define available session types
CREATE TABLE public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Service details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Pricing
  price_per_session NUMERIC(10,2) NOT NULL CHECK (price_per_session >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),

  -- Availability
  max_participants INTEGER DEFAULT 1 CHECK (max_participants > 0),
  active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Insert default services
INSERT INTO public.services (name, slug, description, price_per_session, duration_minutes, max_participants) VALUES
  ('1-on-1 Pitching', '1-on-1-pitching', 'Individual pitching mechanics and velocity training', 75.00, 60, 1),
  ('1-on-1 Hitting', '1-on-1-hitting', 'Individual hitting mechanics and bat speed training', 75.00, 60, 1),
  ('Group Training', 'group-training', 'Small group training session (2-4 athletes)', 50.00, 90, 4),
  ('Video Analysis', 'video-analysis', 'In-depth video breakdown of mechanics', 50.00, 30, 1),
  ('Recovery Session', 'recovery-session', 'Mobility, recovery, and injury prevention', 45.00, 45, 1);

-- ========================================
-- 2. PACKAGES TABLE
-- ========================================
-- Track purchased session packages
CREATE TABLE public.packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Package details
  name TEXT NOT NULL,
  total_sessions INTEGER NOT NULL CHECK (total_sessions > 0),
  sessions_remaining INTEGER NOT NULL CHECK (sessions_remaining >= 0),
  price_paid NUMERIC(10,2) NOT NULL CHECK (price_paid >= 0),

  -- Validity
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT TRUE,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_packages_athlete ON public.packages(athlete_id);
CREATE INDEX idx_packages_active ON public.packages(active) WHERE active = TRUE;

-- ========================================
-- 3. BOOKINGS TABLE (replaces basic sessions)
-- ========================================
-- Complete booking system with coach/athlete/service tracking
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Who & What
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL NOT NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,

  -- When & Where
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT DEFAULT 'PSP Training Facility',

  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')) DEFAULT 'pending',

  -- Session details
  athlete_notes TEXT,
  coach_notes TEXT,
  internal_notes TEXT, -- Admin only notes

  -- Payment
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'complimentary')) DEFAULT 'pending',
  amount_paid NUMERIC(10,2),

  -- Attendance
  checked_in_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_coach CHECK (
    coach_id IS NULL OR
    coach_id IN (SELECT id FROM profiles WHERE role IN ('coach', 'admin'))
  )
);

-- Indexes for performance
CREATE INDEX idx_bookings_athlete ON public.bookings(athlete_id);
CREATE INDEX idx_bookings_coach ON public.bookings(coach_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_upcoming ON public.bookings(booking_date, start_time)
  WHERE status IN ('pending', 'confirmed');

-- ========================================
-- 4. COACH-ATHLETE RELATIONSHIPS
-- ========================================
-- Track which athletes are assigned to which coaches
CREATE TABLE public.coach_athletes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Relationship details
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,

  -- Prevent duplicate assignments
  UNIQUE(coach_id, athlete_id)
);

CREATE INDEX idx_coach_athletes_coach ON public.coach_athletes(coach_id) WHERE active = TRUE;
CREATE INDEX idx_coach_athletes_athlete ON public.coach_athletes(athlete_id) WHERE active = TRUE;

-- ========================================
-- 5. UPDATE ASSIGNED_DRILLS
-- ========================================
-- Change assigned_by from TEXT to UUID reference
ALTER TABLE public.assigned_drills
  DROP COLUMN assigned_by;

ALTER TABLE public.assigned_drills
  ADD COLUMN assigned_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX idx_assigned_drills_assigned_by ON public.assigned_drills(assigned_by_id);

-- ========================================
-- 6. MIGRATE OLD SESSIONS TO BOOKINGS
-- ========================================
-- Migrate existing sessions data to new bookings table
INSERT INTO public.bookings (
  athlete_id,
  service_id,
  booking_date,
  start_time,
  end_time,
  location,
  status,
  coach_notes,
  completed_at,
  created_at,
  updated_at
)
SELECT
  user_id as athlete_id,
  (SELECT id FROM services WHERE slug = '1-on-1-pitching' LIMIT 1) as service_id, -- Default to pitching
  DATE(scheduled_at) as booking_date,
  TIME(scheduled_at) as start_time,
  TIME(scheduled_at + (duration_minutes || ' minutes')::INTERVAL) as end_time,
  COALESCE(location, 'PSP Training Facility') as location,
  CASE
    WHEN completed = TRUE THEN 'completed'
    ELSE 'confirmed'
  END as status,
  coach_notes,
  CASE WHEN completed = TRUE THEN updated_at ELSE NULL END as completed_at,
  created_at,
  updated_at
FROM public.sessions
WHERE scheduled_at IS NOT NULL;

-- ========================================
-- 7. RLS POLICIES
-- ========================================

-- Services (public read, admin manage)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own packages"
  ON public.packages FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Admins can view all packages"
  ON public.packages FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can manage packages"
  ON public.packages FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own bookings"
  ON public.bookings FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Coaches can view their assigned bookings"
  ON public.bookings FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Athletes can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    athlete_id = auth.uid()
    AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'athlete')
  );

CREATE POLICY "Coaches can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    coach_id = auth.uid()
    AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('coach', 'admin'))
  );

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Coach-Athletes
ALTER TABLE public.coach_athletes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their athletes"
  ON public.coach_athletes FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "Athletes can view their coaches"
  ON public.coach_athletes FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Admins can view all relationships"
  ON public.coach_athletes FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can manage relationships"
  ON public.coach_athletes FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ========================================
-- 8. HELPFUL VIEWS
-- ========================================

-- Coach dashboard view: upcoming sessions
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

-- Athlete progress summary for coaches
CREATE OR REPLACE VIEW athlete_progress_summary AS
SELECT
  p.id as athlete_id,
  p.full_name as athlete_name,
  p.avatar_url,
  ca.coach_id,

  -- Drill stats
  COUNT(DISTINCT ad.id) as drills_assigned,
  COUNT(DISTINCT CASE WHEN ad.completed THEN ad.id END) as drills_completed,

  -- Session stats
  COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as sessions_completed,
  MAX(b.booking_date) as last_session_date,

  -- Velocity stats
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
-- COMMENTS
-- ========================================
COMMENT ON TABLE public.services IS 'Available training services/session types';
COMMENT ON TABLE public.packages IS 'Session packages purchased by athletes';
COMMENT ON TABLE public.bookings IS 'Complete booking system with coach/athlete/service tracking';
COMMENT ON TABLE public.coach_athletes IS 'Coach-athlete relationships for progress tracking';
COMMENT ON VIEW coach_upcoming_sessions IS 'Coaches upcoming sessions with athlete details';
COMMENT ON VIEW athlete_progress_summary IS 'Athlete progress metrics for coaches';
