-- ============================================
-- PSP.Pro Database Schema Migration
-- Athletic OS Platform - Production Ready
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PROFILES TABLE
-- Extends auth.users with athlete-specific data
-- ============================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  athlete_type TEXT CHECK (athlete_type IN ('baseball', 'softball', 'other')),
  age INTEGER CHECK (age >= 5 AND age <= 100),
  parent_email TEXT,
  parent_phone TEXT,
  emergency_contact TEXT,
  velocity_goal_mph NUMERIC(5,2),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SESSIONS TABLE
-- Training sessions (past and upcoming)
-- ============================================

CREATE TABLE public.sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Session details
  title TEXT NOT NULL DEFAULT 'Training Session',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT DEFAULT 'PSP Training Facility',

  -- Status
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  coach_notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX sessions_user_id_idx ON public.sessions(user_id);
CREATE INDEX sessions_scheduled_at_idx ON public.sessions(scheduled_at);
CREATE INDEX sessions_completed_idx ON public.sessions(completed);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DRILLS TABLE
-- Video drill library (admin-managed)
-- ============================================

CREATE TABLE public.drills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Drill information
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  instructions TEXT,

  -- Media
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Categorization
  tags TEXT[] DEFAULT '{}',
  category TEXT CHECK (category IN ('mechanics', 'speed', 'power', 'recovery', 'warmup', 'conditioning')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,

  -- Metadata
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  equipment_needed TEXT[] DEFAULT '{}',
  focus_areas TEXT[] DEFAULT '{}',

  -- Status
  published BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes
CREATE INDEX drills_category_idx ON public.drills(category);
CREATE INDEX drills_difficulty_idx ON public.drills(difficulty);
CREATE INDEX drills_published_idx ON public.drills(published);
CREATE INDEX drills_featured_idx ON public.drills(featured);
CREATE INDEX drills_tags_idx ON public.drills USING GIN(tags);

-- Enable RLS
ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drills are public for all authenticated users)
CREATE POLICY "Drills are viewable by authenticated users"
  ON public.drills FOR SELECT
  USING (auth.role() = 'authenticated' AND published = true);

-- Trigger for updated_at
CREATE TRIGGER update_drills_updated_at
  BEFORE UPDATE ON public.drills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DRILL COMPLETIONS TABLE
-- Track when users complete drills
-- ============================================

