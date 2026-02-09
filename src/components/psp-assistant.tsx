'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────
interface KBEntry {
  keywords: string[]
  title: string
  response: string
  actions: { label: string; href: string }[]
  followUp?: string[]
}

// ─── Quick Actions ───────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Book a Session', href: '/booking' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'My Dashboard', href: '/locker' },
]

// ─── Contextual Suggestions (based on current page) ─────────
const PAGE_SUGGESTIONS: Record<string, { label: string; query: string }[]> = {
  '/': [
    { label: 'How do I get started?', query: 'how do I get started' },
    { label: 'What sports do you train?', query: 'what sports' },
    { label: 'Tell me about pricing', query: 'pricing' },
  ],
  '/pricing': [
    { label: 'What packages save me money?', query: 'packages' },
    { label: 'Walk me through this page', query: 'walk me through the pricing page' },
    { label: 'How do I book?', query: 'how to book' },
  ],
  '/about': [
    { label: 'Who are the coaches?', query: 'coaches' },
    { label: 'What makes PSP different?', query: 'what makes PSP different' },
    { label: 'How do I sign up?', query: 'sign up' },
  ],
  '/booking': [
    { label: 'Walk me through booking', query: 'walk me through booking' },
    { label: 'What sessions are available?', query: 'what sessions' },
    { label: 'Can I cancel or reschedule?', query: 'cancel reschedule' },
  ],
  '/locker': [
    { label: 'What is this dashboard?', query: 'walk me through the dashboard' },
    { label: 'How do I track progress?', query: 'progress tracking' },
    { label: 'Where are my drills?', query: 'drills' },
  ],
  '/drills': [
    { label: 'How do drills work?', query: 'how do drills work' },
    { label: 'How do I complete a drill?', query: 'mark drill complete' },
    { label: 'Who assigns my drills?', query: 'assigned drills' },
  ],
  '/sessions': [
    { label: 'How do I cancel a session?', query: 'cancel session' },
    { label: 'Where are my upcoming sessions?', query: 'upcoming sessions' },
    { label: 'Can I reschedule?', query: 'reschedule' },
  ],
  '/progress': [
    { label: 'What do these stats mean?', query: 'walk me through progress' },
    { label: 'How is velocity tracked?', query: 'velocity tracking' },
    { label: 'What are milestones?', query: 'milestones achievements' },
  ],
  '/achievements': [
    { label: 'How do I unlock achievements?', query: 'how to unlock achievements' },
    { label: 'What are all the badges?', query: 'achievement badges' },
  ],
  '/settings': [
    { label: 'How do I change my email?', query: 'change email' },
    { label: 'What can I update here?', query: 'walk me through settings' },
  ],
  '/admin': [
    { label: 'Walk me through the admin panel', query: 'walk me through admin' },
    { label: 'How do I add an athlete?', query: 'add athlete' },
    { label: 'How do I manage bookings?', query: 'manage bookings' },
  ],
  '/blog': [
    { label: 'What topics do you cover?', query: 'blog topics' },
    { label: 'Training tips?', query: 'training tips' },
  ],
  '/faq': [
    { label: 'Parent/guardian questions', query: 'parent guardian' },
    { label: 'Cancellation policy?', query: 'cancel refund policy' },
    { label: 'How do memberships work?', query: 'membership required' },
  ],
  '/get-started': [
    { label: 'Walk me through this form', query: 'walk me through get started' },
    { label: 'Do I need an account?', query: 'sign up account' },
    { label: 'Already a member?', query: 'login' },
  ],
  '/signup': [
    { label: 'What info do I need?', query: 'walk me through signup' },
    { label: 'Under 18 — what do I need?', query: 'under 18 parent guardian' },
  ],
  '/login': [
    { label: 'Forgot my password', query: 'forgot password' },
    { label: 'How do I create an account?', query: 'sign up' },
  ],
  '/contact': [
    { label: 'Where are you located?', query: 'location hours' },
    { label: 'How quickly do you respond?', query: 'contact response time' },
  ],
  '/membership-required': [
    { label: 'What plans are available?', query: 'pricing' },
    { label: 'How do memberships work?', query: 'membership required' },
    { label: 'Talk to someone', query: 'contact' },
  ],
}

