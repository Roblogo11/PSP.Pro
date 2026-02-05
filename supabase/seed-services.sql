-- Manually insert services (run this if services table is empty)

-- First, disable RLS temporarily to insert data
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Clear any existing services
TRUNCATE services CASCADE;

-- Insert services
INSERT INTO services (name, description, duration_minutes, price_cents, category, max_participants, is_active) VALUES
  ('1-on-1 Pitching Session', 'Individual pitching mechanics and velocity training', 60, 7500, 'individual', 1, true),
  ('1-on-1 Hitting Session', 'Personalized hitting mechanics and power development', 60, 7500, 'individual', 1, true),
  ('Group Speed & Agility', 'Small group speed training and athletic development', 90, 5000, 'group', 6, true),
  ('Recovery & Mobility', 'Guided recovery session with mobility work', 45, 4500, 'individual', 1, true),
  ('Video Analysis Session', 'In-depth video breakdown of mechanics', 30, 5000, 'individual', 1, true);

-- Re-enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Verify the data
SELECT * FROM services;
