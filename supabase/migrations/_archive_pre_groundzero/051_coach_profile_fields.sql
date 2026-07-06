-- ============================================================
-- 051: Add coach profile fields + seed Loren & Rachel bios
-- ============================================================

-- 1) Add columns (idempotent)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_slug TEXT;

-- Unique index on profile_slug (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_profile_slug
  ON profiles (profile_slug) WHERE profile_slug IS NOT NULL;

-- 2) Seed Loren Bagley's coach profile
UPDATE profiles
SET
  bio = 'Since 2018, Loren has been developing athletes through individualized and group performance training with a specialized focus on core strength, speed, power, and game-specific skill execution in basketball and soccer. His approach goes beyond drills — he builds complete athletes. With a deep understanding of performance mechanics and sport IQ, he emphasizes disciplined execution, progressive overload, and skill refinement under game-realistic conditions. A former multi-sport varsity athlete at Hickory High School, Loren competed on nationally ranked soccer teams (Top 12 in the U.S. during 2003-04 and Top 2 in 2004-05). He continued his soccer career at Virginia Wesleyan College before playing for the Hampton Roads Piranhas PDL team. In basketball, he earned three varsity letters and tied the school record for most three-pointers in a single game. Today, Loren channels his competitive experience into developing athletes who move faster, think sharper, and perform stronger under pressure.',
  specialties = ARRAY['Basketball', 'Soccer', 'Speed & Agility', 'Strength & Power'],
  years_experience = 7,
  certifications = ARRAY['Multi-Sport Varsity Athlete', 'PDL Soccer'],
  profile_slug = 'loren-bagley'
WHERE id = '2e7f303f-8c72-4e2d-9f04-417230794eb8';

-- 3) Seed Rachel Bagley's coach profile
UPDATE profiles
SET
  bio = 'Rachel is a former collegiate softball pitcher with an impressive career at Patrick Henry Community College, where she was inducted into the Hall of Fame and helped lead her team to a Region X Championship. She continued her success at UVA Wise, competing at the Division II level and winning a conference championship. Throughout her career, Rachel earned numerous accolades including Pitcher of the Year and First & Second Team All-Conference honors every year she competed. Rachel has been coaching pitchers for over 12 years. Passionate about using her God-given abilities, she is dedicated to impacting the next generation, building confidence in young athletes, and working with players of all ages.',
  specialties = ARRAY['Softball Pitching', 'Mechanics Analysis', 'Velocity Development'],
  years_experience = 12,
  certifications = ARRAY['Hall of Fame Inductee', 'Region X Championship', 'D2 Conference Championship'],
  profile_slug = 'rachel-bagley'
WHERE id = '7b8c3887-6aa7-44e0-b54d-52b39af14bbd';