// ─── Comprehensive Knowledge Base ────────────────────────────
const KNOWLEDGE_BASE: KBEntry[] = [
  // ── GENERAL / SITE OVERVIEW ──
  {
    keywords: ['what is psp', 'what is this', 'tell me about', 'about psp', 'about this site', 'overview', 'what do you do'],
    title: 'Welcome to PSP.Pro',
    response: 'PSP.Pro (ProPer Sports Performance) is a complete athletic training platform based in Virginia Beach, VA.\n\nWe offer:\n• 1-on-1 coaching sessions\n• Group training classes\n• Video analysis & specialty services\n• A full athlete dashboard with drills, progress tracking, achievements & more\n\nOur motto: "Progression Over Perfection"\n\nWe train softball, basketball, and soccer athletes of all ages and skill levels.',
    actions: [{ label: 'About Us', href: '/about' }, { label: 'View Pricing', href: '/pricing' }],
    followUp: ['What sports do you train?', 'How do I sign up?', 'What does the dashboard do?'],
  },
  {
    keywords: ['what makes', 'why psp', 'why choose', 'different', 'unique', 'special'],
    title: 'What Makes PSP Different',
    response: 'What sets us apart:\n\n• Data-driven training — real velocity tracking, progress analytics, and performance charts\n• Full digital platform — your own athlete dashboard with drills, sessions, achievements\n• Multi-sport expertise — softball (our specialty), basketball, and soccer\n• Personalized coaching — programs tailored to your age, position, and goals\n• Community-first — we believe in progression over perfection\n\nOur coaches have college/pro experience and use science-based methodologies.',
    actions: [{ label: 'Meet Our Coaches', href: '/about' }, { label: 'Join the Team', href: '/get-started' }],
  },

  // ── SPORTS ──
  {
    keywords: ['sport', 'softball', 'basketball', 'soccer', 'what sports', 'what do you train', 'which sports'],
    title: 'Sports We Train',
    response: 'We specialize in three sports:\n\n🥎 Softball (our biggest program!)\n• Pitching mechanics & velocity\n• Hitting development\n• Fielding & game strategy\n• Speed training\n\n🏀 Basketball\n• Speed & agility\n• Vertical leap development\n• Court movement\n• Strength & conditioning\n\n⚽ Soccer\n• Speed & endurance\n• Agility & footwork\n• Strength training\n• Game performance\n\nYou can select multiple sports when you sign up!',
    actions: [{ label: 'Join the Team', href: '/get-started' }, { label: 'Learn More', href: '/about' }],
  },

  // ── PRICING ──
  {
    keywords: ['pricing', 'cost', 'price', 'how much', 'rate', 'session cost', 'expensive', 'affordable', 'money', 'pay'],
    title: 'Training Pricing',
    response: 'Our training options:\n\n1-on-1 Sessions:\n• Skills Training: $75 / 60 min\n• Performance Training: $75 / 60 min\n\nGroup Sessions:\n• Speed & Agility: $50 / 90 min\n• Small Group: $40 / 75 min\n• Strength & Conditioning: $65 / 60 min\n\nSession Packages (best value):\n• 5-Pack: $350 (save $25)\n• 10-Pack: $675 (save $75)\n• 20-Pack: $1,300 (save $200)\n\nAll prices are pulled live from our system — check the Pricing page for the most current rates.',
    actions: [{ label: 'View Full Pricing', href: '/pricing' }, { label: 'Book Now', href: '/booking' }],
    followUp: ['Tell me about packages', 'How do I book a session?'],
  },

  // ── PACKAGES ──
  {
    keywords: ['package', 'deal', 'discount', 'bundle', 'save', 'pack', '5 pack', '10 pack', '20 pack'],
    title: 'Training Packages',
    response: 'Save big with session packages:\n\n📦 5-Session Pack — $350\n• Save $25 off individual pricing\n• Valid for 90 days\n\n📦 10-Session Pack — $675\n• Save $75 off individual pricing\n• Valid for 180 days\n\n📦 20-Session Pack — $1,300\n• Save $200 off individual pricing\n• Valid for 365 days\n• Our best value!\n\nPackages are non-refundable but can be paused for injury. All sessions must be used within the validity period.',
    actions: [{ label: 'View Packages', href: '/pricing' }, { label: 'Book Now', href: '/booking' }],
  },

  // ── MEMBERSHIP ──
  {
    keywords: ['membership', 'monthly', 'subscribe', 'unlimited', 'subscription', 'membership required', 'access denied', 'cant access dashboard', 'locked out'],
    title: 'Memberships & Access',
    response: 'To access the full training dashboard, you need an active membership or session package.\n\nMonthly Membership — $60/mo:\n• Unlimited group session access\n• Discounted 1-on-1 sessions\n• Priority scheduling\n• Full PSP.Pro dashboard access\n• Progress tracking & analytics\n\nSession Packages also unlock dashboard access:\n• 5-Pack: $350 (valid 90 days)\n• 10-Pack: $675 (valid 180 days)\n• 20-Pack: $1,300 (valid 365 days)\n\nWithout an active plan, you\'ll see the "Membership Required" page instead of the dashboard. Coaches and admins always have full access.\n\nVisit the Pricing page to choose a plan!',
    actions: [{ label: 'View Pricing', href: '/pricing' }, { label: 'Contact Us', href: '/contact' }],
  },

  // ── BOOKING ──
  {
    keywords: ['book', 'schedule', 'appointment', 'reserve', 'buy lesson', 'how to book', 'buy', 'lesson'],
    title: 'How to Book a Session',
    response: 'Booking is a simple 4-step process:\n\n1️⃣ Choose your training type\nPick from 1-on-1, group, or specialty sessions\n\n2️⃣ Select your date\nUse the calendar to pick a training day\n\n3️⃣ Pick a time slot\nSee available coaches and times\n\n4️⃣ Confirm & pay\nReview your booking and pay securely via Stripe\n\nAfter booking, you\'ll get a confirmation email and the session appears on your dashboard.\n\nAvailability: Mon-Fri 3PM-9PM, Sat 9AM-5PM',
    actions: [{ label: 'Book Now', href: '/booking' }],
    followUp: ['Can I cancel or reschedule?', 'What payment methods do you accept?'],
  },

  // ── BOOKING WALKTHROUGH ──
  {
    keywords: ['walk me through booking', 'booking page', 'booking walkthrough', 'how does booking work'],
    title: 'Booking Page Walkthrough',
    response: 'Here\'s how the Booking page works:\n\nStep 1 — Service Selection\nYou\'ll see all active training services in a grid. Each card shows the name, price, duration, and description. Click one to select it.\n\nStep 2 — Date Selection\nA calendar appears. Pick any date from today forward. Unavailable dates are grayed out.\n\nStep 3 — Time Slot\nAvailable time slots show up with the coach name and location. Pick one that works.\n\nStep 4 — Confirmation\nReview everything: service, date, time, coach, and total price. Hit "Confirm & Pay" to go to Stripe\'s secure checkout.\n\nAfter payment, you\'re redirected to a success page with your confirmation ID. You\'ll also get an email.',
    actions: [{ label: 'Start Booking', href: '/booking' }],
  },

  // ── CANCELLATION / RESCHEDULING ──
  {
    keywords: ['cancel', 'refund', 'reschedule', 'change session', 'move session', 'cancellation policy'],
    title: 'Cancellations & Rescheduling',
    response: 'Our cancellation policy:\n\n• 24+ hours in advance → Full session credit\n• Less than 24 hours → Session forfeited\n\nHow to cancel or reschedule:\n1. Go to "My Sessions" from your dashboard\n2. Find the upcoming session you want to change\n3. Click "Cancel" or "Reschedule"\n4. Confirm in the popup\n\nCoaches can also reschedule from their Confirm Appointments panel.\n\nFor refund questions, reach out via the Contact page.',
    actions: [{ label: 'My Sessions', href: '/sessions' }, { label: 'Contact Us', href: '/contact' }],
  },

  // ── PAYMENT ──
  {
    keywords: ['payment', 'stripe', 'credit card', 'pay', 'checkout', 'payment method'],
    title: 'Payment Information',
    response: 'We use Stripe for secure payment processing.\n\n• Credit/debit cards accepted\n• Payment is collected at time of booking\n• All transactions are encrypted and secure\n• Receipts are emailed automatically\n\nAfter checkout, you\'re redirected to a confirmation page. Your booking shows up immediately on your dashboard.',
    actions: [{ label: 'Book a Session', href: '/booking' }],
  },

  // ── LOCATION & HOURS ──
  {
    keywords: ['location', 'where', 'address', 'facility', 'virginia beach', '757', 'hours', 'open', 'close', 'when'],
    title: 'Location & Hours',
    response: 'We\'re located in Virginia Beach, VA — serving the entire Hampton Roads / 757 area including Norfolk, Chesapeake, Hampton, and Newport News.\n\nTraining Hours:\n• Monday-Friday: 3:00 PM - 9:00 PM\n• Saturday: 9:00 AM - 5:00 PM\n• Sunday: Closed\n\nOur facility features modern training equipment, video analysis systems, and dedicated space for athlete development.',
    actions: [{ label: 'Get Directions', href: '/contact' }],
  },

  // ── COACHES ──
  {
    keywords: ['coach', 'trainer', 'instructor', 'staff', 'rachel', 'who teaches', 'coaching'],
    title: 'Our Coaching Team',
    response: 'Our coaches bring real experience to every session:\n\n• College and/or pro playing experience\n• Certified training credentials\n• Data analysis and video review expertise\n• Proven track record developing athletes\n\nCoach Rachel Bagley leads our softball program — she\'s our head coach specializing in pitching mechanics, hitting development, and athletic performance across softball, basketball, and soccer.\n\nYou\'ll be matched with the best coach for your sport and goals!',
    actions: [{ label: 'About Us', href: '/about' }, { label: 'Join the Team', href: '/get-started' }],
  },

  // ── AGE GROUPS ──
  {
    keywords: ['age', 'how old', 'youth', 'kid', 'teenager', 'child', 'young', 'adult', 'age group', 'minor'],
    title: 'Age Groups',
    response: 'We train athletes of all ages:\n\n• Youth: Ages 8-12\n• Middle School: Ages 13-14\n• High School: Ages 15-18\n• College & Adult\n\nPrograms are customized for each age and skill level.\n\nImportant for athletes under 18:\nDuring signup, you\'ll need to provide parent/guardian info (name, email, and phone number). This is required for all minors.',
    actions: [{ label: 'Sign Up', href: '/signup' }],
    followUp: ['What if I\'m under 18?', 'Tell me about parent guardian info'],
  },

  // ── PARENT / GUARDIAN ──
  {
    keywords: ['parent', 'guardian', 'under 18', 'minor', 'mom', 'dad', 'my kid', 'my child', 'son', 'daughter'],
    title: 'Parents & Guardians',
    response: 'For athletes under 18, we require parent/guardian information:\n\n• Parent/Guardian full name\n• Parent/Guardian email\n• Parent/Guardian phone number\n\nThis is collected during signup and can be updated in Settings.\n\nAs a parent, you\'ll love our platform:\n• See every session, drill, and progress report\n• Track velocity improvements over time\n• Achievement badges keep young athletes motivated\n• Full transparency into coaching activities\n\nWe take safety seriously — all training follows proper protocols.',
    actions: [{ label: 'Sign Up', href: '/signup' }, { label: 'Contact Us', href: '/contact' }],
  },

  // ── VELOCITY TRAINING ──
  {
    keywords: ['velocity', 'throwing', 'mph', 'velo', 'pitching', 'speed training', 'fast', 'faster'],
    title: 'Velocity & Speed Training',
    response: 'Our velocity development program:\n\n• Mechanics optimization using video analysis\n• Power generation through targeted strength work\n• Arm health & conditioning protocols\n• Data-driven progress tracking (we chart every session)\n\nAverage velocity gains: 3-7 MPH in 12 weeks!\n\nYour dashboard tracks velocity over time with charts so you can see your improvement. We also set milestone goals (hit 60 MPH, 70 MPH, etc.) that unlock achievement badges.',
    actions: [{ label: 'Join the Team', href: '/get-started' }, { label: 'View Progress', href: '/progress' }],
  },

  // ── SIGNUP ──
  {
    keywords: ['sign up', 'signup', 'create account', 'register', 'join', 'new account', 'get started'],
    title: 'How to Sign Up',
    response: 'Here\'s the full process to join PSP.Pro:\n\n1️⃣ Start at "Join the Team" (/get-started)\nFill out the prospect form with your info, goals, and sport preferences. This helps us match you with the right coach.\n\n2️⃣ Create your account (/signup)\nAfter submitting the form, you\'ll be directed to create your login. Enter your name, email, password (8+ chars), sports, and age. Under 18? Provide parent/guardian info.\n\n3️⃣ Land on the FAQ page\nAfter signup you\'ll see a welcome banner with links to view memberships and access your dashboard.\n\n4️⃣ Purchase a membership or package\nVisit the Pricing page to pick a plan. You need an active membership or package to access the full training dashboard.\n\n5️⃣ Start training!\nOnce you have a package, your Athlete Locker unlocks with drills, sessions, progress tracking, and more.',
    actions: [{ label: 'Join the Team', href: '/get-started' }, { label: 'Sign Up', href: '/signup' }],
    followUp: ['What if I\'m under 18?', 'What does the dashboard do?', 'Tell me about pricing'],
  },

  // ── SIGNUP WALKTHROUGH ──
  {
    keywords: ['walk me through signup', 'signup page', 'signup walkthrough'],
    title: 'Signup Page Walkthrough',
    response: 'The Signup page has these fields:\n\n• Full Name — your real name\n• Email Address — used for login and notifications\n• Password — minimum 8 characters\n• Sports — checkboxes for Softball, Basketball, Soccer (select all that apply, at least 1 required)\n• Age — your current age\n• Parent/Guardian Info — appears automatically if your age is under 18 (name, email, phone required)\n• Terms checkbox — agree to Terms of Service & Privacy Policy\n\nOnce you submit, your account is created and you\'re logged in immediately. You\'ll land on the FAQ page with a welcome banner that links to Pricing (to purchase a plan) and your Dashboard.\n\nNote: You need a membership or package to access the training dashboard — without one you\'ll be redirected to the Membership Required page.',
    actions: [{ label: 'Go to Signup', href: '/signup' }],
  },

  // ── LOGIN ──
  {
    keywords: ['login', 'log in', 'sign in', 'signin', 'access', 'can\'t login', 'cant login', 'password wrong'],
    title: 'Login Help',
    response: 'To log in:\n\n1. Go to the Login page\n2. Enter your email and password\n3. Click "Sign In"\n\nAfter login:\n• Athletes → Athlete Locker (/locker) — requires active membership/package\n• Coaches/Admins → Admin Panel (/admin)\n\nTrouble logging in?\n• Check your email spelling\n• Password is case-sensitive\n• Use "Forgot Password?" to reset\n• If your account was created by a coach, you may need to set a password first via the reset flow\n\nNew here? Start with "Join the Team" at /get-started — it\'s the onboarding form for new prospects. Once you create an account and purchase a plan, you can log in to access everything.',
    actions: [{ label: 'Login', href: '/login' }, { label: 'Forgot Password', href: '/forgot-password' }, { label: 'Join the Team', href: '/get-started' }],
  },

  // ── FORGOT PASSWORD ──
  {
    keywords: ['forgot password', 'reset password', 'lost password', 'change password', 'password reset'],
    title: 'Password Reset',
    response: 'To reset your password:\n\n1. Go to the Forgot Password page\n2. Enter your email address\n3. Click "Send Reset Link"\n4. Check your email for a reset link\n5. Click the link — you\'ll be taken to a page to set a new password\n6. Enter your new password (min 8 characters) and confirm it\n7. You\'ll be redirected to the login page\n\nThe reset link expires — if it doesn\'t work, request a new one.',
    actions: [{ label: 'Reset Password', href: '/forgot-password' }],
  },

  // ── DASHBOARD / LOCKER ──
  {
    keywords: ['dashboard', 'locker', 'my account', 'my profile', 'athlete locker', 'home dashboard'],
    title: 'Your Athlete Locker',
    response: 'The Athlete Locker is your personal dashboard — it adapts to your role:\n\n🏅 Athletes see:\n• Quick Stats — total sessions, avg velocity, drills completed, streak\n• Velocity Chart — your velocity trend over time\n• Next Session — upcoming booked session\n• Assigned Drills — coach-assigned training videos\n• Achievements — badges you\'ve earned\n• Recent Activity — last sessions and completed drills\n• Game Stats Review — log and review game performance\n\n🧑‍🏫 Coaches/Admins see:\n• Quick Stats — total athletes, upcoming sessions, drills in library, pending bookings\n• Upcoming Sessions — next 4 sessions with athlete names and status\n• Quick Links — fast access to Athletes, Bookings, Drills, Analytics, Media, Settings\n• Link to full Admin Panel for complete control\n\nAll data updates in real-time!',
    actions: [{ label: 'Go to Dashboard', href: '/locker' }],
    followUp: ['How do drills work?', 'What are achievements?', 'How do I book a session?'],
  },

  // ── DASHBOARD WALKTHROUGH ──
  {
    keywords: ['walk me through the dashboard', 'walk me through locker', 'dashboard walkthrough', 'locker walkthrough'],
    title: 'Dashboard Walkthrough',
    response: 'Your dashboard adapts to your role:\n\nAthletes:\nTop — Welcome + 4 stat cards: total sessions, avg velocity, drills done, and training streak.\nMiddle — Velocity chart (left) + next session details (right).\nBelow — Progress rings, recent activity feed.\nFurther — Achievement badges and game stats review.\nBottom — Up to 6 assigned drills with video thumbnails.\n\nCoaches/Admins:\nTop — Welcome + 4 stat cards: athletes, upcoming sessions, drills, pending bookings.\nMiddle — Next 4 upcoming sessions with athlete names, service type, date/time, and status.\nBottom — Quick links grid (Athletes, Bookings, Drills, Analytics, Media, Settings) + link to full Admin Panel.\n\nUse the sidebar to navigate — it shows different options based on your role.',
    actions: [{ label: 'Go to Dashboard', href: '/locker' }],
  },

  // ── DRILLS ──
  {
    keywords: ['drill', 'drills', 'training video', 'exercise', 'workout', 'membership training', 'video', 'assigned drill'],
    title: 'Membership Training',
    response: 'Membership Training is your training video library:\n\n• Browse all published drills with search and filters\n• Filter by difficulty (beginner, intermediate, advanced)\n• Filter by category (mechanics, speed, power, etc.)\n• Each drill has a video, description, duration, and difficulty badge\n\nHow drills work:\n1. Your coach assigns drills to you (they show up on your dashboard)\n2. Click a drill to open it\n3. Watch the embedded YouTube video\n4. Click "Mark Complete" when you\'re done\n5. Your completion count updates your stats and achievements\n\nYour progress is tracked — coaches can see what you\'ve completed!',
    actions: [{ label: 'View Drills', href: '/drills' }],
    followUp: ['How do I complete a drill?', 'What are achievements?'],
  },

  // ── HOW DO DRILLS WORK ──
  {
    keywords: ['how do drills work', 'mark drill complete', 'complete drill', 'drill complete'],
    title: 'Completing Drills',
    response: 'Here\'s the drill completion flow:\n\n1. Open any drill from Membership Training or your Assigned Drills on the dashboard\n2. You\'ll see the drill page with:\n   • Embedded video player (YouTube)\n   • Title, description, and instructions\n   • Category, difficulty, and duration info\n3. Watch the video and practice the drill\n4. Click the "Mark Complete" button\n5. Your completion count increments\n6. It updates your dashboard stats and progress toward achievement badges\n\nYou can complete the same drill multiple times — each completion is tracked!',
    actions: [{ label: 'Go to Drills', href: '/drills' }],
  },

  // ── SESSIONS ──
  {
    keywords: ['session', 'sessions', 'my sessions', 'upcoming', 'past sessions', 'session history', 'training session'],
    title: 'My Sessions',
    response: 'The Sessions page shows all your training sessions:\n\nFilter by:\n• All Sessions\n• Upcoming (future bookings)\n• Past (completed sessions)\n\nEach session card shows:\n• Coach name and photo\n• Session type and service\n• Date, time, and location\n• Peak velocity (if recorded)\n• Coach notes\n• Status badge (upcoming, completed, cancelled)\n\nFor upcoming sessions you can:\n• Cancel (with 24hr policy)\n• Reschedule (redirects to booking)\n\nCompleted sessions show your performance data from that session.',
    actions: [{ label: 'View Sessions', href: '/sessions' }],
  },

  // ── PROGRESS ──
  {
    keywords: ['progress', 'stats', 'analytics', 'improvement', 'tracking', 'how am i doing', 'velocity chart'],
    title: 'Progress Tracking',
    response: 'Your Progress page shows your athletic development:\n\n📊 Stats Cards\n• Peak Velocity (your all-time max)\n• Average Velocity\n• Sessions Completed\n• Drills Completed\n\n📈 Velocity Progress Chart\nA line graph showing your velocity trend over time, with your goal line shown for reference.\n\n🏆 Milestones Timeline\nA visual timeline showing achieved and upcoming milestones:\n• First session, 5 sessions, 10, 25, 50, 100\n• Drill milestones: 10, 25, 50 drills completed\n• Velocity milestones: 60 MPH, 70 MPH\n• Streak milestones: 3-day streak, 7-day streak\n\nAll data is calculated from your real training sessions.',
    actions: [{ label: 'View Progress', href: '/progress' }],
  },

  // ── PROGRESS WALKTHROUGH ──
  {
    keywords: ['walk me through progress', 'progress walkthrough', 'progress page'],
    title: 'Progress Page Walkthrough',
    response: 'Here\'s what you see on the Progress page:\n\nTop — 4 stat cards showing your Peak Velocity, Average Velocity, Sessions Completed, and Drills Completed.\n\nMiddle — Velocity Progress Chart. This is a line graph plotting your velocity from each session over time. A dashed goal line shows your target. Hover over data points to see exact readings.\n\nBottom — Milestones Timeline. This is a vertical timeline with dots. Green dots = achieved milestones, gray = still working on them. Milestones include session counts (5, 10, 25, 50, 100), drill counts (10, 25, 50), velocity targets (60, 70 MPH), and training streaks (3, 7 days).\n\nEverything is calculated from your actual training data — no manual entry needed!',
    actions: [{ label: 'View Progress', href: '/progress' }],
  },

  // ── ACHIEVEMENTS ──
  {
    keywords: ['achievement', 'achievements', 'badges', 'badge', 'unlock', 'reward', 'gamification', 'points'],
    title: 'Achievements & Badges',
    response: 'Earn badges as you train! 9 achievements to unlock:\n\n🏅 First Session — Complete your first training session\n🏅 Drill Starter — Complete 10 drills\n🏅 Drill Collector — Complete 50 drills\n🔥 On Fire — Maintain a 3-day training streak\n🔥 Streak Master — Maintain a 7-day streak\n📅 Getting Started — Complete 5 sessions\n📅 Dedicated Athlete — Complete 25 sessions\n⚡ Velocity: 60 MPH — Reach 60 MPH throwing velocity\n⚡ Velocity: 70 MPH — Reach 70 MPH throwing velocity\n\nEach badge shows a progress bar so you can see how close you are. Points are earned for each unlock (10 pts each).',
    actions: [{ label: 'View Achievements', href: '/achievements' }],
  },

  // ── SETTINGS ──
  {
    keywords: ['settings', 'account', 'notification', 'edit profile', 'change email', 'update profile', 'preferences'],
    title: 'Account Settings',
    response: 'Your Settings page has 4 tabs:\n\n👤 Profile\n• Update your full name, email, phone, and location\n• Note: changing email requires re-verification\n\n🔔 Notifications\n• Toggle session reminders, progress updates, new drill alerts, achievement notifications, and coach messages\n\n🔐 Security\n• Password management (coming soon)\n\n💳 Billing\n• Subscription management (coming soon)\n• Contact support for billing questions\n\nChanges save immediately when you click the Save button.',
    actions: [{ label: 'Go to Settings', href: '/settings' }],
  },

  // ── SETTINGS WALKTHROUGH ──
  {
    keywords: ['walk me through settings', 'settings walkthrough', 'settings page'],
    title: 'Settings Walkthrough',
    response: 'The Settings page has tabs across the top:\n\nProfile Tab — Edit your name, email, phone, and location. Click "Save Changes" when done. Email changes require verification.\n\nNotifications Tab — Toggle switches for: Session Reminders, Progress Updates, New Drills Assigned, Achievement Unlocked, Coach Messages. Click "Save Preferences."\n\nSecurity Tab — Password reset and advanced security options (coming soon).\n\nBilling Tab — Subscription management (coming soon). For billing questions, contact support.',
    actions: [{ label: 'Go to Settings', href: '/settings' }],
  },

  // ── ADMIN PANEL ──
  {
    keywords: ['admin', 'coach dashboard', 'manage athletes', 'coach view', 'admin panel', 'coach panel'],
    title: 'Coach/Admin Dashboard',
    response: 'The Admin panel is your coaching command center:\n\n📊 Quick Stats — Active athletes, upcoming sessions, total drills, pending bookings\n\n🏋️ Core Tools:\n• Athletes — View, create, edit, delete athlete profiles\n• Bookings — Confirm, cancel, or complete bookings\n• Drills — Create drills, import from YouTube, assign to athletes\n• Services — Manage training types, pricing, and descriptions\n• Availability — Set your coaching schedule and time slots\n• Analytics — View performance data and trends\n\n💰 Stripe Settings (Admin only):\n• Toggle test/live payment mode\n• View payment status\n\nCoaches see only their athletes and sessions. Admins see everything.',
    actions: [{ label: 'Go to Admin', href: '/admin' }],
    followUp: ['How do I add an athlete?', 'How do I manage bookings?', 'How do I create drills?'],
  },

  // ── ADMIN WALKTHROUGH ──
  {
    keywords: ['walk me through admin', 'admin walkthrough', 'admin page'],
    title: 'Admin Panel Walkthrough',
    response: 'The Admin Control Center layout:\n\nTop — Welcome banner with quick start tips and your name.\n\nStats Row — 4 cards: Total Athletes, Upcoming Sessions, Training Drills, Pending Bookings (shows notification badge if any pending).\n\nUpcoming Sessions — List of your next 5 sessions with athlete name, date, time, and status.\n\nQuick Actions — 4 cards: Create Drill, Schedule Session, Add Athlete, Upload Video.\n\nPlatform Management — 6 cards linking to: Athlete Management, Courses, Session Schedule, Content Library, Analytics, Platform Settings.\n\nStripe Section (admin only) — Shows test/live payment mode with toggle switch.\n\nUse the sidebar to navigate between all management pages.',
    actions: [{ label: 'Go to Admin', href: '/admin' }],
  },

  // ── ADD ATHLETE (COACH) ──
  {
    keywords: ['add athlete', 'create athlete', 'new athlete', 'register athlete'],
    title: 'Adding Athletes (Coach Tool)',
    response: 'To add an athlete:\n\n1. Go to Admin → Athletes\n2. Click "Add Athlete" button\n3. Fill in the form:\n   • Full Name (required)\n   • Email (required — used for their login)\n   • Sport dropdown\n   • Age\n   • Parent/Guardian info (if under 18)\n4. Click "Create"\n\nThe athlete gets an account with a temporary password. They can log in immediately and set their own password via the Reset Password flow.\n\nYou can also edit or delete athletes from the Athletes management page.',
    actions: [{ label: 'Athlete Management', href: '/admin/athletes' }],
  },

  // ── MANAGE BOOKINGS (COACH) ──
  {
    keywords: ['manage bookings', 'confirm booking', 'pending booking', 'booking management', 'approve booking'],
    title: 'Managing Bookings (Coach Tool)',
    response: 'The Bookings page shows all session bookings:\n\nFilter tabs: All, Pending, Confirmed, Cancelled\n\nStats row: Total Bookings, Confirmed, Pending, Revenue\n\nEach booking shows: Athlete name, service, date/time, coach, amount, payment status, booking status.\n\nActions you can take:\n• Pending → "Confirm" or "Cancel"\n• Confirmed → "Mark Complete" (after session)\n• View payment status (paid, pending, failed)\n\nCoaches see only their own bookings. Admins see all.',
    actions: [{ label: 'View Bookings', href: '/admin/bookings' }],
  },

  // ── CREATE DRILLS (COACH) ──
  {
    keywords: ['create drill', 'make drill', 'new drill', 'assign drill', 'assign course', 'import drill'],
    title: 'Creating & Assigning Drills',
    response: 'Creating drills:\n1. Go to Admin → Drills\n2. Click "Create Drill"\n3. Add title, description, YouTube video URL, category, difficulty, duration, and tags\n4. Save the drill\n\nBulk import:\n• Go to Admin → Drills → Import\n• Upload a CSV with columns: title, description, youtube_url, category, difficulty, duration, tags, equipment, focus_areas\n• Download the template for the correct format\n\nAssigning drills:\n• Go to Admin → Athletes → select an athlete\n• Click "Assign Drills" and pick from your library\n• Assigned drills show up on the athlete\'s dashboard',
    actions: [{ label: 'Drill Management', href: '/admin/drills' }],
  },

  // ── SERVICES (COACH) ──
  {
    keywords: ['service', 'services', 'manage services', 'training type', 'add service', 'edit service'],
    title: 'Managing Services',
    response: 'Services are the training types athletes book:\n\nFrom Admin → Services you can:\n• Create new services with name, description, price, duration, category, and max participants\n• Edit existing services\n• Toggle active/inactive (inactive services don\'t show on booking or pricing)\n• Link a Stripe price ID for payment processing\n\nCategories:\n• Individual — 1-on-1 sessions\n• Group — multi-athlete sessions\n• Package — session bundles (5/10/20-pack)\n• Specialty — video analysis, recovery, etc.\n\nPrices are in cents (e.g., 7500 = $75.00). These prices flow directly to the public Pricing page and the Booking page — update once, changes appear everywhere.',
    actions: [{ label: 'Manage Services', href: '/admin/services' }],
  },

  // ── AVAILABILITY (COACH) ──
  {
    keywords: ['availability', 'schedule', 'time slot', 'set hours', 'coaching hours', 'available times'],
    title: 'Setting Availability',
    response: 'From Admin → Availability, you set when you\'re available for bookings:\n\n• Select a date\n• Add time slots (start time, end time)\n• Link a service to each slot\n• Set max bookings per slot (usually 1 for 1-on-1, more for groups)\n\nAthletes will only see time slots you\'ve marked as available when they go to book. Slots are automatically marked unavailable once booked.\n\nDefault hours: Mon-Fri 3PM-9PM, Saturday 9AM-5PM.',
    actions: [{ label: 'Set Availability', href: '/admin/availability' }],
  },

  // ── PRICING PAGE WALKTHROUGH ──
  {
    keywords: ['walk me through the pricing page', 'walk me through pricing', 'pricing walkthrough', 'pricing page'],
    title: 'Pricing Page Walkthrough',
    response: 'The Pricing page is organized in sections:\n\n🔝 Quick Stats — 4 cards showing starting prices for 1-on-1, group, max package savings, and a "100% Pro Training" badge.\n\n🟠 1-on-1 Training — Cards for each individual service with name, price per session, duration, and description bullets.\n\n🔵 Group Training — Cards for group sessions showing price, duration, max participants, and description.\n\n📦 Training Packages — 5, 10, and 20-session packs showing total price, per-session cost, and savings. The middle one is marked "Most Popular."\n\n🟢 Specialty Services — Video analysis, recovery sessions, etc.\n\nSmart CTAs: Buttons adapt to who you are:\n• Not logged in → "Join the Team" (sends to /get-started)\n• Logged-in member → "Book Now" (sends to /booking)\n• Coach/Admin → "Manage Services" (sends to /admin/services)\n\nAll prices update live from the database!',
    actions: [{ label: 'View Pricing', href: '/pricing' }],
  },

  // ── GET STARTED PAGE ──
  {
    keywords: ['walk me through get started', 'get started walkthrough', 'get started page', 'onboarding', 'join the team'],
    title: 'Join the Team Page Walkthrough',
    response: 'The "Join the Team" page (/get-started) is the onboarding form for NEW prospects:\n\n• Personal Info — First name, last name, email, phone, age, primary position\n• Sports — Select softball, basketball, and/or soccer (at least 1)\n• Training Goals — Check all that apply: increase velocity, improve mechanics, build strength, enhance mobility, prevent injuries, mental performance\n• Availability — When can you train? (weekday afternoon, evening, weekend, flexible)\n• Additional Info — Free-text for anything else\n• Parent/Guardian — Auto-shows if under 18\n\nAfter submitting, you\'re directed to create your account (/signup). The form info helps us match you with the right coach and program.\n\nAlready a member? There\'s a "Log in here" link at the top if you already have an account.',
    actions: [{ label: 'Join the Team', href: '/get-started' }],
  },

  // ── BLOG ──
  {
    keywords: ['blog', 'article', 'tips', 'read', 'news', 'content', 'training tips'],
    title: 'Blog & Training Tips',
    response: 'Our blog covers topics to help you improve:\n\n• Pitching mechanics breakdowns\n• Hitting drills you can do at home\n• Speed training: first-step quickness\n• Nutrition for athletes\n• Mental game strategies\n• Injury prevention\n\nThe blog page shows a featured post at the top, followed by a grid of recent articles. Each post has a category tag, read time, and date.\n\nClick any post to read the full article with embedded images and step-by-step instructions.\n\nYou can also sign up for our newsletter at the bottom of the blog page!',
    actions: [{ label: 'Read Blog', href: '/blog' }],
  },

  // ── FAQ ──
  {
    keywords: ['faq', 'frequently asked', 'questions', 'common questions', 'help'],
    title: 'FAQ Page',
    response: 'Our FAQ page has 16 questions across 6 categories:\n\n• Getting Started — How to begin, what to expect\n• Sessions & Scheduling — Booking, cancellations, what to bring\n• Pricing & Packages — Costs, payment, package details\n• Training Programs — Sports we cover, age groups, program details\n• Facility & Equipment — Location, gear, safety\n• Parents & Guardians — Info for parents of youth athletes\n\nThe page has a search bar and category filter buttons.\n\nFor members: The FAQ page features a "Chat with Your PSP Guide" section at the top — that\'s me! Since you\'re already a member, chatting is usually faster than scrolling through FAQs.\n\nNew signups land on this page after creating their account, with a welcome banner linking to Pricing and Dashboard.',
    actions: [{ label: 'View FAQ', href: '/faq' }],
  },

  // ── CONTACT ──
  {
    keywords: ['contact', 'email', 'phone', 'reach out', 'get in touch', 'message', 'support', 'help me', 'talk to someone', 'response time'],
    title: 'Contact Us',
    response: 'Reach out to us anytime:\n\n📧 Email: info@propersports.pro\n📍 Location: Virginia Beach, VA\n⏰ Hours: Mon-Fri 3-9PM, Sat 9AM-5PM\n\nThe Contact page has a form with:\n• Name and email (required)\n• Phone number\n• Interest dropdown (1-on-1, group, assessment, packages, other)\n• Message (required)\n\nWe typically respond within 24 hours on business days. For urgent questions, showing up during training hours is always welcome!',
    actions: [{ label: 'Contact Us', href: '/contact' }],
  },

  // ── NEWSLETTER ──
  {
    keywords: ['newsletter', 'updates', 'email list', 'subscribe', 'mailing list'],
    title: 'Newsletter',
    response: 'Sign up for our newsletter at the bottom of the Blog page!\n\nEnter your email and click Subscribe. You\'ll get:\n• Training tips and articles\n• Special offers and promotions\n• New feature announcements\n• Event notifications\n\nYou can also stay updated through your PSP.Pro dashboard — all session updates and drill assignments appear there in real-time.',
    actions: [{ label: 'Visit Blog', href: '/blog' }, { label: 'Contact Us', href: '/contact' }],
  },

  // ── TERMS / PRIVACY ──
  {
    keywords: ['terms', 'privacy', 'policy', 'legal', 'waiver', 'terms of service', 'privacy policy'],
    title: 'Legal Information',
    response: 'Our legal pages:\n\n📋 Terms of Service — Covers account usage, training sessions, payment terms, 24-hour cancellation policy, package validity (90 days), liability, and Virginia state law governance.\n\n🔒 Privacy Policy — We collect name, email, phone, age, position, goals, and performance metrics. We never sell your data. You have the right to data export and deletion. COPPA compliant for athletes under 13.\n\nBoth were last updated February 2026.',
    actions: [{ label: 'Terms of Service', href: '/terms' }, { label: 'Privacy Policy', href: '/privacy' }],
  },

  // ── GOOGLE REVIEWS ──
  {
    keywords: ['review', 'reviews', 'google review', 'testimonial', 'rating', 'what do people say'],
    title: 'Reviews & Testimonials',
    response: 'Our athletes and parents love PSP.Pro!\n\nYou can find reviews on:\n• Our Homepage — Google Reviews section\n• Contact page — Google Reviews widget\n• Homepage — Testimonials carousel with before/after stats\n\nSample results:\n• Marcus: Added 6 MPH to fastball in 8 weeks\n• Sarah: Batting average went from .245 to .387\n• Tyler: Gained 6 MPH on pitch velocity\n\nWe\'re proud of every athlete\'s progress!',
    actions: [{ label: 'See Testimonials', href: '/' }],
  },

  // ── HOW TO NAVIGATE ──
  {
    keywords: ['navigate', 'menu', 'sidebar', 'where do i find', 'how to find', 'navigation', 'pages', 'sitemap'],
    title: 'Site Navigation',
    response: 'Here\'s how to get around PSP.Pro:\n\nPublic Pages (no login needed):\n• Home, About, Pricing, Blog, Contact, FAQ, Join the Team\n\nThe navigation adapts based on your login status:\n• Logged out — sidebar shows a "Login" link at the bottom\n• Logged in — sidebar shows "Your Dashboard" at the top (goes to /locker for athletes, /admin for coaches)\n\nAthlete Pages (login + membership required):\n• Athlete Locker — your main dashboard\n• Sessions — view/manage your bookings\n• Membership Training — browse training videos\n• Progress — track improvement\n• Achievements — earned badges\n• Buy Lessons — book new sessions\n• Settings — account management\n\nCoach/Admin Pages:\n• Admin Panel — main command center\n• Athletes, Bookings, Drills, Services, Availability, Analytics\n\nCTAs across the site also adapt — members see "Book Now" buttons while visitors see "Join the Team."',
    actions: [{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/locker' }],
  },
]

// ─── Smart Matching Engine ───────────────────────────────────
function findBestMatch(query: string): KBEntry {
  const q = query.toLowerCase().trim()
  const queryWords = q.split(/\s+/)

  // Score each entry
  let bestScore = 0
  let bestMatch: KBEntry | null = null

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0

    for (const keyword of entry.keywords) {
      const kw = keyword.toLowerCase()
      // Exact phrase match in query
      if (q.includes(kw)) {
        score += kw.split(/\s+/).length * 3 // multi-word phrases score higher
      }
      // Individual word overlap
      for (const word of queryWords) {
        if (word.length > 2 && kw.includes(word)) {
          score += 1
        }
      }
    }

    // Title match bonus
    if (entry.title.toLowerCase().split(/\s+/).some(w => queryWords.includes(w))) {
      score += 1
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  if (bestMatch && bestScore >= 2) {
    return bestMatch
  }

  // Fallback
  return {
    keywords: [],
    title: 'How Can I Help?',
    response: 'I can help you with:\n\n• Training programs & what sports we offer\n• Pricing, packages & how to save\n• Booking sessions step by step\n• Your dashboard, drills & progress\n• Account settings & login help\n• Coach/admin tools\n• Location, hours & contact info\n• Walk through any page on the site\n\nTry asking "walk me through the pricing page" or "how do I book a session" — I know every page inside and out!',
    actions: QUICK_ACTIONS.map(a => ({ label: a.label, href: a.href })),
    followUp: ['What sports do you train?', 'How do I get started?', 'Tell me about pricing'],
  }
}

// ─── Component ───────────────────────────────────────────────
export function PSPAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [hasGreeted, setHasGreeted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Get contextual suggestions based on current page
  const getSuggestions = () => {
    // Check for exact match first, then prefix match
    if (PAGE_SUGGESTIONS[pathname]) return PAGE_SUGGESTIONS[pathname]
    for (const [path, suggestions] of Object.entries(PAGE_SUGGESTIONS)) {
      if (pathname.startsWith(path) && path !== '/') return suggestions
    }
    return PAGE_SUGGESTIONS['/'] || []
  }

  const handleOpen = () => {
    setIsOpen(true)
    if (!hasGreeted) {
      setHasGreeted(true)
      setMessages([
        {
          id: 'greeting',
          type: 'assistant',
          content: 'Hey there! I\'m your PSP.Pro guide. I know every page on this site inside and out — ask me anything about training, pricing, booking, your dashboard, or how any feature works!',
        },
      ])
    }
  }

  const handleQuery = (query: string) => {
    if (!query.trim()) return

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: query.trim(),
    }

    const match = findBestMatch(query.trim())
    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: match.response,
      module: match,
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleQuery(input)
    setInput('')
  }

  const handleSuggestionClick = (query: string) => {
    handleQuery(query)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[100] flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-orange via-orange-500 to-orange-600 text-white text-sm font-bold shadow-2xl hover:shadow-orange/50 transition-all ring-4 ring-orange/20 hover:ring-orange/40"
        style={{
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline">Need Help?</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan rounded-full" />
      </motion.button>

      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 10px 30px rgba(184, 48, 26, 0.4), 0 0 20px rgba(184, 48, 26, 0.3);
          }
          50% {
            box-shadow: 0 10px 40px rgba(184, 48, 26, 0.6), 0 0 30px rgba(184, 48, 26, 0.5);
          }
        }
      `}</style>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[101] bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-4 left-2 right-2 sm:left-auto sm:bottom-6 sm:right-6 z-[102] sm:w-[420px] max-h-[calc(100vh-6rem)] sm:max-h-[600px] rounded-2xl overflow-hidden shadow-2xl command-panel"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-200/40 bg-gradient-to-r from-orange/10 to-cyan/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange" />
                  <span className="font-bold text-white">PSP.Pro Guide</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange/20 text-orange rounded-full font-medium">Smart</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors text-cyan-700 dark:text-white hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-2.5 border-b border-white/5 bg-cyan-50/50">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map((action, i) => (
                    <Link
                      key={i}
                      href={action.href}
                      onClick={() => setIsOpen(false)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50/50 hover:bg-orange/20 text-cyan-700 dark:text-white hover:text-orange transition-colors border border-cyan-200/40 hover:border-orange/50"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="h-[300px] overflow-y-auto px-4 py-3 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id}>
                    {msg.type === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm bg-orange/80 text-white text-sm">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="max-w-[90%] px-3 py-2 rounded-2xl rounded-tl-sm bg-white/10 text-cyan-700 dark:text-white text-sm whitespace-pre-line">
                          {msg.module?.title && (
                            <div className="font-bold text-white mb-1 text-sm">
                              {msg.module.title}
                            </div>
                          )}
                          {msg.content}
                        </div>
                        {/* Action buttons */}
                        {msg.module?.actions && msg.module.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 ml-1">
                            {msg.module.actions.map((action: any, i: number) => (
                              <Link
                                key={i}
                                href={action.href}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange/20 hover:bg-orange/30 text-orange hover:text-white transition-all border border-orange/20"
                              >
                                {action.label}
                                <span>→</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {/* Follow-up suggestions */}
                        {msg.module?.followUp && msg.module.followUp.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 ml-1 mt-1">
                            {msg.module.followUp.map((q: string, i: number) => (
                              <button
                                key={i}
                                onClick={() => handleSuggestionClick(q)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan/10 hover:bg-cyan/20 text-cyan hover:text-white transition-all border border-cyan/20 text-left"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Page-contextual suggestions (show only when no messages yet or after greeting) */}
                {messages.length <= 1 && (
                  <div className="mt-2">
                    <p className="text-xs text-cyan-700 dark:text-white/60 mb-2">Try asking:</p>
                    <div className="flex flex-col gap-1.5">
                      {getSuggestions().map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s.query)}
                          className="text-left px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-orange/10 text-cyan-700 dark:text-white/80 hover:text-orange transition-all border border-white/10 hover:border-orange/30"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-cyan-200/40 bg-cyan-50/50">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask anything about PSP.Pro..."
                    className="flex-1 px-4 py-2 rounded-xl bg-cyan-50/50 border border-cyan-200/40 text-white placeholder:text-cyan-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange to-orange-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-cyan-800 dark:text-white mt-2 text-center">
                  I know every page — try "walk me through" any feature
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
