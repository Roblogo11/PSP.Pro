-- ============================================================================
-- PSP.Pro Demo Data Setup for Admin Account (roblogo.com@gmail.com)
-- UUID: fc81d2bc-d35c-4b0e-a080-c584b8970356
-- ============================================================================

-- 1. ADD 2 SAMPLE DRILLS
-- ============================================================================

INSERT INTO drills (
  title,
  youtube_url,
  thumbnail_url,
  category,
  difficulty,
  description,
  instructions,
  duration,
  tags,
  equipment,
  focus_areas,
  is_published,
  is_featured,
  created_by
) VALUES
(
  'Arm Care Routine - J-Bands Warm-Up',
  'https://www.youtube.com/watch?v=EuKpFhMiw5s',
  'https://i.ytimg.com/vi/EuKpFhMiw5s/maxresdefault.jpg',
  'Mechanics',
  'Beginner',
  'Essential arm care routine using J-Bands to warm up the shoulder and prepare for throwing. Perfect for pre-practice or pre-game preparation.',
  '1. Start with light resistance bands
2. Perform 10-15 reps of each exercise
3. Move through full range of motion
4. Focus on controlled movements
5. Progress to heavier bands as you improve',
  '10-15 minutes',
  ARRAY['arm-care', 'warm-up', 'j-bands', 'shoulder-health', 'injury-prevention'],
  ARRAY['J-Bands', 'Resistance Bands'],
  ARRAY['Shoulder Health', 'Arm Strength', 'Injury Prevention'],
  true,
  true,
  'fc81d2bc-d35c-4b0e-a080-c584b8970356'
),
(
  'Exit Velocity Progression - Tee Work',
  'https://www.youtube.com/watch?v=gVDX8u2b0uU',
  'https://i.ytimg.com/vi/gVDX8u2b0uU/maxresdefault.jpg',
  'Hitting',
  'Intermediate',
  'Systematic approach to increasing exit velocity through proper tee work mechanics. Focus on hip rotation, weight transfer, and bat path.',
  '1. Set up tee at proper height (mid-thigh)
2. Start with 50% power swings for timing
3. Progress to 75% power focusing on contact point
4. Finish with full power swings tracking exit velo
5. Complete 3 rounds of 10 swings each',
  '20-30 minutes',
  ARRAY['hitting', 'exit-velocity', 'tee-work', 'bat-speed', 'power-hitting'],
  ARRAY['Tee', 'Baseball/Softball', 'Bat', 'Radar Gun (optional)'],
  ARRAY['Exit Velocity', 'Hip Rotation', 'Bat Path', 'Power Generation'],
  true,
  false,
  'fc81d2bc-d35c-4b0e-a080-c584b8970356'
);


-- 2. SET AVAILABILITY - ONE WEEK (Next 7 days from today)
-- ============================================================================
-- Monday-Friday: 3PM-9PM (3-hour blocks)
-- Saturday: 9AM-5PM (2-hour blocks)
-- Sunday: 9AM-3PM (2-hour blocks)

-- Calculate dates dynamically starting from today
DO $$
DECLARE
  start_date DATE := CURRENT_DATE;
  coach_uuid UUID := 'fc81d2bc-d35c-4b0e-a080-c584b8970356';
  day_offset INTEGER;
  current_date DATE;
  day_of_week INTEGER;