CREATE TABLE public.drill_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  drill_id UUID REFERENCES public.drills(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,

  -- Performance data
  velocity_mph NUMERIC(5,2),
  reps_completed INTEGER,
  notes TEXT,

  -- Timestamps
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes
CREATE INDEX drill_completions_user_id_idx ON public.drill_completions(user_id);
CREATE INDEX drill_completions_drill_id_idx ON public.drill_completions(drill_id);
CREATE INDEX drill_completions_completed_at_idx ON public.drill_completions(completed_at);

-- Enable RLS
ALTER TABLE public.drill_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own completions"
  ON public.drill_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own completions"
  ON public.drill_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON public.drill_completions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- VELOCITY LOGS TABLE
-- Track velocity measurements over time
-- ============================================

CREATE TABLE public.velocity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  drill_id UUID REFERENCES public.drills(id) ON DELETE SET NULL,

  -- Velocity data
  velocity_mph NUMERIC(5,2) NOT NULL CHECK (velocity_mph >= 0 AND velocity_mph <= 200),
  pitch_type TEXT,
  notes TEXT,

  -- Timestamp
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes
CREATE INDEX velocity_logs_user_id_idx ON public.velocity_logs(user_id);
CREATE INDEX velocity_logs_session_id_idx ON public.velocity_logs(session_id);
CREATE INDEX velocity_logs_recorded_at_idx ON public.velocity_logs(recorded_at);

-- Enable RLS
ALTER TABLE public.velocity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own velocity logs"
  ON public.velocity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own velocity logs"
  ON public.velocity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own velocity logs"
  ON public.velocity_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ASSIGNED DRILLS TABLE
-- Coaches assign specific drills to athletes
-- ============================================

CREATE TABLE public.assigned_drills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  drill_id UUID REFERENCES public.drills(id) ON DELETE CASCADE NOT NULL,

  -- Assignment details
  assigned_by TEXT, -- Coach name
  due_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  notes TEXT,

  -- Status
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes
CREATE INDEX assigned_drills_user_id_idx ON public.assigned_drills(user_id);
CREATE INDEX assigned_drills_completed_idx ON public.assigned_drills(completed);

-- Enable RLS
ALTER TABLE public.assigned_drills ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own assigned drills"
  ON public.assigned_drills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own assigned drills"
  ON public.assigned_drills FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample drills
INSERT INTO public.drills (title, slug, description, video_url, thumbnail_url, tags, category, difficulty, duration_seconds, equipment_needed)
VALUES
  (
    'Arm Circle Warmup',
    'arm-circle-warmup',
    'Dynamic warmup to prepare shoulder and rotator cuff for throwing.',
    'https://example.com/videos/arm-circles.mp4',
    'https://example.com/thumbnails/arm-circles.jpg',
    ARRAY['warmup', 'shoulder', 'mobility'],
    'warmup',
    'beginner',
    180,
    ARRAY['none']
  ),
  (
    'Long Toss Progression',
    'long-toss-progression',
    'Build arm strength and velocity through progressive distance throwing.',
    'https://example.com/videos/long-toss.mp4',
    'https://example.com/thumbnails/long-toss.jpg',
    ARRAY['throwing', 'arm-strength', 'velocity'],
    'mechanics',
    'intermediate',
    900,
    ARRAY['baseball', 'partner']
  ),
  (
    'Explosive Start Mechanics',
    'explosive-start-mechanics',
    'Develop explosive first-step quickness for base running.',
    'https://example.com/videos/explosive-start.mp4',
    'https://example.com/thumbnails/explosive-start.jpg',
    ARRAY['speed', 'baserunning', 'explosiveness'],
    'speed',
    'intermediate',
    600,
    ARRAY['cones', 'stopwatch']
  ),
  (
    'Rotational Power Training',
    'rotational-power-training',
    'Medicine ball exercises to build core rotation power for hitting.',
    'https://example.com/videos/rotational-power.mp4',
    'https://example.com/thumbnails/rotational-power.jpg',
    ARRAY['hitting', 'power', 'core'],
    'power',
    'advanced',
    720,
    ARRAY['medicine-ball', 'partner']
  ),
  (
    'Post-Throwing Recovery Routine',
    'post-throwing-recovery',
    'Arm care routine to perform after every throwing session.',
    'https://example.com/videos/recovery.mp4',
    'https://example.com/thumbnails/recovery.jpg',
    ARRAY['recovery', 'arm-care', 'cooldown'],
    'recovery',
    'beginner',
    300,
    ARRAY['resistance-band', 'foam-roller']
  );

-- ============================================
-- HELPER VIEWS (for analytics)
-- ============================================

-- User stats summary
CREATE OR REPLACE VIEW user_stats AS
SELECT
  p.id,
  p.full_name,
  COUNT(DISTINCT s.id) AS total_sessions,
  COUNT(DISTINCT dc.id) AS drills_completed,
  AVG(vl.velocity_mph)::NUMERIC(5,2) AS avg_velocity,
  MAX(vl.velocity_mph)::NUMERIC(5,2) AS max_velocity,
  COUNT(DISTINCT DATE(vl.recorded_at)) AS training_days
FROM public.profiles p
LEFT JOIN public.sessions s ON s.user_id = p.id AND s.completed = true
LEFT JOIN public.drill_completions dc ON dc.user_id = p.id
LEFT JOIN public.velocity_logs vl ON vl.user_id = p.id
GROUP BY p.id, p.full_name;

-- Popular drills
CREATE OR REPLACE VIEW popular_drills AS
SELECT
  d.id,
  d.title,
  d.category,
  d.difficulty,
  COUNT(dc.id) AS completion_count,
  d.view_count
FROM public.drills d
LEFT JOIN public.drill_completions dc ON dc.drill_id = d.id
WHERE d.published = true
GROUP BY d.id
ORDER BY completion_count DESC, d.view_count DESC;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get user's next session
CREATE OR REPLACE FUNCTION get_next_session(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  location TEXT,
  duration_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.title, s.scheduled_at, s.location, s.duration_minutes
  FROM public.sessions s
  WHERE s.user_id = user_uuid
    AND s.scheduled_at > NOW()
    AND s.completed = false
  ORDER BY s.scheduled_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment drill view count
CREATE OR REPLACE FUNCTION increment_drill_views(drill_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.drills
  SET view_count = view_count + 1
  WHERE id = drill_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ PSP.Pro database schema created successfully!';
  RAISE NOTICE '📊 Tables: profiles, sessions, drills, drill_completions, velocity_logs, assigned_drills';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '🎯 Sample drills inserted for testing';
  RAISE NOTICE '📈 Helper views and functions created';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '1. Update your .env.local with Supabase credentials';
  RAISE NOTICE '2. Build authentication pages';
  RAISE NOTICE '3. Test user signup and login flow';
END $$;
