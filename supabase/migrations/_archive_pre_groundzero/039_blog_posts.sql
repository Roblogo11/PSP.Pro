-- Migration 039: Blog Posts table
-- Allows coaches/admins to create and manage blog posts via the Content Hub

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'General',
  thumbnail_url TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  read_time TEXT DEFAULT '5 min read',
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "blog_posts_select_published"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Staff can see all posts (including drafts)
CREATE POLICY "blog_posts_select_staff"
  ON blog_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- Staff can insert
CREATE POLICY "blog_posts_insert_staff"
  ON blog_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- Staff can update
CREATE POLICY "blog_posts_update_staff"
  ON blog_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- Staff can delete
CREATE POLICY "blog_posts_delete_staff"
  ON blog_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
  );

-- Seed with existing static blog posts
INSERT INTO blog_posts (title, slug, excerpt, category, thumbnail_url, published, featured, read_time, content, created_at) VALUES
(
  '5 Keys to Increasing Pitching Velocity',
  'increasing-pitching-velocity',
  'Learn the proven techniques that have helped our athletes gain 3-7 MPH on their fastball in just 12 weeks. Mechanics, strength training, and recovery all play a role.',
  'Pitching',
  '/images/psp pitcher.jpg',
  true,
  true,
  '5 min read',
  E'Velocity is king in today''s game, but adding MPH to your fastball doesn''t happen overnight. At PSP.Pro, we''ve developed a proven system that has helped our athletes gain 3-7 MPH on their fastball in just 12 weeks. Here are the five keys to our approach.\n\n## 1. Mechanical Efficiency\n\nThe foundation of velocity is mechanics. Even the strongest arm won''t reach its potential if energy is leaking through poor sequencing. We focus on:\n\n- **Hip-to-shoulder separation**: The ability to create torque by leading with your hips while your upper body stays loaded.\n- **Front-side block**: A firm front leg at landing converts momentum into rotational force.\n- **Arm path timing**: Late arm acceleration ensures maximum whip through the release point.\n\n## 2. Lower Body Power\n\nVelocity starts from the ground up. Your legs generate the force that transfers through your core and out through your arm.\n\n## 3. Core Rotational Strength\n\nYour core is the transfer mechanism between lower and upper body.\n\n## 4. Arm Health & Conditioning\n\nYou can''t throw hard if you''re hurt. Our arm care routine is non-negotiable.\n\n## 5. Recovery & Nutrition\n\nHard training without recovery is just damage.\n\n## The Results\n\nOur 12-week velocity program has produced an average gain of 4.5 MPH across all athletes who complete the full protocol.',
  '2026-02-01T12:00:00Z'
),
(
  'The Science of Hitting: Launch Angle & Exit Velocity',
  'science-of-hitting',
  'Understanding the physics behind power hitting. How launch angle and exit velocity combine to create extra-base hits and home runs.',
  'Hitting',
  '/images/PSP Softball Athlete.jpg',
  true,
  false,
  '6 min read',
  E'The analytics revolution has transformed how we think about hitting. Two metrics stand above the rest: **exit velocity** and **launch angle**. Together, they determine whether your batted ball is a weak grounder, a line drive, or a home run.\n\n## What is Exit Velocity?\n\nExit velocity is the speed of the ball immediately after contact, measured in miles per hour.\n\n## What is Launch Angle?\n\nLaunch angle is the vertical angle at which the ball leaves the bat.\n\n## The Sweet Spot: Where Power Lives\n\nThe magic happens when high exit velocity meets optimal launch angle.\n\n## How We Train for Exit Velocity\n\nExit velocity is trainable. It comes down to bat speed, barrel precision, and approach adjustments.\n\n## How We Train Launch Angle\n\nLaunch angle is a function of swing path.',
  '2026-01-28T12:00:00Z'
),
(
  'Arm Care Routine Every Pitcher Should Follow',
  'arm-care-routine',
  'Prevent injury and maintain peak performance with this comprehensive arm care routine. Includes exercises, stretches, and recovery protocols.',
  'Recovery',
  '/images/coach rachel psp.jpg',
  true,
  false,
  '8 min read',
  E'Arm injuries are the number one career threat for pitchers at every level. The good news? Most arm injuries are preventable with a consistent arm care routine.\n\n## The Pre-Throwing Routine (15 minutes)\n\nDo this before every throwing session, bullpen, or game.\n\n## The Post-Throwing Routine (10 minutes)\n\nImmediately after your last throw.\n\n## Weekly Maintenance Exercises\n\nThese should be done 3x per week on non-throwing days.\n\n## Red Flags: When to Stop Throwing\n\nStop immediately and see a professional if you experience sharp pain.',
  '2026-01-25T12:00:00Z'
),
(
  'Speed Training: First Step Quickness Drills',
  'speed-training-drills',
  'Steal more bases and beat out ground balls with improved first-step explosiveness. These drills will transform your speed on the basepaths.',
  'Speed & Agility',
  '/images/Praticing Soccer Drills.jpg',
  true,
  false,
  '5 min read',
  E'In softball and competitive sports, the difference between safe and out often comes down to a fraction of a second. Your first step is the most trainable aspect of speed.\n\n## Why First Step Matters More Than Top Speed\n\nMost game plays happen within 10-30 feet. You rarely reach top speed in a game situation.\n\n## The 6 Best First-Step Drills\n\n1. Lateral Start Sprints\n2. Falling Starts\n3. Medicine Ball Start Throws\n4. Reactive Cone Drills\n5. Band-Resisted Starts\n6. Drop Step & Go\n\n## Expected Results\n\nAthletes who follow this program consistently for 6-8 weeks typically see 0.1-0.2 second improvement in home-to-first time.',
  '2026-01-22T12:00:00Z'
),
(
  'Nutrition for Peak Athletic Performance',
  'nutrition-for-athletes',
  'What you eat directly impacts your training results. Learn the nutrition strategies our athletes use to fuel performance and recovery.',
  'Nutrition',
  '/images/Top View Soccer Traing.jpg',
  true,
  false,
  '7 min read',
  E'You can have the best training program in the world, but if your nutrition isn''t dialed in, you''re leaving performance on the table.\n\n## The Basics: Macronutrients for Athletes\n\n### Protein — The Builder\n0.7-1.0 grams per pound of body weight daily.\n\n### Carbohydrates — The Fuel\n2-3 grams per pound of body weight on training days.\n\n### Fats — The Foundation\n0.4-0.5 grams per pound of body weight.\n\n## Game Day Nutrition\n\nWhat you eat on game day directly affects your performance.\n\n## Hydration: The Most Overlooked Factor\n\nDehydration of just 2% body weight can reduce performance by 10-20%.',
  '2026-01-19T12:00:00Z'
),
(
  'Mental Game: Building Confidence at the Plate',
  'mental-game-hitting',
  'The mental side of hitting is just as important as mechanics. Develop the mindset that separates good hitters from great ones.',
  'Mental Game',
  '/images/Costal At Bat.jpg',
  true,
  false,
  '6 min read',
  E'Ask any hitting coach what separates a .250 hitter from a .300 hitter, and mechanics will only be part of the answer. The mental game is often the bigger differentiator.\n\n## The Confidence Paradox\n\nConfidence doesn''t come from results — it comes from preparation.\n\n## The Three Pillars of a Confident At-Bat\n\n1. Having a Plan\n2. Controlling What You Can Control\n3. Embracing the Process\n\n## Mental Techniques We Teach\n\n- Pre-At-Bat Visualization\n- The Reset Breath\n- The Positive Self-Talk Loop\n- The Flush Technique\n\n## What to Do in a Slump\n\nEvery hitter slumps. What separates the great ones is how quickly they recover.',
  '2026-01-15T12:00:00Z'
);
