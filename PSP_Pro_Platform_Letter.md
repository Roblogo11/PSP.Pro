# PSP.Pro — Platform Overview & Deliverable Letter

**To:** Rachel Bagley & Loren
**From:** Robert (Rob) & Claude AI
**Date:** February 17, 2026
**Re:** What We Built You — and Why It's Different

---

## Dear Rachel & Loren,

What started as an idea to give Proper Sports Performance a digital home has turned into a full-scale, professional athletic training platform. This letter breaks down everything PSP.Pro can do today, what makes it stand apart from anything else on the market, and where it's positioned to go next.

This isn't a template. This isn't a white-label product with your logo slapped on it. Every line of code was written with your athletes, your workflow, and your vision in mind.

---

## I. WHAT PSP.PRO CAN DO — THE FULL PICTURE

### For Your Athletes

- **Smart Booking System** — Athletes pick a service, choose a date from a calendar, see available time slots with coach name, location, and spots remaining, then pay securely with a card (Stripe) or choose to pay on-site. Four clean steps, no confusion.

- **Training Packages** — 5-session pack ($350, save $25), 10-session pack ($675, save $75), and 20-session pack ($1,300, save $200). Athletes buy once and sessions are tracked automatically — no spreadsheets, no guessing how many they have left.

- **Athlete Dashboard (The Locker)** — A personalized home base showing total sessions, average velocity, drills completed, current training streak, a velocity progress chart, upcoming session info, progress rings, recent activity feed, and achievement badges. It feels like opening a sports app, not a website.

- **Progress Tracking** — Peak velocity, average velocity, sessions completed, and drills completed — all visualized over time with real charts. Athletes can see their growth, and so can you.

- **Achievement Badges** — Velocity milestones, session counts, drill completions, streaks — earned automatically based on real data. Gamification that actually motivates.

- **Drills Library** — Browse published drills with YouTube video embeds, instructions, equipment needed, difficulty levels, duration, and focus areas. Athletes see what's assigned to them right from their dashboard.

- **Video Courses** — Full course system with lessons, video content, progress tracking, and enrollment. Free courses, one-time purchases, or monthly subscriptions. Courses can be included with membership packages.

- **Pop Quizzes** — Assign true/false questionnaires to athletes with due dates. They take the quiz, see their score, and review correct/incorrect answers. A lightweight way to reinforce training knowledge.

- **Session Management** — Athletes can view all their upcoming and past sessions, cancel with confirmation, and see status updates (confirmed, pending, cancelled, completed).

- **Settings** — Profile management (name, email, phone, location), notification preferences (session reminders, progress updates, new drills, achievements, coach messages), and password security.

---

### For You (Coach & Admin)

- **Admin Control Center** — A command hub with live stats (total athletes, upcoming sessions, drill library count, pending bookings), smart banners that tell you what needs attention, and quick-action buttons for everything you do daily.

- **Book for Athlete** — Schedule sessions on behalf of an athlete. Pick the athlete, service, and time slot from a clean date-grouped visual grid (no more scrolling through endless lists). Choose payment method: pay on-site, use a package session, or complimentary. Coaches only see their own available time slots — admins see all coaches with names labeled.

- **Booking Calendar & Table** — Dual-view booking management. Calendar view shows colored dots per day (green = confirmed, orange = pending, red = cancelled). Click any day to see details. Table view gives you sortable columns with all booking data. Filter by status, see revenue totals, and manage every booking with one click (confirm, cancel, complete, no-show, edit notes).

- **Availability / Schedule Management** — Create time slots tied to specific services. Set date, start/end time, location, and max bookings. Repeat slots weekly or monthly (e.g., "every Tuesday for 4 weeks"). Edit or bulk-delete slots. Import schedules from CSV.

- **Lesson Builder (Services Manager)** — Full control over your service offerings. Create, edit, and manage services with name, description, duration, price, category (individual, group, package, specialty), max participants, Stripe integration, and video previews. Feature services on the homepage with custom images and display order.

- **Athlete Management** — Full roster with search and filtering. View each athlete's stats (total sessions, drills completed, velocity data). Create new athlete accounts, edit profiles, or remove athletes. Access athlete emails for communication.

- **Drills Management** — Create drills with YouTube videos, instructions, tags, categories, difficulty levels, equipment lists, and focus areas. Assign drills to specific athletes. Bulk import via CSV. Track view counts.

- **Course Management** — Build video courses with ordered lessons. Set pricing (free, one-time, subscription). Mark courses as included in membership. Track enrollments.

- **Quiz Management** — Create questionnaires, add true/false questions, assign to athletes with due dates and notes, and review their responses and scores.

