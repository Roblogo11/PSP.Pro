-- =============================================
-- Athlete Performance Tracking System
-- =============================================

-- Athlete Performance Metrics Table
CREATE TABLE IF NOT EXISTS athlete_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Coach who recorded it
  session_id UUID REFERENCES bookings(id) ON DELETE SET NULL, -- Optional: link to a session

  -- Date and Context
  recorded_at TIMESTAMPTZ DEFAULT now(),
  test_date DATE NOT NULL,
  location TEXT,
  conditions TEXT, -- Weather, indoor/outdoor, etc.
  notes TEXT,

  -- Throwing Metrics (Baseball/Softball)
  throwing_velocity_mph DECIMAL(5,2), -- Max throwing velocity
  throwing_velocity_avg_mph DECIMAL(5,2), -- Average throwing velocity
  throwing_accuracy_percentage DECIMAL(5,2), -- Accuracy %
  throwing_consistency_score INTEGER CHECK (throwing_consistency_score >= 0 AND throwing_consistency_score <= 100),

  -- Batting Metrics
  exit_velocity_mph DECIMAL(5,2), -- Exit velocity off bat
  exit_velocity_avg_mph DECIMAL(5,2), -- Average exit velocity
  bat_speed_mph DECIMAL(5,2),
  launch_angle_degrees DECIMAL(5,2),
  hitting_percentage DECIMAL(5,2),

  -- Speed & Agility
  sixty_yard_dash_seconds DECIMAL(5,2), -- 60-yard dash time
  ten_yard_split_seconds DECIMAL(5,2), -- 10-yard split
  home_to_first_seconds DECIMAL(5,2), -- Home to 1st base time

  -- Power & Strength
  vertical_jump_inches DECIMAL(5,2),
  broad_jump_inches DECIMAL(5,2),
  squat_weight_lbs INTEGER,
  bench_press_lbs INTEGER,
  deadlift_lbs INTEGER,

  -- Flexibility & Mobility
  flexibility_score INTEGER CHECK (flexibility_score >= 0 AND flexibility_score <= 100),
  range_of_motion_score INTEGER CHECK (range_of_motion_score >= 0 AND range_of_motion_score <= 100),

  -- Overall Assessment
  overall_performance_score INTEGER CHECK (overall_performance_score >= 0 AND overall_performance_score <= 100),
  improvement_since_last DECIMAL(5,2), -- % improvement

  -- Custom Fields (JSON for flexibility)
  custom_metrics JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Goals Table
CREATE TABLE IF NOT EXISTS athlete_performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  set_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Coach who set it

  goal_type TEXT NOT NULL, -- 'throwing_velocity', 'exit_velocity', 'sixty_yard_dash', etc.
  metric_name TEXT NOT NULL,
  current_value DECIMAL(10,2),
  target_value DECIMAL(10,2) NOT NULL,
  target_date DATE,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'expired', 'revised')),
  achieved_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Notes/Observations Table
CREATE TABLE IF NOT EXISTS athlete_performance_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  note_type TEXT DEFAULT 'observation' CHECK (note_type IN ('observation', 'strength', 'weakness', 'improvement', 'injury', 'general')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false, -- Private notes only visible to coaches

  tags TEXT[], -- For categorization

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_athlete ON athlete_performance_metrics(athlete_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON athlete_performance_metrics(test_date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_by ON athlete_performance_metrics(recorded_by);
CREATE INDEX IF NOT EXISTS idx_performance_goals_athlete ON athlete_performance_goals(athlete_id);
CREATE INDEX IF NOT EXISTS idx_performance_notes_athlete ON athlete_performance_notes(athlete_id);
CREATE INDEX IF NOT EXISTS idx_performance_notes_coach ON athlete_performance_notes(coach_id);

-- Row Level Security (RLS)
ALTER TABLE athlete_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_performance_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for athlete_performance_metrics
CREATE POLICY "Coaches and admins can insert performance metrics"
  ON athlete_performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Coaches and admins can view all performance metrics"
  ON athlete_performance_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
    OR athlete_id = auth.uid() -- Athletes can see their own
  );

CREATE POLICY "Coaches and admins can update performance metrics"
  ON athlete_performance_metrics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Coaches and admins can delete performance metrics"
  ON athlete_performance_metrics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

-- RLS Policies for athlete_performance_goals
CREATE POLICY "Coaches and admins can manage goals"
  ON athlete_performance_goals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
    OR athlete_id = auth.uid() -- Athletes can see their own
  );

-- RLS Policies for athlete_performance_notes
CREATE POLICY "Coaches and admins can manage notes"
  ON athlete_performance_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
    OR (athlete_id = auth.uid() AND is_private = false) -- Athletes can see their non-private notes
  );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_athlete_performance_metrics_updated_at ON athlete_performance_metrics;
CREATE TRIGGER update_athlete_performance_metrics_updated_at
  BEFORE UPDATE ON athlete_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_athlete_performance_goals_updated_at ON athlete_performance_goals;
CREATE TRIGGER update_athlete_performance_goals_updated_at
  BEFORE UPDATE ON athlete_performance_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_athlete_performance_notes_updated_at ON athlete_performance_notes;
CREATE TRIGGER update_athlete_performance_notes_updated_at
  BEFORE UPDATE ON athlete_performance_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE athlete_performance_metrics IS 'Stores performance test results and metrics for athletes';
COMMENT ON TABLE athlete_performance_goals IS 'Tracks performance goals set by coaches for athletes';
COMMENT ON TABLE athlete_performance_notes IS 'Coach observations and notes about athlete performance';
