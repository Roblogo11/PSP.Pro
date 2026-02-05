-- Quick check to see if data exists (run this in Supabase SQL Editor)

-- Check if services exist
SELECT COUNT(*) as service_count FROM services;
SELECT * FROM services;

-- Check if tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('services', 'bookings', 'available_slots', 'coach_schedules', 'training_packages', 'athlete_packages')
ORDER BY table_name;

-- Check RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('services', 'bookings', 'available_slots')
ORDER BY tablename, policyname;