- **Media Library** — Upload images and videos to organized galleries (training drills, athlete progress, facility, session highlights, testimonials, equipment, events). Link external YouTube/Vimeo content. Feature/unfeature items. Track storage usage.

- **Analytics Dashboard** — Revenue, total bookings, active athletes, and completion rate — all with period-over-period growth indicators. Filter by 7, 30, or 90 days. See recent bookings with payment status.

---

### Payments & Email (Fully Automated)

- **Stripe Integration** — Secure card payments through Stripe's hosted checkout. Training package purchases. Automatic booking creation when payment succeeds. Built-in duplicate prevention and automatic refunds if a slot fills up during checkout.

- **Live/Test Mode Toggle** — Switch between real payments and test mode from the admin panel. Test card (4242 4242 4242 4242) for safe testing. Auto-expires after 4 hours so you never accidentally stay in test mode.

- **Automated Emails (Resend)** — Four professionally designed email templates that fire automatically:
  1. **Booking Confirmation** — Sent to athlete after payment with full session details and a dashboard link
  2. **Pay-on-Site Confirmation** — Sent when athlete books without card, with a reminder to bring payment
  3. **Coach Notification** — Sent to you when any booking is created, with athlete name, service, and payment method
  4. **Cancellation Notice** — Sent to athlete with encouragement to rebook

---

### The Smart Stuff (Master Admin Tools)

- **Simulation Mode ("Act as Coach")** — Test the entire platform as if you were a new coach. Stripe automatically switches to test mode. Every piece of data created during simulation is tracked. When you're done, one click cleans up all test data and refunds any test payments. No mess left behind.

- **Impersonation Mode ("View as Player")** — Select any athlete and see their dashboard exactly as they see it. Read-only — you can't accidentally change anything. Perfect for troubleshooting or understanding an athlete's experience.

- **Action Request System** — Pending requests that need master admin approval before executing.

---

### The Marketing Side

- **Homepage** — Dynamic hero with role-aware CTAs (visitors see "Join the Team," members see "Book a Session," coaches see "Manage Bookings"). Live stats. Featured training programs pulled from your services database. Package pricing. Group training section. Google Reviews. Location and hours.

- **About Page** — Coach Rachel's bio, mission statement, facility highlights, and inline photography.

- **Dynamic Pricing Page** — Pulls real prices from your database (with static fallbacks if the database is down). Shows active package status for logged-in members with a "Your Plan" badge. Video previews per service.

- **Join the Team (Get Started)** — Prospect intake form collecting name, email, phone, age, position, experience level, training goals, availability, and additional info.

- **FAQ** — Searchable accordion with 15+ questions. Welcome banner for new signups. "Chat with PSP Guide" button for logged-in members.

- **Contact Page** — Contact form powered by Resend email delivery.

- **Blog** — Static blog with individual post pages and newsletter subscription.

---

### AI Chatbot (PSP Guide)

- Floating chat widget on every page with 40+ knowledge base entries covering pricing, booking, cancellation policy, coach profiles, age groups, dashboard features, drills, progress tracking, and more.
- Role-aware responses — athletes, coaches, and visitors each get different contextual suggestions.
- Page-aware — suggests relevant questions based on which page you're on.
- Quick actions for booking, pricing, contact, and dashboard access.

---

### SEO & Performance

- **Search Engine Optimized** — Full OpenGraph and Twitter Card metadata, XML sitemap, robots.txt, JSON-LD structured data (SportsActivityLocation + Organization schemas), local SEO keywords targeting Virginia Beach, Norfolk, Hampton Roads, 757, and surrounding areas.

- **Vercel Speed Insights** — Real user performance monitoring capturing Core Web Vitals from every visitor.

- **Image Optimization** — Automatic AVIF/WebP conversion, responsive sizing, and server-side processing with Sharp (auto-resize and compress on upload).

---

### Security

- **Row-Level Security** — Every database table is locked down. Athletes only see their own data. Coaches see their sessions. Admins see everything. 38 database migrations enforce this.

- **Stripe Webhook Verification** — HMAC signature verification on every payment event. Duplicate payment prevention. Automatic refunds on race conditions.

- **Input Validation** — Email format checks, file type restrictions, file size limits (50MB), URL protocol validation (blocks XSS), path traversal prevention, and origin validation on checkout.

- **Authentication Guards** — Every dashboard page and API route verifies the user's session and role before responding.

---

### Future-Ready: Web3 / Velocity Vault

