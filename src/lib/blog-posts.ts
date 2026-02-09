export interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  thumbnail: string
  slug: string
  content: string // markdown-style content for the full article
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '5 Keys to Increasing Pitching Velocity',
    excerpt: 'Learn the proven techniques that have helped our athletes gain 3-7 MPH on their fastball in just 12 weeks. Mechanics, strength training, and recovery all play a role.',
    category: 'Pitching',
    date: '2026-02-01',
    readTime: '5 min read',
    thumbnail: '/images/psp pitcher.jpg',
    slug: 'increasing-pitching-velocity',
    content: `Velocity is king in today's game, but adding MPH to your fastball doesn't happen overnight. At PSP.Pro, we've developed a proven system that has helped our athletes gain 3-7 MPH on their fastball in just 12 weeks. Here are the five keys to our approach.

## 1. Mechanical Efficiency

The foundation of velocity is mechanics. Even the strongest arm won't reach its potential if energy is leaking through poor sequencing. We focus on:

- **Hip-to-shoulder separation**: The ability to create torque by leading with your hips while your upper body stays loaded. This is the single biggest velocity differentiator we see in our athletes.
- **Front-side block**: A firm front leg at landing converts momentum into rotational force. Think of it as the axis your body rotates around.
- **Arm path timing**: Late arm acceleration ensures maximum whip through the release point. We use video analysis to dial this in frame by frame.

## 2. Lower Body Power

Velocity starts from the ground up. Your legs generate the force that transfers through your core and out through your arm. Our program includes:

- **Weighted box jumps**: Build explosive hip extension — the same movement pattern as driving off the mound.
- **Single-leg Romanian deadlifts**: Strengthen the posterior chain (glutes, hamstrings) that powers the stride phase.
- **Lateral bounds**: Develop the lateral power that drives you toward home plate off the rubber.

We test athletes with a broad jump at intake. There's a strong correlation between broad jump distance and pitching velocity — typically 1 MPH per additional 6 inches of jump distance.

## 3. Core Rotational Strength

Your core is the transfer mechanism between lower and upper body. Without rotational strength, you lose energy in the chain. Key exercises include:

- **Medicine ball rotational throws**: The most sport-specific core exercise for pitchers. We program these 3x per week.
- **Pallof presses and anti-rotation holds**: Build stability so your core can transfer force efficiently.
- **Cable woodchops**: Full-range rotational power that mimics the pitching motion.

## 4. Arm Health & Conditioning

You can't throw hard if you're hurt. Our arm care routine is non-negotiable:

- **Jaeger band long-toss protocol**: Progressive distance throwing that builds arm strength and elasticity.
- **Shoulder tube exercises**: Target the rotator cuff and scapular stabilizers — the small muscles that keep your arm healthy.
- **Weighted ball progressions**: Carefully programmed overload/underload training to build arm speed and deceleration strength.

We monitor throwing volume closely. Every athlete logs their throws, and we cap weekly pitch counts to stay in the safe zone.

## 5. Recovery & Nutrition

Hard training without recovery is just damage. Our athletes follow a structured recovery plan:

- **Sleep**: 8-9 hours minimum. We've seen direct correlations between sleep quality and velocity gains.
- **Nutrition timing**: Protein within 30 minutes post-training, and adequate carbohydrates to fuel high-intensity work.
- **Active recovery**: Light movement on off days — walking, easy cycling, mobility work.

## The Results

Our 12-week velocity program has produced an average gain of 4.5 MPH across all athletes who complete the full protocol. Some highlights:

- High school junior: 78 → 85 MPH (+7 MPH)
- College freshman: 84 → 89 MPH (+5 MPH)
- 14U athlete: 65 → 70 MPH (+5 MPH)

Ready to add velocity? Book an assessment session and let's build your personalized plan.`,
  },
  {
    id: '2',
    title: 'The Science of Hitting: Launch Angle & Exit Velocity',
    excerpt: 'Understanding the physics behind power hitting. How launch angle and exit velocity combine to create extra-base hits and home runs.',
    category: 'Hitting',
    date: '2026-01-28',
    readTime: '6 min read',
    thumbnail: '/images/PSP Softball Athlete.jpg',
    slug: 'science-of-hitting',
    content: `The analytics revolution has transformed how we think about hitting. Two metrics stand above the rest: **exit velocity** (how hard you hit the ball) and **launch angle** (the vertical angle the ball leaves the bat). Together, they determine whether your batted ball is a weak grounder, a line drive, or a home run.

## What is Exit Velocity?

Exit velocity is the speed of the ball immediately after contact, measured in miles per hour. Here's what the numbers mean:

- **Below 80 MPH**: Weak contact — likely an out regardless of direction
- **80-90 MPH**: Moderate contact — needs good placement to be a hit
- **90-95 MPH**: Hard contact — high batting average on these balls
- **95+ MPH**: Barrel — these are the "hard hit" balls that MLB tracks. The batting average on 95+ MPH exit velo is over .500

At PSP.Pro, we measure exit velocity on every session using a Rapsodo or HitTrax system. Our goal for high school hitters is consistent 85+ MPH exit velo.

## What is Launch Angle?

Launch angle is the vertical angle at which the ball leaves the bat:

- **Below 0°**: Ground ball — generally bad outcomes unless it finds a hole
- **0-10°**: Line drive — the most productive batted ball type
- **10-25°**: The "sweet zone" — this is where extra-base hits and home runs live
- **25-35°**: Fly balls — can be productive if exit velo is high enough
- **Above 35°**: Pop-ups — almost always outs

The optimal launch angle depends on exit velocity. A 110 MPH exit velo at 30° is a home run. An 80 MPH exit velo at 30° is a routine fly out.

## The Sweet Spot: Where Power Lives

The magic happens when high exit velocity meets optimal launch angle. Here's the data:

| Exit Velo | Best Launch Angle | Expected Result |
|-----------|------------------|----------------|
| 95+ MPH | 15-25° | Extra-base hit or HR |
| 90-95 MPH | 10-20° | Hard line drive / gap hit |
| 85-90 MPH | 5-15° | Line drive single |
| Below 85 | 0-10° | Ground ball, hope for the best |

## How We Train for Exit Velocity

Exit velocity is trainable. It comes down to three factors:

### 1. Bat Speed
Bat speed is the primary driver of exit velocity. We train it through:
- **Overload/underload bat training**: Swinging bats 20% heavier and 20% lighter than game weight
- **Rotational power exercises**: Medicine ball throws, cable rotations
- **Hip-lead swing mechanics**: Generating power from the ground up

### 2. Barrel Precision
Hitting the ball on the sweet spot of the bat can add 10+ MPH of exit velocity compared to contact off the end or handle. We use tee work and front toss drills focused on consistent barrel contact.

### 3. Approach Adjustments
Understanding the strike zone and hunting pitches you can drive is just as important as physical ability. We work on pitch recognition and zone discipline through training progressions.

## How We Train Launch Angle

Launch angle is a function of swing path. Common adjustments:

- **Slight uppercut swing path**: Matching the downward plane of the pitch (pitches arrive on a 6-8° downward angle, so a slight upswing is actually "level" to the pitch)
- **Staying through the ball**: Rather than chopping down or rolling over, staying behind the ball longer produces better angles
- **Tee height drills**: Working on balls at different heights to understand how swing path changes

## Your Action Plan

1. Get your baseline exit velocity measured (we do this at every assessment)
2. Focus on bat speed training 3x per week
3. Work on barrel precision with focused tee sessions
4. Review your launch angle data after each training session

The data doesn't lie — hitters who optimize both exit velocity and launch angle see dramatic improvements in their extra-base hit rate.`,
  },
  {
    id: '3',
    title: 'Arm Care Routine Every Pitcher Should Follow',
    excerpt: 'Prevent injury and maintain peak performance with this comprehensive arm care routine. Includes exercises, stretches, and recovery protocols.',
    category: 'Recovery',
    date: '2026-01-25',
    readTime: '8 min read',
    thumbnail: '/images/coach rachel psp.jpg',
    slug: 'arm-care-routine',
    content: `Arm injuries are the number one career threat for pitchers at every level. The good news? Most arm injuries are preventable with a consistent arm care routine. At PSP.Pro, arm care isn't optional — it's built into every training session.

## The Pre-Throwing Routine (15 minutes)

Do this before every throwing session, bullpen, or game.

### Phase 1: Foam Rolling (3 minutes)
- **Thoracic spine**: 10 rolls up and down, focusing on the upper back
- **Lats**: 10 rolls each side
- **Forearm flexors/extensors**: 10 rolls each side

### Phase 2: Band Work (5 minutes)
Using a light resistance band:
1. **External rotation at 90°**: 2 x 15 reps each arm
2. **Internal rotation at 90°**: 2 x 15 reps each arm
3. **Band pull-aparts**: 2 x 20 reps
4. **Overhead band distraction**: Hold 30 seconds each side
5. **Scapular retractions**: 2 x 15 reps

### Phase 3: Arm Circles & Dynamic Stretching (4 minutes)
1. Small arm circles forward: 20 reps
2. Small arm circles backward: 20 reps
3. Large arm circles forward: 15 reps
4. Large arm circles backward: 15 reps
5. Cross-body shoulder stretch: Hold 15 seconds each side
6. Sleeper stretch: Hold 15 seconds each side

### Phase 4: Progressive Throwing (3 minutes)
Start at 30 feet with easy catches and progressively increase distance and intensity over 10-15 throws until you reach your working distance.

## The Post-Throwing Routine (10 minutes)

Immediately after your last throw:

### Cool-Down Throws
- 5-10 easy catches at 30-40 feet to let the arm decelerate gradually
- Never end a session with your hardest throw

### Ice or Contrast (5 minutes)
- **Ice**: 15-20 minutes on the shoulder and elbow if you threw 50+ pitches
- **Contrast therapy**: Alternate between ice (2 min) and heat (2 min) for 3 cycles

### Static Stretching (5 minutes)
1. Cross-body shoulder stretch: Hold 30 seconds each side
2. Sleeper stretch: Hold 30 seconds each side
3. Doorframe pec stretch: Hold 30 seconds each side
4. Wrist flexor stretch: Hold 30 seconds each side
5. Wrist extensor stretch: Hold 30 seconds each side

## Weekly Maintenance Exercises

These should be done 3x per week on non-throwing days:

### Rotator Cuff Strengthening
- **Side-lying external rotation**: 3 x 15 with 2-5 lb dumbbell
- **Prone Y-T-W raises**: 3 x 10 each position
- **Standing external rotation with cable**: 3 x 12 each arm

### Scapular Stabilization
- **Wall slides**: 3 x 12
- **Push-up plus**: 3 x 15
- **Serratus punches**: 3 x 12 each side

### Forearm & Wrist
- **Wrist curls**: 3 x 15
- **Reverse wrist curls**: 3 x 15
- **Rice bucket exercises**: 2 minutes each hand

## Red Flags: When to Stop Throwing

Stop immediately and see a professional if you experience:
- Sharp pain in the elbow (inside or outside)
- Pain in the shoulder during or after throwing
- Numbness or tingling in the fingers
- Loss of velocity with no mechanical explanation
- Pain that persists more than 48 hours after throwing

## The Bottom Line

Arm care isn't glamorous, but it's the foundation that allows you to train hard and compete at your best. The 25 minutes per day you invest in this routine can save you months of rehabilitation — or worse, surgery.

Every PSP.Pro athlete gets a personalized arm care protocol based on their age, throwing volume, and injury history. Book an assessment to get yours.`,
  },
  {
    id: '4',
    title: 'Speed Training: First Step Quickness Drills',
    excerpt: 'Steal more bases and beat out ground balls with improved first-step explosiveness. These drills will transform your speed on the basepaths.',
    category: 'Speed & Agility',
    date: '2026-01-22',
    readTime: '5 min read',
    thumbnail: '/images/Praticing Soccer Drills.jpg',
    slug: 'speed-training-drills',
    content: `In softball and competitive sports, the difference between safe and out — or beating your defender — often comes down to a fraction of a second. Your first step — that initial explosive movement — is the most trainable aspect of speed, and it has the biggest impact on the field and court.

## Why First Step Matters More Than Top Speed

Here's a reality check: most game plays happen within 10-30 feet. You rarely reach top speed in a game situation. What matters is:

- **Reaction time**: How fast you process the stimulus (pitch hit, pitcher's first move)
- **First step explosiveness**: How quickly you can accelerate from a standstill
- **Directional change**: How efficiently you can redirect your momentum

A player with an average 60-yard dash but elite first-step quickness will outperform a "fast" player with slow reactions and poor acceleration every time.

## The 6 Best First-Step Drills

### 1. Lateral Start Sprints
**Setup**: Athletic stance, feet shoulder-width apart
**Execution**: On command, take a lateral crossover step and sprint 10 yards
**Reps**: 4 each direction
**Why it works**: Mimics the first move on a stolen base or fielding a ball in the gap

### 2. Falling Starts
**Setup**: Stand tall on your toes, lean forward until you're about to fall
**Execution**: As you start to fall, explode into a 15-yard sprint
**Reps**: 6 total
**Why it works**: Teaches you to convert potential energy into kinetic energy — the same thing happening when you break from first base

### 3. Medicine Ball Start Throws
**Setup**: Athletic stance with a 6-8 lb medicine ball at your chest
**Execution**: Throw the ball forward explosively, then sprint past where it lands
**Reps**: 5 total
**Why it works**: The throwing motion activates your posterior chain before the sprint, teaching full-body explosion

### 4. Reactive Cone Drills
**Setup**: 4 cones in a diamond pattern, 5 yards apart
**Execution**: Partner points to a cone, you sprint to it and back to center
**Reps**: 3 sets of 8 commands
**Why it works**: Adds a cognitive component — you have to process and react, just like in a game

### 5. Band-Resisted Starts
**Setup**: Resistance band around waist, partner holding the other end
**Execution**: Explode forward against band resistance for 5 yards, then partner releases
**Reps**: 4 total
**Why it works**: Overloads the acceleration phase, making unresisted sprints feel faster

### 6. Drop Step & Go
**Setup**: Athletic stance facing forward
**Execution**: On command ("left" or "right"), drop step in that direction and sprint 10 yards on a 45° angle
**Reps**: 3 each direction
**Why it works**: Critical for outfielders reacting to balls hit over their head, and for baserunners reading the ball off the bat

## Programming These Drills

For maximum benefit, follow this weekly schedule:

| Day | Focus | Volume |
|-----|-------|--------|
| Monday | Lateral starts + Reactive cones | 15 min |
| Wednesday | Falling starts + Band sprints | 12 min |
| Friday | Med ball starts + Drop step | 12 min |

**Key principles**:
- Always do speed work FIRST in your training session, when you're fresh
- Full recovery between reps (30-60 seconds per 10 yards sprinted)
- Quality over quantity — stop when form breaks down
- Track your times to measure improvement

## Expected Results

Athletes who follow this program consistently for 6-8 weeks typically see:
- 0.1-0.2 second improvement in home-to-first time
- 15-20% improvement in reaction time tests
- Noticeably quicker jumps on stolen bases
- Better range in the field

Speed is a skill, and your first step is the most important part of it. Train it intentionally and you'll see results on the field.`,
  },
  {
    id: '5',
    title: 'Nutrition for Peak Athletic Performance',
    excerpt: 'What you eat directly impacts your training results. Learn the nutrition strategies our athletes use to fuel performance and recovery.',
    category: 'Nutrition',
    date: '2026-01-19',
    readTime: '7 min read',
    thumbnail: '/images/Top View Soccer Traing.jpg',
    slug: 'nutrition-for-athletes',
    content: `You can have the best training program in the world, but if your nutrition isn't dialed in, you're leaving performance on the table. At PSP.Pro, we see nutrition as the fourth pillar of athletic development — alongside mechanics, strength, and recovery.

## The Basics: Macronutrients for Athletes

### Protein — The Builder
Protein repairs muscle damage from training and builds new muscle tissue. Athletes need more than the average person.

**How much**: 0.7-1.0 grams per pound of body weight daily
- 150 lb athlete = 105-150g protein/day
- 180 lb athlete = 126-180g protein/day

**Best sources**: Chicken, fish, eggs, Greek yogurt, lean beef, whey protein

**Timing matters**: Aim for 25-40g protein within 30 minutes after training. This is the window when your muscles are most receptive to repair.

### Carbohydrates — The Fuel
Carbs are your body's preferred energy source for high-intensity activity. Cutting carbs is one of the worst things an athlete can do.

**How much**: 2-3 grams per pound of body weight on training days
- 150 lb athlete = 300-450g carbs on training days

**Best sources**: Rice, oats, sweet potatoes, whole grain pasta, fruits, bread

**Timing**: Load up on carbs 2-3 hours before training and replenish immediately after.

### Fats — The Foundation
Healthy fats support hormone production (including testosterone, which drives muscle growth), brain function, and joint health.

**How much**: 0.4-0.5 grams per pound of body weight
**Best sources**: Avocado, nuts, olive oil, salmon, eggs

## Game Day Nutrition

What you eat on game day directly affects your performance. Here's our recommended timeline:

### 3-4 Hours Before Game
A full meal with all three macronutrients:
- Grilled chicken with rice and vegetables
- Turkey sandwich on whole grain with a banana
- Pasta with meat sauce and a side salad

### 1-2 Hours Before Game
A lighter snack focused on carbs:
- Granola bar and a banana
- PB&J sandwich
- Oatmeal with berries

### During the Game
Stay fueled and hydrated:
- Water between every inning
- Sports drink if the game is 2+ hours or it's hot
- Light snack (granola bar, fruit) between at-bats if needed

### After the Game
Recovery nutrition within 30 minutes:
- Protein shake with a banana
- Chocolate milk (seriously — it's one of the best recovery drinks)
- Turkey wrap with fruit

## Hydration: The Most Overlooked Factor

Dehydration of just 2% body weight can reduce performance by 10-20%. That's the difference between an 85 MPH fastball and a 78 MPH one.

**Daily target**: Half your body weight in ounces of water
- 150 lb athlete = 75 oz (about 9 cups) minimum
- More on training days and in hot weather

**Signs of dehydration**:
- Dark urine
- Headache during or after training
- Decreased performance
- Muscle cramps

## What to Avoid

- **Energy drinks before games**: The sugar crash will kill your performance in late innings
- **Heavy meals within 2 hours of training**: Blood flow goes to digestion instead of muscles
- **Skipping meals**: Your body needs consistent fuel to train hard and recover
- **Excessive supplements**: Food first, supplements to fill gaps only

## Sample Day of Eating (150 lb Athlete)

| Meal | Food | Macros |
|------|------|--------|
| Breakfast (7am) | 3 eggs, 2 toast, banana, OJ | 30g P / 60g C / 15g F |
| Snack (10am) | Greek yogurt + granola | 20g P / 35g C / 5g F |
| Lunch (12pm) | Chicken, rice, veggies | 40g P / 60g C / 10g F |
| Pre-training (3pm) | PB&J + apple | 10g P / 50g C / 10g F |
| Post-training (5:30pm) | Protein shake + banana | 30g P / 40g C / 5g F |
| Dinner (7pm) | Salmon, sweet potato, salad | 35g P / 50g C / 15g F |
| Evening snack | Cottage cheese + berries | 15g P / 15g C / 5g F |
| **Daily Total** | | **180g P / 310g C / 65g F** |

This adds up to about 2,545 calories — appropriate for a 150 lb athlete in active training.

## The Bottom Line

Nutrition doesn't have to be complicated. Eat real food, eat enough of it, time it around your training, and stay hydrated. These four principles alone will put you ahead of 90% of your competition.

Want a personalized nutrition plan? Our coaches can help build one that fits your schedule, preferences, and performance goals.`,
  },
  {
    id: '6',
    title: 'Mental Game: Building Confidence at the Plate',
    excerpt: 'The mental side of hitting is just as important as mechanics. Develop the mindset that separates good hitters from great ones.',
    category: 'Mental Game',
    date: '2026-01-15',
    readTime: '6 min read',
    thumbnail: '/images/Costal At Bat.jpg',
    slug: 'mental-game-hitting',
    content: `Ask any hitting coach what separates a .250 hitter from a .300 hitter, and mechanics will only be part of the answer. The mental game — confidence, focus, approach, and resilience — is often the bigger differentiator.

## The Confidence Paradox

Here's the paradox of hitting: you need confidence to hit well, but you need to hit well to feel confident. How do you break the cycle?

The answer is that **confidence doesn't come from results — it comes from preparation**. When you step into the box knowing you've put in the work, knowing your mechanics are sound, and knowing your approach is solid, confidence follows naturally. You're not hoping for a hit — you're expecting one.

## The Three Pillars of a Confident At-Bat

### 1. Having a Plan

The best hitters in the world have a plan before every at-bat. They know:

- **What zone they're hunting**: In an 0-0 count, where is the pitch they can drive? Identify your "A zone" (the area where you do the most damage) and look there first.
- **What pitch they're expecting**: Based on the pitcher's tendencies, what's the most likely pitch in this count?
- **What they'll do with each count**: Ahead in the count? Be aggressive. Behind? Widen the zone slightly.

Having a plan removes indecision. Indecision creates hesitation. Hesitation kills bat speed.

### 2. Controlling What You Can Control

You cannot control:
- What the pitcher throws
- What the umpire calls
- Whether the wind knocks down your drive
- Whether the shortstop makes a diving play

You CAN control:
- Your preparation
- Your effort
- Your swing decisions
- Your body language
- How you respond to failure

Elite hitters focus exclusively on what they can control. Everything else is noise.

### 3. Embracing the Process

Hitting is the hardest thing to do in sports. Even the best hitters fail 7 out of 10 times. If you judge yourself by individual at-bats, you'll go crazy.

Instead, evaluate yourself on **process goals**:
- Did I execute my approach?
- Did I swing at pitches in my zone?
- Did I compete with two strikes?
- Did I make hard contact?

If the answers are yes, you had a good at-bat — regardless of the result.

## Mental Techniques We Teach

### Pre-At-Bat Visualization (30 seconds)
Before you step in, close your eyes and see yourself executing your best swing. See the pitch, see the barrel meet the ball, see the ball jumping off the bat. This primes your brain for success.

### The Reset Breath
Between pitches, step out and take one deep breath. Inhale for 3 seconds, exhale for 5 seconds. This activates your parasympathetic nervous system and keeps you calm under pressure.

### The Positive Self-Talk Loop
Replace negative thoughts with positive, instructional ones:
- Instead of "Don't strike out" → "See the ball, drive the ball"
- Instead of "I always struggle against lefties" → "Stay back, wait for my pitch"
- Instead of "I'm in a slump" → "I'm one good swing away"

### The Flush Technique
Bad at-bat? Physically "flush" it. Some hitters touch the dirt as they leave the box. Others adjust their helmet. Whatever your trigger, make it a conscious act of releasing that at-bat and moving on.

## Building Confidence Through Practice

Confidence in games comes from confidence in practice. Here's how to build it:

1. **End practice on a good note**: Always finish your last round of BP with your best swings. Walk away feeling good.
2. **Track your hard-hit rate, not your batting average**: Hard contact is within your control. Results aren't.
3. **Compete in practice**: Use situational hitting drills where you have to execute under pressure.
4. **Celebrate small wins**: Hit a line drive in BP? Acknowledge it. These small deposits build your confidence account.

## What to Do in a Slump

Every hitter slumps. What separates the great ones is how quickly they recover. Here's our slump-busting protocol:

1. **Go back to basics**: Tee work, soft toss, focus on feel and timing
2. **Watch video of your best at-bats**: Remind your brain what success looks like
3. **Simplify your approach**: Look for one pitch, one zone. Remove complexity.
4. **Get uncomfortable**: Change something small — batting gloves, stance width, pre-pitch routine. Sometimes a small change breaks the mental pattern.
5. **Talk to your coach**: An outside perspective can identify something you can't see.

## The Bottom Line

The mental game isn't soft. It's the competitive edge that separates good hitters from great ones. Train your mind with the same discipline you train your body, and you'll see the results in your performance.

At PSP.Pro, mental performance training is integrated into every session. We don't just teach you how to swing — we teach you how to compete.`,
  },
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(post => post.slug === slug)
}

export const CATEGORIES = ['All', ...Array.from(new Set(BLOG_POSTS.map(post => post.category)))]