BEGIN
  -- Loop through next 7 days
  FOR day_offset IN 0..6 LOOP
    current_date := start_date + day_offset;
    day_of_week := EXTRACT(DOW FROM current_date); -- 0=Sunday, 6=Saturday

    -- Monday-Friday (1-5): 3PM-9PM in 2-hour blocks
    IF day_of_week BETWEEN 1 AND 5 THEN
      INSERT INTO available_slots (coach_id, service_id, slot_date, start_time, end_time, location, max_bookings, current_bookings, is_available)
      VALUES
        (coach_uuid, NULL, current_date, '15:00', '17:00', 'PSP Training Facility - Virginia Beach', 2, 0, true),
        (coach_uuid, NULL, current_date, '17:00', '19:00', 'PSP Training Facility - Virginia Beach', 2, 0, true),
        (coach_uuid, NULL, current_date, '19:00', '21:00', 'PSP Training Facility - Virginia Beach', 2, 0, true);

    -- Saturday (6): 9AM-5PM in 2-hour blocks
    ELSIF day_of_week = 6 THEN
      INSERT INTO available_slots (coach_id, service_id, slot_date, start_time, end_time, location, max_bookings, current_bookings, is_available)
      VALUES
        (coach_uuid, NULL, current_date, '09:00', '11:00', 'PSP Training Facility - Virginia Beach', 3, 0, true),
        (coach_uuid, NULL, current_date, '11:00', '13:00', 'PSP Training Facility - Virginia Beach', 3, 0, true),
        (coach_uuid, NULL, current_date, '13:00', '15:00', 'PSP Training Facility - Virginia Beach', 3, 0, true),
        (coach_uuid, NULL, current_date, '15:00', '17:00', 'PSP Training Facility - Virginia Beach', 2, 0, true);

    -- Sunday (0): 9AM-3PM in 2-hour blocks
    ELSIF day_of_week = 0 THEN
      INSERT INTO available_slots (coach_id, service_id, slot_date, start_time, end_time, location, max_bookings, current_bookings, is_available)
      VALUES
        (coach_uuid, NULL, current_date, '09:00', '11:00', 'PSP Training Facility - Virginia Beach', 3, 0, true),
        (coach_uuid, NULL, current_date, '11:00', '13:00', 'PSP Training Facility - Virginia Beach', 3, 0, true),
        (coach_uuid, NULL, current_date, '13:00', '15:00', 'PSP Training Facility - Virginia Beach', 2, 0, true);
    END IF;
  END LOOP;
END $$;


-- 3. SET AVAILABILITY - NEXT 3 WEEKENDS (After the first week)
-- ============================================================================
-- Saturdays: 9AM-5PM (2-hour blocks)
-- Sundays: 9AM-3PM (2-hour blocks)

DO $$
DECLARE
  start_date DATE := CURRENT_DATE + 7; -- Start from 1 week out
  coach_uuid UUID := 'fc81d2bc-d35c-4b0e-a080-c584b8970356';
  weekend_num INTEGER;
  saturday_date DATE;
  sunday_date DATE;
BEGIN
  -- Loop through next 3 weekends
  FOR weekend_num IN 0..2 LOOP
    -- Calculate Saturday and Sunday dates
    saturday_date := start_date + (weekend_num * 7) + (6 - EXTRACT(DOW FROM start_date));
    sunday_date := saturday_date + 1;

    -- Saturday: 9AM-5PM in 2-hour blocks
    INSERT INTO available_slots (coach_id, service_id, slot_date, start_time, end_time, location, max_bookings, current_bookings, is_available)
    VALUES
      (coach_uuid, NULL, saturday_date, '09:00', '11:00', 'PSP Training Facility - Virginia Beach', 3, 0, true),
      (coach_uuid, NULL, saturday_date, '11:00', '13:00', 'PSP Training Facility - Virginia Beach', 3, 0, true),
      (coach_uuid, NULL, saturday_date, '13:00', '15:00', 'PSP Training Facility - Virginia Beach', 3, 0, true),
      (coach_uuid, NULL, saturday_date, '15:00', '17:00', 'PSP Training Facility - Virginia Beach', 2, 0, true);

    -- Sunday: 9AM-3PM in 2-hour blocks
    INSERT INTO available_slots (coach_id, service_id, slot_date, start_time, end_time, location, max_bookings, current_bookings, is_available)
    VALUES
      (coach_uuid, NULL, sunday_date, '09:00', '11:00', 'PSP Training Facility - Virginia Beach', 3, 0, true),
      (coach_uuid, NULL, sunday_date, '11:00', '13:00', 'PSP Training Facility - Virginia Beach', 3, 0, true),
      (coach_uuid, NULL, sunday_date, '13:00', '15:00', 'PSP Training Facility - Virginia Beach', 2, 0, true);
  END LOOP;
END $$;


-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Summary:
-- ✅ 2 realistic training drills added (Arm Care + Exit Velocity)
-- ✅ One full week of availability (Mon-Fri 3-9PM, Sat 9-5PM, Sun 9-3PM)
-- ✅ Next 3 weekends (Saturdays 9-5PM, Sundays 9-3PM)
--
-- Total Time Slots: ~30-40 slots for booking demos
-- ============================================================================
