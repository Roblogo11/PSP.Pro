-- Manually insert services (run this if services table is empty)

-- First, disable RLS temporarily to insert data
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Clear any existing services
TRUNCATE services CASCADE;

-- Insert services
INSERT INTO services (name, description, duration_minutes, price_cents, category, max_participants, is_active) VALUES
  ('1-on-1 Skills Training', 'Individual technical skills and mechanics training for your sport', 60, 7500, 'individual', 1, true),
  ('1-on-1 Performance Session', 'Personalized athletic performance and sport-specific development', 60, 7500, 'individual', 1, true),
  ('Group Speed & Agility', 'Small group speed training and athletic development', 90, 5000, 'group', 6, true),
  ('Position-Specific Training', 'Specialized training for your position (goalkeeper, point guard, pitcher, etc.)', 60, 7500, 'individual', 1, true),
  ('Recovery & Mobility', 'Guided recovery session with mobility work', 45, 4500, 'individual', 1, true),
  ('Video Analysis Session', 'In-depth video breakdown of mechanics and technique', 30, 5000, 'individual', 1, true),
  ('Strength & Conditioning', 'Sport-specific strength training and conditioning', 60, 6500, 'individual', 1, true),
  ('Small Group Training', 'Semi-private training session (2-4 athletes)', 75, 4000, 'group', 4, true);

-- Re-enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Verify the data
SELECT * FROM services;
