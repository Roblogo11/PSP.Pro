# PSP.Pro Content Cheat Sheet

> Quick reference for changing text, prices, stats, and content across the site.
> No coding experience needed — just find the file, change the text, save.

---

## PRICING

**File:** `src/app/pricing/page.tsx`

| What | Line | Current Value |
|------|------|--------------|
| 1-on-1 Pitching | ~50 | $75 / 60 min |
| 1-on-1 Hitting | ~69 | $75 / 60 min |
| Group Speed & Agility | ~97 | $50 / 90 min |
| Video Analysis | ~211 | $50 / 30 min |
| Recovery & Mobility | ~226 | $45 / 45 min |
| 5-Session Pack | ~138 | $350 (save $25) |
| 10-Session Pack | ~145 | $675 (save $75) |
| 20-Session Pack | ~153 | $1,300 (save $200) |

**Database prices:** `supabase/seed-services.sql` (prices in cents, e.g. 7500 = $75)

---

## HOMEPAGE

**File:** `src/app/page.tsx`

| What | Lines | Notes |
|------|-------|-------|
| Hero tagline | ~115 | "Progression Over Perfection" |
| Hero headline | ~120-124 | "Train Like a Pro..." |
| CTA buttons | ~132-145 | "Start Training" / "Access PSP.Pro" |
| Quick stats | ~197-200 | 500+ Athletes, +5 MPH, 100+ Drills, 95% |
| Features section | ~228-283 | Velocity Tracking, Drill Bank, Personalized Training |
| Training programs | ~298-373 | Starter $99, Athlete $199, Elite $349 |
| Location/hours | ~376-399 | Virginia Beach info |
| Footer | ~420-460 | Links, contact, copyright |

---

## BLOG POSTS

**File:** `src/app/blog/page.tsx` (lines 18-79)

6 posts — each has: title, excerpt, category, date, readTime, thumbnail URL, slug.
Just edit the array to add/remove/change posts.

---

## FAQ QUESTIONS

**File:** `src/app/faq/page.tsx` (lines 15-112)

16 questions across 6 categories:
- Getting Started (2)
- Sessions & Scheduling (3)
- Pricing & Packages (3)
- Training Programs (3)
- Facility & Equipment (3)
- Parents & Guardians (2)

Each has: question, answer, category. Add/remove from the array.

---

## GOOGLE REVIEWS

**File:** `src/components/google-reviews.tsx` (lines 16-59)

6 reviews — each has: name, rating (1-5), text, date.

---

## TESTIMONIALS

**File:** `src/components/testimonials.tsx` (lines 21-77)

5 testimonials with before/after stats. Each has: name, role, sport, quote, stats.

---

## CONTACT INFO

**File:** `src/app/contact/page.tsx`

| What | Line | Current Value |
|------|------|--------------|
| Address | ~80-83 | Virginia Beach, VA / Hampton Roads |
| Email | ~93 | info@propersports.pro |
| Phone | ~107 | (757) 123-4567 |
| Mon-Fri hours | ~120 | 3PM - 9PM |
| Saturday hours | ~124 | 9AM - 5PM |
| Sunday | ~128 | Closed |

Also in: `src/config/site.ts` (~line 105-109)

---

## DASHBOARD STATS

**File:** `src/app/(dashboard)/locker/page.tsx`

| What | Lines | Notes |
|------|-------|-------|
| Quick stat cards | ~58-85 | 4 cards: Sessions, Velocity, Drills, Streak |
| Progress rings | ~114-127 | Drills complete %, Goal progress |

---

## ACHIEVEMENT BADGES

**File:** `src/components/dashboard/achievement-badges.tsx` (lines 30-90)

6 badges:
1. First Steps — Complete first drill (Common)
2. Velocity Hunter — 10 velocity measurements (Rare)
3. Dedicated Athlete — 25 drills (Epic)
4. Speed Demon — 80 MPH (Epic)
5. Century Club — 100 drills (Legendary)
6. Elite Performance — 90 MPH (Legendary)

---

## NAVIGATION

| Sidebar | File | Lines |
|---------|------|-------|
| Public pages (info) | `src/components/layout/info-sidebar.tsx` | 26-34 |
| Athlete dashboard | `src/components/layout/sidebar.tsx` | 37-45 |
| Admin dashboard | `src/components/layout/sidebar.tsx` | 47-55 |
| Route config | `src/config/navigation.ts` | 2-19 |

---

## SPORTS & POSITIONS

**File:** `src/app/(dashboard)/admin/athletes/create/page.tsx` (lines 173-197)

Current options: Softball, Basketball, Soccer

**Position options in:** `src/app/get-started/page.tsx` (~line 132)
- Pitcher, Catcher, Infield, Outfield

---

## HOW TO MAKE CHANGES

1. Open the file in VS Code (or any text editor)
2. Find the text you want to change
3. Edit it and save
4. The dev server auto-reloads — check localhost:3000
5. When happy, commit and push to deploy

**For new database fields** (tracking new stats):
1. Add column in Supabase Dashboard → Table Editor
2. Update the form component to include the new field
3. Update the display component to show it