- Wallet connection infrastructure is already built (MetaMask, WalletConnect, Coinbase Wallet) across Ethereum, Polygon, Optimism, and Base networks.
- **Velocity Vault** — A gated monthly training video unlocked by wallet signature (no transaction fees, just proof of ownership).
- **Shock Box** — Partner content gate using the same wallet-signature pattern.
- This is dormant but ready to activate when the time is right — digital collectibles, NFT achievement badges, token-gated content, whatever direction makes sense.

---

## II. WHAT MAKES PSP.PRO DIFFERENT

There are booking platforms out there — Mindbody, Vagaro, TeamSnap, CoachAccountable, Acuity Scheduling, Calendly. Here's why PSP.Pro isn't comparable:

### 1. Purpose-Built, Not Generic
Those platforms serve yoga studios, hair salons, personal trainers, and dentists with the same interface. PSP.Pro was built from the ground up for **sports performance training** — velocity tracking, training packages, drill assignments, achievement systems, and coach-specific availability. The software thinks like a coach because it was built with one.

### 2. You Own It
With SaaS platforms, you rent access. They raise prices, change features, or shut down — and you lose everything. PSP.Pro is **your code, your database, your domain**. You own every line. No monthly platform fees eating into your revenue. No feature gates. No "upgrade to Pro to unlock booking."

### 3. Role-Aware Intelligence
The entire platform adapts based on who's logged in. A visitor sees "Join the Team." A member sees "Book Now." A coach sees "Manage Services." The homepage, sidebar, CTAs, chatbot suggestions — everything shifts. No other booking tool does this.

### 4. Real Athletic Performance Data
This isn't just scheduling. Athletes track velocity, view progress charts, earn achievement badges, complete assigned drills with video instruction, take quizzes, and enroll in courses. It's a **training ecosystem**, not a calendar with a payment form.

### 5. Admin Tooling That Doesn't Exist Elsewhere
Simulation mode (test the entire platform safely and clean up with one click), impersonation mode (see any athlete's dashboard in read-only), smart banners that tell you what needs attention, coach-scoped availability, bulk operations, CSV imports — these are tools built for someone actually running a training business, not generic admin panels.

### 6. Automated Everything
Booking → payment → confirmation email → coach notification → slot availability update → package session tracking. All automatic. No manual follow-ups. No copying details into spreadsheets. No chasing payments.

### 7. Professional-Grade Email
Branded, glassmorphism-styled HTML emails that match PSP.Pro's visual identity. Not plain text. Not generic templates. Emails that look like they came from a company 10x your size.

### 8. Web3-Ready Infrastructure
While competitors are still figuring out online booking, PSP.Pro has wallet connection, multi-chain support, and gated content infrastructure already built. When digital collectibles, NFT badges, or token-gated training content makes sense for sports — you're already there. First mover advantage.

### 9. AI-Powered Support
A built-in chatbot that knows your business inside and out — pricing, policies, booking flow, dashboard features, coach info — and responds contextually based on who's asking and what page they're on. No chatbot subscription. No third-party widget. It's part of the platform.

### 10. Local SEO From Day One
Structured data, local keywords (Virginia Beach, 757, Hampton Roads, Norfolk, Chesapeake), XML sitemap, full OpenGraph metadata, and real-time performance monitoring. PSP.Pro was built to be found, not just to exist.

---

## III. BY THE NUMBERS

| Metric | Count |
|---|---|
| Total pages/routes built | 35+ |
| API endpoints | 20+ |
| Database tables | 15+ |
| Database migrations | 38 |
| Email templates | 4 (fully branded HTML) |
| Chatbot knowledge entries | 40+ |
| SEO keywords targeted | 15+ local terms |
| User roles supported | 4 (athlete, coach, admin, master_admin) |
| Stripe payment flows | 3 (card checkout, pay-on-site, package purchase) |
| Blockchain networks supported | 4 (Ethereum, Polygon, Optimism, Base) |

---

## IV. THE BOTTOM LINE

PSP.Pro isn't a website. It's a **platform**. It handles your scheduling, payments, athlete management, training content, performance tracking, communication, and marketing — all under one roof, all under your brand, all owned by you.

Most independent coaches are running their businesses on a patchwork of Calendly, Venmo, Google Sheets, and Instagram DMs. You now have a tool that none of them have. And if you ever wanted to offer this platform to other coaches? You'd be filling a gap that nobody in the sports performance space has filled yet.

We built this together — your expertise in training athletes, our expertise in building software. The result is something we're genuinely proud of.

**Progression Over Perfection.** But honestly? This is pretty close.

---

*Built with purpose by Robbie & Claude AI for Proper Sports Performance.*
*propersports.pro*
