'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'

// ─── Types ───────────────────────────────────────────────────
type RoleFilter = 'all' | 'athlete' | 'coach' | 'visitor'

interface KBEntry {
  keywords: string[]
  title: string
  response: string
  actions: { label: string; href: string }[]
  followUp?: string[]
  role?: RoleFilter // which role sees this entry (default: 'all')
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
  '/leaderboards': [
    { label: 'How do leaderboards work?', query: 'leaderboards' },
    { label: 'How do I opt in?', query: 'opt in leaderboard' },
    { label: 'Can I filter by verified only?', query: 'verified only leaderboard' },
  ],
  '/settings': [
    { label: 'How do I change my email?', query: 'change email' },
    { label: 'What can I update here?', query: 'walk me through settings' },
  ],
  '/admin': [
    { label: 'Walk me through the admin panel', query: 'walk me through admin' },
    { label: 'I\'m new — where do I start?', query: 'first time setup' },
    { label: 'How do I book for an athlete?', query: 'book for athlete' },
    { label: 'What\'s my daily workflow?', query: 'daily workflow' },
  ],
  '/courses': [
    { label: 'How do courses work?', query: 'how do courses work' },
    { label: 'How do I enroll?', query: 'enroll in course' },
    { label: 'How do I track progress?', query: 'course progress' },
  ],
  '/questionnaires': [
    { label: 'What is Pop Quiz?', query: 'what is pop quiz' },
    { label: 'How do I take a quiz?', query: 'complete quiz' },
    { label: 'Can I see my score?', query: 'quiz score' },
  ],
  '/admin/courses': [
    { label: 'How do I create a course?', query: 'create course' },
    { label: 'How do I add lessons?', query: 'add lessons to course' },
    { label: 'How do I enroll athletes?', query: 'enroll athletes in course' },
  ],
  '/admin/questionnaires': [
    { label: 'How do I create a quiz?', query: 'create quiz' },
    { label: 'How do I assign to athletes?', query: 'assign quiz' },
    { label: 'How do I see responses?', query: 'quiz responses' },
  ],
  '/admin/bookings': [
    { label: 'How do I confirm a booking?', query: 'manage bookings' },
    { label: 'How do I book for an athlete?', query: 'book for athlete' },
    { label: 'How do I add session notes?', query: 'edit booking' },
    { label: 'How do I mark a session complete?', query: 'mark complete' },
  ],
  '/admin/availability': [
    { label: 'How do I block time for a client?', query: 'block time' },
    { label: 'How do I edit a time slot?', query: 'edit slot' },
    { label: 'How do I set my hours?', query: 'availability' },
  ],
  '/admin/services': [
    { label: 'How do I create a lesson type?', query: 'lesson builder' },
    { label: 'How do I rename a lesson?', query: 'rename lesson' },
    { label: 'How do I add a video?', query: 'video url' },
  ],
  '/admin/athletes': [
    { label: 'How do I add an athlete?', query: 'add athlete' },
    { label: 'How do I log performance metrics?', query: 'log metrics' },
    { label: 'What sport metrics are tracked?', query: 'sport metrics' },
    { label: 'How do I assign drills?', query: 'assign drill' },
  ],
  '/admin/drills': [
    { label: 'How do I create a drill?', query: 'create drill' },
    { label: 'How do I bulk import drills?', query: 'import drill' },
    { label: 'How do I assign drills to athletes?', query: 'assign drill' },
  ],
  '/admin/org': [
    { label: 'How do I create an org?', query: 'create organization' },
    { label: 'How do I invite members?', query: 'invite member org' },
    { label: 'How do I connect Stripe payouts?', query: 'stripe connect payouts' },
    { label: 'How does the org landing page work?', query: 'org landing page' },
  ],
  '/admin/media': [
    { label: 'How do I create a blog post?', query: 'create blog post' },
    { label: 'How do I add images or GIFs?', query: 'add image to blog' },
    { label: 'How do I embed a YouTube video?', query: 'embed video blog' },
    { label: 'What is the Content Hub?', query: 'content hub' },
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
    response: 'To access the full training dashboard, you need an active membership, session package, or trial period.\n\nMonthly Membership — $60/mo:\n• Unlimited group session access\n• Discounted 1-on-1 sessions\n• Priority scheduling\n• Full PSP.Pro dashboard access\n• Progress tracking & analytics\n\nSession Packages also unlock dashboard access:\n• 5-Pack: $350 (valid 90 days)\n• 10-Pack: $675 (valid 180 days)\n• 20-Pack: $1,300 (valid 365 days)\n\n30-Day Trial:\n• When a coach creates your account, you automatically get a 30-day free trial\n• Full dashboard access during the trial — drills, sessions, progress, everything!\n• After the trial expires, you\'ll need to purchase a package to keep access\n\nWithout an active plan or trial, you\'ll see the "Membership Required" page instead of the dashboard. Coaches and admins always have full access.\n\nVisit the Pricing page to choose a plan!',
    actions: [{ label: 'View Pricing', href: '/pricing' }, { label: 'Contact Us', href: '/contact' }],
  },

  // ── BOOKING ──
  {
    keywords: ['book', 'schedule', 'appointment', 'reserve', 'buy lesson', 'how to book', 'buy', 'lesson'],
    title: 'How to Book a Session',
    response: 'Booking is a simple 4-step process:\n\n1️⃣ Choose your training type\nPick from 1-on-1, group, or specialty sessions\n\n2️⃣ Select your date\nUse the calendar to pick a training day\n\n3️⃣ Pick a time slot\nSee available coaches and times with location info\n\n4️⃣ Confirm & pay\nTwo options:\n• Pay with Card — secure Stripe checkout\n• Pay On-Site — reserve your spot now, pay in person at the facility\n\nAfter booking, you\'ll get a confirmation email automatically, and your coach gets notified too. The session appears on your dashboard right away.\n\nAvailability: Mon-Fri 3PM-9PM, Sat 9AM-5PM',
    actions: [{ label: 'Book Now', href: '/booking' }],
    followUp: ['Can I cancel or reschedule?', 'What payment methods do you accept?'],
  },

  // ── BOOKING WALKTHROUGH ──
  {
    keywords: ['walk me through booking', 'booking page', 'booking walkthrough', 'how does booking work'],
    title: 'Booking Page Walkthrough',
    response: 'Here\'s how the Booking page works:\n\nStep 1 — Service Selection\nYou\'ll see all active training services in a grid. Each card shows the name, price, duration, and description. Click one to select it.\n\nStep 2 — Date Selection\nA calendar appears. Pick any date from today forward. Unavailable dates are grayed out.\n\nStep 3 — Time Slot\nAvailable time slots show up with the coach name and location. Pick one that works.\n\nStep 4 — Confirmation\nReview everything: service, date, time, coach, and total price.\n• Elite members see their automatic 10% discount applied\n• Enter a promo code for additional savings\n• Discounts stack — Elite first, then promo code!\nHit "Confirm & Pay" to go to Stripe\'s secure checkout.\n\nAfter payment, you\'re redirected to a success page with:\n• Your confirmation ID\n• An "Add to Calendar" button to sync the session\n• A link to book another session\nYou\'ll also get a confirmation email.',
    actions: [{ label: 'Start Booking', href: '/booking' }],
  },

  // ── CANCELLATION / RESCHEDULING ──
  {
    keywords: ['cancel', 'refund', 'reschedule', 'change session', 'move session', 'cancellation policy'],
    title: 'Cancellations & Rescheduling',
    response: 'Our cancellation policy:\n\n• 24+ hours in advance → Full session credit\n• Less than 24 hours → Session forfeited\n\nHow to cancel or reschedule:\n1. Go to "My Sessions" (sidebar → My Lessons) from your dashboard\n2. Find the upcoming session you want to change\n3. Click "Cancel" or "Reschedule"\n4. Confirm in the popup\n\nCoaches can also manage from their Calendar (Confirm/Book) page.\n\nFor refund questions, reach out via the Contact page.',
    actions: [{ label: 'My Sessions', href: '/sessions' }, { label: 'Contact Us', href: '/contact' }],
  },

  // ── PAYMENT ──
  {
    keywords: ['payment', 'stripe', 'credit card', 'pay', 'checkout', 'payment method', 'pay on site', 'pay on-site', 'pay in person', 'cash'],
    title: 'Payment Information',
    response: 'We offer two ways to pay when booking:\n\n💳 Pay with Card (Stripe)\n• Credit/debit cards accepted\n• Secure, encrypted checkout\n• Booking confirmed instantly\n• Confirmation email sent automatically\n\n🏟️ Pay On-Site\n• Reserve your spot without a card\n• Pay in person at the facility (cash or card)\n• Booking shows as "pending" until payment\n• You\'ll get an email reminder to bring payment\n\nBoth options send you a confirmation email, and your coach gets notified automatically. Your session appears on your dashboard right away.',
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
    response: 'For athletes under 18, we require parent/guardian information:\n\n• Parent/Guardian full name\n• Parent/Guardian email\n• Parent/Guardian phone number\n\nThis is collected during signup or when a coach adds the athlete.\n\nAs a parent, you\'ll love our platform:\n• See every session, drill, and progress report\n• Track velocity improvements over time\n• Achievement badges keep young athletes motivated\n• Full transparency into coaching activities\n\nWe take safety seriously — all training follows proper protocols.',
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
    response: 'Here\'s the full process to join PSP.Pro:\n\n1️⃣ Start at "Join the Team" (/get-started)\nFill out the prospect form with your info, goals, and sport preferences. This helps us match you with the right coach.\n\n2️⃣ Create your account (/signup)\nAfter submitting the form, you\'ll be directed to create your login. Enter your name, email, password (8+ chars), sports, and age. Under 18? Provide parent/guardian info.\n\n3️⃣ Land on the FAQ page\nAfter signup you\'ll see a welcome banner with links to view memberships and access your dashboard.\n\n4️⃣ Purchase a membership or package\nVisit the Pricing page to pick a plan. You need an active membership or package to access the full training dashboard.\n\n5️⃣ Start training!\nOnce you have a package, your Athlete Locker unlocks with drills, sessions, progress tracking, and more.\n\nAlternative: If your coach already created your account, you don\'t need to sign up! Just go to /forgot-password, enter your email, set a password, and log in. You\'ll have a 30-day free trial.',
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
    response: 'To log in:\n\n1. Go to the Login page\n2. Enter your email and password\n3. Click "Sign In"\n\nAfter login:\n• Athletes → Athlete Locker (/locker) — requires active membership, package, or trial\n• Coaches/Admins → Admin Panel (/admin)\n\nTrouble logging in?\n• Check your email spelling\n• Password is case-sensitive\n• Use "Forgot Password?" to reset\n\nCoach created your account?\n• Your coach added you to the system — you already have an account!\n• Go to /forgot-password, enter the email your coach used\n• Click "Send Reset Link" and check your inbox\n• Set your password from the email link — then you can log in!\n• You get a 30-day free trial with full dashboard access\n\nNew here? Start with "Join the Team" at /get-started — it\'s the onboarding form for new prospects. Once you create an account and purchase a plan, you can log in to access everything.',
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
    response: 'The Athlete Locker is your personal dashboard — it adapts to your role:\n\n🏅 Athletes see:\n• Quick Stats — total sessions, avg velocity, drills completed, streak\n• Velocity Chart — your velocity trend over time\n• Next Session — upcoming booked session\n• Assigned Drills — coach-assigned training videos\n• Courses — video course library with progress tracking\n• Pop Quiz — game knowledge quizzes from your coach\n• Achievements — badges you\'ve earned\n• Recent Activity — last sessions and completed drills\n• Game Stats Review — log and review game performance\n\n🧑‍🏫 Coaches/Admins see:\n• Quick Stats — total athletes, upcoming sessions, drills in library, pending bookings\n• Upcoming Sessions — next 4 sessions with athlete names and status\n• Quick Links — fast access to Athletes, Bookings, Drills, Courses, Pop Quiz, Analytics, Media, Settings\n• Link to full Admin Panel for complete control\n\nAll data updates in real-time!',
    actions: [{ label: 'Go to Dashboard', href: '/locker' }],
    followUp: ['How do courses work?', 'What is Pop Quiz?', 'How do I book a session?'],
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
    response: 'The Sessions page shows all your training sessions:\n\nFilter by:\n• All Sessions\n• Upcoming (future bookings)\n• Past (completed sessions)\n\nEach session card shows:\n• Coach name and photo\n• Session type and service\n• Date, time, and location\n• Peak velocity (if recorded)\n• Coach notes\n• Status badge (upcoming, completed, cancelled)\n\nFor upcoming sessions you can:\n• RSVP — click Going, Maybe, or Can\'t go to let your coach know\n• Cancel (with 24hr policy)\n• Reschedule (redirects to booking)\n\nCalendar Sync:\n• Click "Sync Calendar" at the top of the page\n• Copies a subscribe URL for Google Calendar, Apple Calendar, or Outlook\n• Sessions auto-update when you book or cancel!\n\nCompleted sessions show your performance data from that session.',
    actions: [{ label: 'View Sessions', href: '/sessions' }],
  },

  // ── PROGRESS ──
  {
    keywords: ['progress', 'stats', 'analytics', 'improvement', 'tracking', 'how am i doing', 'velocity chart'],
    title: 'Progress Tracking',
    response: 'Your Progress page shows your athletic development:\n\n📊 Stats Cards\n• Peak Velocity (your all-time max)\n• Average Velocity\n• Sessions Completed\n• Drills Completed\n\n🏅 Sport Tabs\nSwitch between Softball, Basketball, Soccer, and Athleticism to see sport-specific performance data.\n\n📈 Multi-Metric Performance Chart\nA multi-line chart tracking your top metrics over time:\n• Softball: Exit Velocity, Bat Speed, Throwing Velocity\n• Basketball: 3-Point %, Vertical Jump, Free Throw %\n• Soccer: Sprint Speed, Shot Power, Passing Accuracy\n• Athleticism: 40-Yard Dash, Vertical Jump, Broad Jump\n\n🏆 Personal Records\nYour best value for each tracked metric, showing the date and whether it\'s PSP Verified or Self-Reported.\n\n📈 Velocity Progress Chart\nA line graph showing your velocity trend with a goal line.\n\n🎯 Milestones Timeline\nAchieved and upcoming milestones: first session, session counts (5, 10, 25, 50, 100), drill milestones, velocity personal bests, and training streaks.\n\nAll data is calculated from your real training sessions and coach-logged metrics!',
    actions: [{ label: 'View Progress', href: '/progress' }],
  },

  // ── PROGRESS WALKTHROUGH ──
  {
    keywords: ['walk me through progress', 'progress walkthrough', 'progress page'],
    title: 'Progress Page Walkthrough',
    response: 'Here\'s what you see on the Progress page:\n\nTop — 4 stat cards showing your Peak Velocity, Average Velocity, Sessions Completed, and Drills Completed.\n\nSport Tabs — Switch between Softball, Basketball, Soccer, and Athleticism to see sport-specific data.\n\nPerformance Chart — A multi-metric line chart tracking your top stats over time. Each sport shows different default metrics (e.g., Softball shows Exit Velocity, Bat Speed, and Throwing Velocity).\n\nPersonal Records — Your best value for each tracked metric with the date recorded and a Verified/Self-Reported badge.\n\nVelocity Chart — A classic velocity trend line with a goal reference line. Hover over data points for exact readings.\n\nMilestones Timeline — Vertical timeline with orange dots for achieved milestones and gray for in-progress. Includes session counts, drill counts, personal records, velocity targets, and training streaks.\n\nEverything is calculated from your actual training data and coach-logged metrics — no manual entry needed!',
    actions: [{ label: 'View Progress', href: '/progress' }],
  },

  // ── ACHIEVEMENTS ──
  {
    keywords: ['achievement', 'achievements', 'badges', 'badge', 'unlock', 'reward', 'gamification', 'points'],
    title: 'Achievements & Badges',
    response: 'Earn badges as you train! 13 achievements to unlock:\n\n🏅 First Session — Complete your first training session\n🏅 Drill Starter — Complete 10 drills\n🏅 Drill Collector — Complete 50 drills\n🔥 On Fire — Maintain a 3-day training streak\n🔥 Streak Master — Maintain a 7-day streak\n📅 Getting Started — Complete 5 sessions\n📅 Dedicated Athlete — Complete 25 sessions\n⚡ Velocity: 60 MPH — Reach 60 MPH throwing velocity\n⚡ Velocity: 70 MPH — Reach 70 MPH throwing velocity\n\n📝 Pop Quiz Badges:\n• Quiz Beginner — Complete your first quiz\n• Quiz Bronze — Complete 5 quizzes\n• Quiz Silver — Complete 10 quizzes\n• Quiz Gold — Complete 20 quizzes\n\nEach badge shows a progress bar so you can see how close you are. Points are earned for each unlock!',
    actions: [{ label: 'View Achievements', href: '/achievements' }],
  },

  // ── SETTINGS ──
  {
    keywords: ['settings', 'account', 'notification', 'edit profile', 'change email', 'update profile', 'preferences'],
    title: 'Account Settings',
    response: 'Your Settings page has 4 tabs:\n\n👤 Profile\n• Update your full name and email\n• Note: changing email requires re-verification\n\n🔔 Notifications\n• Toggle session reminders, progress updates, new drill alerts, achievement notifications, and coach messages\n\n📊 Leaderboard Settings\n• Toggle "Show on Leaderboards" to opt in/out\n• Set your Region / Area Code for regional rankings\n\n🔐 Security\n• Password management (coming soon)\n\n💳 Billing\n• Subscription management (coming soon)\n• Contact support for billing questions\n\nChanges save immediately when you click the Save button.',
    actions: [{ label: 'Go to Settings', href: '/settings' }],
  },

  // ── SETTINGS WALKTHROUGH ──
  {
    keywords: ['walk me through settings', 'settings walkthrough', 'settings page'],
    title: 'Settings Walkthrough',
    response: 'The Settings page has tabs across the top:\n\nProfile Tab — Edit your name and email. Click "Save Changes" when done. Email changes require verification.\n\nNotifications Tab — Toggle switches for: Session Reminders, Progress Updates, New Drills Assigned, Achievement Unlocked, Coach Messages. Click "Save Preferences."\n\nLeaderboard Settings — Toggle "Show on Leaderboards" and set your Region for regional rankings.\n\nSecurity Tab — Password reset and advanced security options (coming soon).\n\nBilling Tab — Subscription management (coming soon). For billing questions, contact support.',
    actions: [{ label: 'Go to Settings', href: '/settings' }],
  },

  // ── ADMIN PANEL ──
  {
    keywords: ['admin', 'coach dashboard', 'manage athletes', 'coach view', 'admin panel', 'coach panel', 'control center'],
    title: 'Coach/Admin Dashboard',
    response: 'The Admin panel is your coaching command center:\n\n📊 Quick Stats — Active athletes, upcoming sessions, total drills, pending bookings\n\n🏋️ Core Tools (sidebar navigation):\n• Calendar (Confirm/Book) — Confirm, edit, cancel bookings + book for athletes + check-in & attendance tracking\n• Lesson Builder — Create/rename lesson types, set pricing, and add video URLs\n• Manage Athletes — View, create, edit, delete athlete profiles + send progress reports\n• Drills — Create drills, import from YouTube, assign to athletes\n• Courses — Build multi-lesson video courses, enroll athletes\n• Pop Quiz — Create T/F quizzes, assign to athletes, view scores\n• Media — Upload and manage content\n• Analytics — View performance data and trends\n• Promo Codes — Create and manage discount codes for athletes\n• Data Import — Import CSV data from Rapsodo, Blast Motion, Pocket Radar, HitTrax\n• Organizations — Create your own branded coaching academy\n\n🚀 Quick Actions on Admin Home:\n• "Book for Athlete" button (top right — always visible)\n• Create Drill, Schedule Session, Add Athlete, Upload Video cards\n\n💰 Stripe Settings (Admin only):\n• Toggle test/live payment mode\n• View payment status\n\nCoaches see only their athletes and sessions. Admins see everything.',
    actions: [{ label: 'Go to Admin', href: '/admin' }],
    followUp: ['How do I create a course?', 'How do I create a quiz?', 'How do I book for an athlete?'],
    role: 'coach',
  },

  // ── ADMIN WALKTHROUGH ──
  {
    keywords: ['walk me through admin', 'admin walkthrough', 'admin page', 'how to use admin'],
    title: 'Admin Panel Walkthrough',
    response: 'The Admin Control Center layout:\n\nHeader — "Admin Control Center" title with an orange "Book for Athlete" button (top right). Below that, a smart banner greets you by name and shows tips based on your current stats (pending bookings, athletes, drills).\n\nQuick Actions — 5 cards: Book for Athlete, Create Drill, Schedule Session, Add Athlete, Upload Video.\n\nQuick Stats — 4 cards: Total Athletes, Upcoming Sessions, Training Drills, Pending Bookings (badge if any pending).\n\nUpcoming Sessions — List of your next 5 sessions with athlete name, service, date, time, and status. Click any to go to the Calendar page.\n\nPlatform Management — 6 cards: Athlete Management, Courses, Session Schedule, Content Library, Analytics, Platform Settings.\n\nStripe Section (admin only) — Test/live payment mode toggle.\n\nSidebar navigation:\n• Calendar (Confirm/Book) — manage all bookings, edit notes, book for athletes\n• Lesson Builder — create/rename lesson types and pricing\n• Manage Athletes — athlete profiles and management\n• Drills — create and assign training videos\n• Courses — build multi-lesson video courses\n• Pop Quiz — create and assign T/F quizzes\n• Media — upload and manage content\n• Analytics — performance data and trends',
    actions: [{ label: 'Go to Admin', href: '/admin' }],
    role: 'coach',
  },

  // ── COACH: FULL WALKTHROUGH — FIRST TIME SETUP ──
  {
    keywords: ['first time setup', 'getting started as coach', 'new coach', 'how to start', 'setup my account', 'what do i do first', 'where do i start', 'coach tutorial', 'coach guide', 'full walkthrough coach'],
    title: 'Coach Getting Started Guide',
    response: 'Welcome! Here\'s how to set up everything as a coach:\n\nStep 1: Create Your Lesson Types\nGo to Lesson Builder (sidebar). Click "Create Lesson Type" and add your services — 1-on-1 training, group sessions, etc. Set name, price, duration, and category.\n\nStep 2: Set Your Availability\nGo to Admin Home → "Schedule Session" (or sidebar → Availability page). Pick dates and time slots when you can coach. Link each slot to a lesson type.\n\nStep 3: Add Your Athletes\nGo to Manage Athletes. Click "Add Athlete" — enter their name, email, sport(s), and age. They get an account with a 30-day free trial instantly. Tell them to go to /forgot-password to set their login password.\n\nStep 4: Create Drills\nGo to Drills. Click "Create Drill" — add a YouTube video URL, title, description, difficulty. Or use Bulk Import with a CSV (180x faster!).\n\nStep 5: Assign Drills\nGo to Manage Athletes → select an athlete → "Assign Drills" → pick from your library.\n\nStep 6: Book Returning Clients\nFrom Admin Home, click "Book for Athlete" to manually book a session for a walk-in or existing client.\n\nStep 7: Set Up Promo Codes (optional)\nGo to Promo Codes (sidebar). Create discount codes to share with new athletes or for promotions.\n\nStep 8: Import Device Data (optional)\nGo to Data Import (sidebar). Upload CSV files from Rapsodo, Blast Motion, Pocket Radar, or HitTrax to import training metrics.\n\nThat\'s it! Your athletes can now log in, see their drills, book sessions, track progress, message you, sync their calendar, and view progress reports!',
    actions: [{ label: 'Lesson Builder', href: '/admin/services' }, { label: 'Set Availability', href: '/admin/availability' }, { label: 'Manage Athletes', href: '/admin/athletes' }],
    followUp: ['How do I book for an athlete?', 'How do I create a course?', 'Walk me through the admin panel', 'How do I create a promo code?', 'How do I import device data?'],
    role: 'coach',
  },

  // ── COACH: DAILY WORKFLOW ──
  {
    keywords: ['daily workflow', 'day to day', 'routine', 'what should i do daily', 'daily tasks', 'coach routine', 'morning routine'],
    title: 'Coach Daily Workflow',
    response: 'Here\'s a typical coach workflow:\n\n1. Check Admin Home\nOpen /admin — your smart banner shows pending bookings and upcoming sessions at a glance.\n\n2. Confirm Pending Bookings\nClick "Calendar (Confirm/Book)" in the sidebar (or the pending badge). Confirm or decline new bookings.\n\n3. Check Messages\nOpen Messages — reply to athlete questions or send training updates.\n\n4. Review Today\'s Sessions\nThe Upcoming Sessions widget on Admin Home shows your next 5 sessions with athlete names and times. Check RSVPs to know who\'s coming.\n\n5. Check In Athletes\nWhen athletes arrive, click "Check In" on their confirmed booking in the Calendar page.\n\n6. After Each Session\nGo to Calendar (Confirm/Book) → find the completed session → click Edit → add Coach Notes and Internal Notes. Mark as "Complete." Import any device data (Rapsodo, etc.) from Data Import.\n\n7. Assign Follow-Up Drills\nGo to Manage Athletes → select the athlete → Assign Drills based on what you worked on.\n\n8. Book Walk-Ins\nClient shows up without a booking? Click "Book for Athlete" on Admin Home → select athlete, slot, and payment type (on-site, package, or comp). Share a promo code for their next visit!\n\n9. Send Progress Reports\nPeriodically go to Admin → Athletes → click an athlete → "Send Report" to email them a professional 30-day progress summary.\n\n10. Check Analytics\nEnd of day, review Analytics for trends across your athletes.',
    actions: [{ label: 'Admin Home', href: '/admin' }, { label: 'Calendar', href: '/admin/bookings' }],
    followUp: ['How do I edit a booking?', 'How do I add coach notes?', 'How do I mark a session complete?'],
    role: 'coach',
  },

  // ── COACH: MARK SESSION COMPLETE ──
  {
    keywords: ['mark complete', 'complete session', 'finish session', 'session done', 'after session', 'post session', 'session complete'],
    title: 'Marking a Session Complete',
    response: 'After a training session:\n\n1. Go to Calendar (Confirm/Book) in the sidebar\n2. Find the session (filter by "Confirmed" if needed)\n3. Click the pencil (Edit) icon on the booking\n4. Add Coach Notes — things the athlete did well, areas to improve (the athlete can see these!)\n5. Add Internal Notes — private thoughts, injury concerns, etc. (only you and admins see these)\n6. Change Status to "Completed"\n7. Save\n\nThe session now shows as completed in the athlete\'s Session History with your notes attached.\n\nIf the athlete didn\'t show up, click "No Show" instead — this tracks attendance.',
    actions: [{ label: 'Calendar', href: '/admin/bookings' }],
    role: 'coach',
  },

  // ── COACH: SIDEBAR NAVIGATION MAP ──
  {
    keywords: ['sidebar', 'navigation', 'menu items', 'where is', 'find page', 'coach menu', 'admin menu', 'admin sidebar'],
    title: 'Coach Sidebar Navigation',
    response: 'Your sidebar navigation (left side on desktop, bottom on mobile):\n\n• Admin Home — your command center with stats, sessions, and quick actions\n• Calendar (Confirm/Book) — all bookings: confirm, edit, cancel, check-in, book for athletes\n• Lesson Builder — create/manage lesson types, pricing, categories\n• Manage Athletes — view/create/edit athlete profiles, send progress reports\n• Drills — create, import, and manage training videos\n• Courses — build multi-lesson video course bundles\n• Pop Quiz — create T/F quizzes, assign to athletes, view scores\n• Media — upload and manage content files\n• Analytics — performance reports and trends\n• Promo Codes — create and manage discount codes for athletes\n• Data Import — import CSV data from Rapsodo, Blast Motion, Pocket Radar, HitTrax\n\nTips:\n• Calendar has a badge showing pending bookings count\n• Messages badge shows your unread message count\n• "Book for Athlete" is also available from Admin Home (orange button top right)\n• On mobile, swipe left/right to see all nav items',
    actions: [{ label: 'Admin Home', href: '/admin' }],
    role: 'coach',
  },

  // ── ADD ATHLETE (COACH) ──
  {
    keywords: ['add athlete', 'create athlete', 'new athlete', 'register athlete'],
    title: 'Adding Athletes (Coach Tool)',
    response: 'To add an athlete:\n\n1. Go to Admin → Athletes\n2. Click "Add Athlete" button\n3. Fill in the form:\n   • Full Name (required)\n   • Email (required — used for their login)\n   • Sport(s) — select multiple sports if needed (Softball, Basketball, Soccer)\n   • Age\n   • Parent/Guardian info (if under 18)\n4. Click "Create"\n\nWhat happens next:\n• The athlete gets a 30-day trial with full dashboard access — no package purchase needed yet!\n• They need to set their password: go to /forgot-password, enter the email you used, and click "Send Reset Link"\n• After clicking the link in their email, they set a password and can log in\n• Trial countdown shows in the system — after 30 days they\'ll need to purchase a package\n\nYou can also edit or delete athletes from the Athletes management page.',
    actions: [{ label: 'Athlete Management', href: '/admin/athletes' }],
    role: 'coach',
  },

  // ── SPORT-SPECIFIC METRICS (COACH) ──
  {
    keywords: ['metrics', 'performance data', 'log metrics', 'track metrics', 'athlete stats', 'sport metrics', 'verified metrics', 'self reported', 'exit velocity', 'throwing velocity', 'bat speed', 'vertical jump', 'quick log', 'session metrics', 'performance tracking', 'softball metrics', 'basketball metrics', 'soccer metrics', 'athleticism', 'sport data'],
    title: 'Sport-Specific Metrics System',
    response: 'PSP has a full sport-specific metrics system with 60 tracked metrics:\n\n\u26BE Softball (15): Exit Velocity, Overhand Throw Velocity, Pitching Velocity, Pop Time, Home-to-1B, Spin Rate, Strike %, Contact %, Launch Angle, Bat Speed, Glove-to-Throw Exchange, Catch Radius, Baserunning Acceleration, Off-Speed Command, Infield Velocity\n\n\uD83C\uDFC0 Basketball (15): 3-Point %, Free Throw %, Lane Agility, Max Vertical Reach, Effective FG%, Assist-to-Turnover Ratio, Lateral Slide Speed, Reaction Time, Dribble Velocity, Defensive Rebound Rate, Block/Steal Rate, Box-to-Box Sprint, Hand Size, Catch-and-Shoot Release, Perimeter Defensive Rating\n\n\u26BD Soccer (15): Passing Accuracy, First Touch Efficiency, Shot Power, Successful Dribbles (1v1), Distance Covered, Sprints per Game, Cross Accuracy, Aerial Duel Win %, Recovery Speed, Tackle Success, Interceptions per 90, Shot-on-Goal %, Decision-Making Speed, Goalie Save %, Distribution Accuracy\n\n\uD83C\uDFCB\uFE0F Athleticism (15): 10-Yard Split, 40-Yard Dash, Vertical Jump, Pro Agility 5-10-5, Broad Jump, 3-Cone Drill, Medicine Ball Toss, Wing Span, Beep Test, Max Pull-Ups, Grip Strength, Deadlift (Relative BW), T-Test, Body Fat %, Resting Heart Rate\n\nHow to log metrics:\n1. Go to Admin \u2192 Athletes \u2192 click an athlete\n2. Click "Add Performance Data"\n3. Select the sport tab (Softball/Basketball/Soccer/Athleticism)\n4. Enter metric values + toggle PSP Verified or Self-Reported\n5. Save!\n\nQuick Log from Sessions:\n\u2022 Go to Calendar \u2192 Edit a confirmed/completed booking\n\u2022 Click "Log Session Metrics" \u2014 pre-fills athlete and session link\n\u2022 Quick-entry mode shows top 5 metrics per sport + 3 athleticism metrics\n\nVerification Badges:\n\u2022 \u2705 PSP Verified \u2014 Coach recorded with verified equipment\n\u2022 \u26AA Self-Reported \u2014 Athlete/parent reported the data\n\nHistory tab lets you filter by sport to see trends over time.',
    actions: [{ label: 'Manage Athletes', href: '/admin/athletes' }, { label: 'Calendar', href: '/admin/bookings' }],
    followUp: ['How do I log metrics from a session?', 'What are verified badges?', 'How do I view an athlete\'s performance history?'],
    role: 'coach',
  },

  // ── COACH EARNINGS DASHBOARD ──
  {
    keywords: ['earnings', 'my earnings', 'coach earnings', 'revenue', 'my revenue', 'how much earned', 'income', 'analytics coach'],
    title: 'Coach Earnings Dashboard',
    response: 'The Analytics page shows your personal earnings and performance data!\n\nAs a Coach, the page is scoped to YOUR data only:\n• Total Revenue — only from YOUR sessions (paid bookings)\n• Total Bookings — sessions assigned to you\n• Active Athletes — athletes who booked with you\n• Completion Rate — your session completion %\n\nCharts included:\n📊 Monthly Revenue — bar chart showing last 6 months of earnings\n📈 Revenue Trend — line chart of your earnings over time\n🥧 Booking Status — pie chart of confirmed vs completed vs cancelled\n💰 Revenue by Service — breakdown of which lesson types earn the most\n👥 Top Athletes by Revenue — which athletes spend the most with you\n\nTime range selector: Last 7 days, 30 days, or 90 days.\n\nAdmins see platform-wide data instead of coach-scoped data.',
    actions: [{ label: 'My Earnings', href: '/admin/analytics' }],
    followUp: ['How much have I earned this month?', 'Which service type earns the most?', 'How do I see my booking stats?'],
    role: 'coach',
  },

  // ── PROGRESS & TROPHY CASE (ATHLETE) ──
  {
    keywords: ['progress', 'trophy case', 'personal records', 'performance chart', 'metric trends', 'my stats', 'how am I doing', 'improvement'],
    title: 'Progress & Trophy Case',
    response: 'Your Progress page is your personal trophy case!\n\nStat cards at the top: Peak Velocity, Avg Velocity, Sessions Completed, Drills Completed.\n\nSport-Specific Performance Charts:\n• Select your sport tab (Softball / Basketball / Soccer / Athleticism)\n• See multi-metric trend lines showing your improvement over time\n• Softball defaults: Exit Velocity + Bat Speed + Throwing Velocity\n• Basketball defaults: 3-Point % + Vertical Jump + Free Throw %\n• Soccer defaults: Sprint Speed + Shot Power + Passing Accuracy\n• Athleticism defaults: 40-Yard Dash + Vertical Jump + Broad Jump\n\nPersonal Records section shows your best value for each metric with:\n• The date it was recorded\n• Verified badge (PSP Verified vs Self-Reported)\n\nMilestones timeline tracks:\n• First training session\n• Peak velocity personal best\n• Session count milestones (5, 10, 25, 50, 100)\n• Drill milestones (10, 25, 50)\n• Training streaks\n• Top personal records from your sport metrics',
    actions: [{ label: 'View Progress', href: '/progress' }],
    followUp: ['What are my personal records?', 'How do I switch sports?', 'What does PSP Verified mean?'],
    role: 'athlete',
  },

  // ── LEADERBOARDS (ATHLETE) ──
  {
    keywords: ['leaderboard', 'leaderboards', 'rankings', 'rank', 'compare', 'how do I rank', 'top athletes', 'regional', 'opt in leaderboard'],
    title: 'Regional Leaderboards',
    response: 'PSP Regional Leaderboards let you see how you stack up against other athletes!\n\nHow to opt in:\n1. Go to Settings → scroll to "Leaderboard Settings"\n2. Toggle "Show on Leaderboards" ON\n3. Enter your Region / Area Code (e.g., "757", "Hampton Roads")\n4. Save — your best metrics will now appear on the leaderboard\n\nLeaderboard features:\n🏅 Sport tabs: Softball, Basketball, Soccer, Athleticism\n📊 Metric selector: Choose which stat to rank (e.g., Exit Velocity, 3-Point %)\n🌎 Region filter: Compare athletes in your area\n✅ "Verified Only" toggle: Filter to show only PSP Verified metrics\n\nRanking shows: Rank, Name, Region, Best Value, Verified status.\n\nTop 3 athletes get gold/silver/bronze medal icons. Your own row is highlighted in orange.\n\nOnly opted-in athletes appear. Your data is private until you choose to share it.',
    actions: [{ label: 'View Leaderboards', href: '/leaderboards' }, { label: 'Settings', href: '/settings' }],
    followUp: ['How do I opt in to leaderboards?', 'Can I see only verified scores?', 'How do I set my region?'],
    role: 'athlete',
  },

  // ── QUICK BOOKING (ATHLETE) ──
  {
    keywords: ['quick book', 'rebook', 'book again', 'fast booking', 'one tap', 'repeat session', 'recent services'],
    title: 'Quick Booking & Rebook',
    response: 'PSP makes rebooking super fast!\n\nQuick Rebook from Dashboard:\n• On your Locker (Dashboard) page, look for the "Book Again" card\n• It shows your last completed session (service + coach)\n• Click "Rebook" to go straight to the booking page with that service and coach pre-selected\n\nRecent Services on Booking Page:\n• When you go to Book a Session, you\'ll see a "Quick Rebook" row at the top\n• It shows your last 3 booked services as quick-pick cards\n• Click one to skip the service selection step entirely\n\nURL Shortcuts:\n• /booking?service=ID — pre-selects a specific service\n• /booking?service=ID&coach=ID — pre-selects service AND filters time slots to that coach\n\nThe full 4-step booking flow (Service → Date → Time → Confirm) still works normally — these shortcuts just help you skip steps you\'ve already decided on!',
    actions: [{ label: 'Book a Session', href: '/booking' }],
    followUp: ['How do I book a session?', 'Can I rebook the same coach?', 'How does pay-on-site work?'],
    role: 'athlete',
  },

  // ── MANAGE BOOKINGS (COACH) ──
  {
    keywords: ['manage bookings', 'confirm booking', 'pending booking', 'booking management', 'approve booking', 'calendar confirm', 'calendar book'],
    title: 'Calendar (Confirm/Book)',
    response: 'The Calendar page (sidebar: "Calendar (Confirm/Book)") is your booking command center:\n\nFilter tabs: All, Pending, Confirmed, Cancelled\n\nStats row: Total Bookings, Confirmed, Pending, Revenue, No-Shows\n\nEach booking shows: Athlete name, service, date/time, coach, amount, payment status, booking status.\n\nActions you can take:\n• Pending → "Confirm" or "Cancel"\n• Confirmed → "Check In" (when athlete arrives), "Mark Complete", "No Show", or "Log Metrics"\n• Edit → Add coach notes, internal notes, update status\n• Log Session Metrics → On confirmed/completed bookings, click the orange "Metrics" button or open Edit and click "Log Session Metrics" to record sport-specific performance data linked to that session\n• "Book for Athlete" button (top of page) → Create a booking on behalf of any athlete\n\nAttendance tracking:\n• "Check In" button appears on confirmed bookings — click when athlete arrives\n• "No-Show" button marks absent athletes\n• No-Show count is tracked in the stats bar\n\nPayment types when booking for athlete:\n• Stripe — normal online payment\n• On-Site — athlete pays in person\n• Use Package — deducts from athlete\'s session pack\n• Complimentary — free session\n\nCoaches see only their own bookings. Admins see all.',
    actions: [{ label: 'Calendar', href: '/admin/bookings' }],
    followUp: ['How do I book for an athlete?', 'How do I edit a booking?', 'How do I mark a session complete?'],
    role: 'coach',
  },

  // ── CREATE DRILLS (COACH) ──
  {
    keywords: ['create drill', 'make drill', 'new drill', 'assign drill', 'import drill'],
    title: 'Creating & Assigning Drills',
    response: 'Creating drills:\n1. Go to Admin → Drills\n2. Click "Create Drill"\n3. Add title, description, YouTube video URL, category, difficulty, duration, and tags\n4. Save the drill\n\nBulk import:\n• Go to Admin → Drills → Import\n• Upload a CSV with columns: title, description, youtube_url, category, difficulty, duration, tags, equipment, focus_areas\n• Download the template for the correct format\n\nAssigning drills:\n• Go to Admin → Athletes → select an athlete\n• Click "Assign Drills" and pick from your library\n• Assigned drills show up on the athlete\'s dashboard',
    actions: [{ label: 'Drill Management', href: '/admin/drills' }],
    role: 'coach',
  },

  // ── SERVICES (COACH) ──
  {
    keywords: ['service', 'services', 'lesson builder', 'training type', 'add service', 'edit service', 'rename lesson', 'rename service', 'lesson type', 'lesson name'],
    title: 'Lesson Builder',
    response: 'The Lesson Builder is where you create and manage your lesson types (the services athletes book):\n\nFrom Admin → Lesson Builder you can:\n• Create new lesson types with name, description, price, duration, category, and max participants\n• Rename existing lesson types — the new name automatically updates on all bookings\n• Add a Video URL (YouTube/Vimeo) — shows a play button on the Pricing page\n• Toggle active/inactive (inactive types don\'t show on booking or pricing)\n• Link a Stripe price ID for payment processing\n\nCategories:\n• Individual — 1-on-1 sessions\n• Group — multi-athlete sessions\n• Package — session bundles (5/10/20-pack)\n• Specialty — video analysis, recovery, etc.\n\nPrices flow directly to the Pricing page and the Booking page — update once, changes appear everywhere.\n\nTip: To rename a lesson type, click the Edit button and change the name. All past and future bookings will show the updated name!',
    actions: [{ label: 'Lesson Builder', href: '/admin/services' }],
    role: 'coach',
  },

  // ── AVAILABILITY (COACH) ──
  {
    keywords: ['availability', 'schedule', 'time slot', 'set hours', 'coaching hours', 'available times', 'block time', 'block slot', 'reserve time'],
    title: 'Setting Availability & Blocking Time',
    response: 'From Admin Home → "Schedule Session" quick action (or sidebar → Availability page):\n\nCreating time slots:\n1. Click "Add Time Slot"\n2. Select a service (lesson type)\n3. Pick a date and set start/end times\n4. Set location and max bookings (1 for 1-on-1, more for groups)\n5. Save — athletes can now see and book this slot\n\nBlocking time for existing clients:\nIf a client is already booked from your old system, use "Book for Athlete" to reserve the slot:\n• There\'s an orange tip banner at the top of the Availability page linking directly to it\n• Or click "Book for Athlete" on Admin Home\n• This books the slot AND blocks it so nobody else can take it\n\nEditing slots:\n• Click the pencil icon to edit time, location, or service\n• Slots with active bookings show a warning\n• Delete empty slots you no longer need\n\nDefault hours: Mon-Fri 3PM-9PM, Saturday 9AM-5PM.',
    actions: [{ label: 'Set Availability', href: '/admin/availability' }, { label: 'Book for Athlete', href: '/admin/bookings?action=book' }],
    followUp: ['How do I book for an athlete?', 'How do I edit a slot?', 'How do I manage bookings?'],
    role: 'coach',
  },

  // ── PRICING PAGE WALKTHROUGH ──
  {
    keywords: ['walk me through the pricing page', 'walk me through pricing', 'pricing walkthrough', 'pricing page'],
    title: 'Pricing Page Walkthrough',
    response: 'The Pricing page is organized in sections:\n\n🔝 Quick Stats — 4 cards showing starting prices for 1-on-1, group, max package savings, and a "100% Pro Training" badge.\n\n🟠 1-on-1 Training — Cards for each individual service with name, price per session, duration, and description bullets.\n\n🔵 Group Training — Cards for group sessions showing price, duration, max participants, and description.\n\n📦 Training Packages — 5, 10, and 20-session packs showing total price, per-session cost, and savings. The middle one is marked "Most Popular."\n\n🟢 Specialty Services — Video analysis, recovery sessions, etc.\n\nSmart CTAs: Buttons adapt to who you are:\n• Not logged in → "Join the Team" (sends to /get-started)\n• Logged-in member → "Book Now" (sends to /booking)\n• Coach/Admin → "Lesson Builder" (sends to /admin/services)\n\nAll prices update live from the database!',
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
    keywords: ['blog', 'article', 'tips', 'read', 'news', 'content', 'training tips', 'blog topics'],
    title: 'Blog & Training Tips',
    response: 'Our blog covers topics to help you level up:\n\n• Pitching mechanics breakdowns\n• Hitting drills you can do at home\n• Speed training: first-step quickness\n• Nutrition for athletes\n• Mental game strategies\n• Injury prevention\n\nThe blog page shows a featured post at the top, followed by a grid of recent articles. Each post has a category tag, read time, and date.\n\nClick any post to read the full article — posts can include images, GIFs, and embedded YouTube/Vimeo videos!\n\nCoaches can create and manage blog posts from the Content Hub (Admin → Content). You can also sign up for our newsletter at the bottom of the blog page!',
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
    response: 'Here\'s how to get around PSP.Pro:\n\nPublic Pages (no login needed):\n• Home, About, Pricing, Blog, Contact, FAQ, Join the Team\n\nThe navigation adapts based on your login status:\n• Logged out — sidebar shows a "Login" link at the bottom\n• Logged in — sidebar shows "Your Dashboard" at the top (goes to /locker for athletes, /admin for coaches)\n\nAthlete Sidebar:\n• Dashboard — your main locker\n• Drills (members only) — browse training videos\n• Progress — track improvement\n• Messages — direct messaging with coaches (with unread badge!)\n• Report — view your 30-day progress report\n• Achievements — earned badges\n• My Lessons — view/manage bookings with RSVP + calendar sync\n• Book Lessons — book new sessions\n• Courses — video course library\n• Pop Quiz — game knowledge quizzes\n• Leaderboards — regional rankings by sport & metric\n• Settings — account management\n\nCoach/Admin Sidebar:\n• Admin Home — command center with stats & quick actions\n• Calendar (Confirm/Book) — manage bookings, confirm, check-in, attendance tracking\n• Lesson Builder — manage lesson types & pricing\n• Manage Athletes — athlete profiles + send progress reports\n• Drills — create and assign training videos\n• Courses — build video course bundles\n• Pop Quiz — create and assign quizzes\n• Media — upload content\n• Analytics — performance reports\n• Promo Codes — create and manage discount codes\n• Data Import — import CSV data from sports devices\n• Organizations — run your own branded academy\n\nCTAs across the site adapt — members see "Book Now", visitors see "Join the Team."',
    actions: [{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/locker' }],
  },

  // ════════════════════════════════════════════════════════════
  // ── VIDEO COURSES (ATHLETE) ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['course', 'courses', 'video course', 'video lesson', 'watch course', 'enroll', 'enroll in course', 'how do courses work', 'course library', 'training course'],
    title: 'Video Courses',
    response: 'Video Courses are multi-lesson training programs you can watch at your own pace!\n\nHow it works:\n1. Go to Courses from your sidebar\n2. Browse the course library — filter by All, My Courses, or Available\n3. Each course card shows the title, lesson count, price, and your progress\n4. Free courses — click "Enroll Free" to get instant access\n5. Start watching! Lessons play right on the page\n\nProgress tracking:\n• A progress bar shows how many lessons you\'ve completed\n• Click "Mark Complete" after watching each lesson\n• Your progress is saved — come back anytime and pick up where you left off\n• The course auto-selects your first incomplete lesson\n\nSome courses include free preview lessons you can watch before enrolling!',
    actions: [{ label: 'Browse Courses', href: '/courses' }],
    followUp: ['How do I track my progress?', 'What is Pop Quiz?', 'How do drills work?'],
    role: 'athlete',
  },
  {
    keywords: ['course progress', 'lesson complete', 'mark lesson complete', 'course percentage', 'how far am i'],
    title: 'Course Progress',
    response: 'Your course progress is tracked automatically:\n\n• Each course shows a progress bar (e.g., "3 of 8 lessons completed — 38%")\n• After watching a lesson, click "Mark Complete" to log it\n• You can also un-mark a lesson if you want to re-watch it\n• The course library shows your progress percentage on each enrolled course card\n• When you return to a course, it auto-selects your next incomplete lesson\n\nCompleting all lessons in a course = 100% — keep going!',
    actions: [{ label: 'My Courses', href: '/courses' }],
    role: 'athlete',
  },

  // ── VIDEO COURSES (COACH) ──
  {
    keywords: ['create course', 'make course', 'new course', 'build course', 'manage courses', 'course builder', 'add lessons to course'],
    title: 'Creating Video Courses (Coach Tool)',
    response: 'You can create multi-lesson video courses for your athletes:\n\n1. Go to Admin → Courses\n2. Click "Create Course"\n3. Fill in: title, description, thumbnail URL, category\n4. Set pricing: Free, One-Time ($), or Monthly ($/mo)\n5. Toggle "Included in Membership" if members get it free\n6. Save the course\n\nAdding lessons:\n1. Click "Lessons" (film icon) on the course card\n2. Add lessons with: title, video URL (YouTube/Vimeo/direct), description\n3. Toggle "Preview" to let non-enrolled users watch that lesson for free\n4. Use up/down arrows to reorder lessons\n\nEnrolling athletes:\n1. Click "Enroll" (users icon) on the course card\n2. Check the athletes you want to enroll\n3. Click "Save Enrollments" — they get instant access\n\nExample: Create a "Drill Bank" course with 28 videos, set it to Free, and toggle "Included in Membership."',
    actions: [{ label: 'Manage Courses', href: '/admin/courses' }],
    followUp: ['How do I enroll athletes?', 'How do I create a quiz?', 'How do drills work?'],
    role: 'coach',
  },
  {
    keywords: ['enroll athletes', 'enroll athletes in course', 'give access to course', 'add athletes to course'],
    title: 'Enrolling Athletes in Courses',
    response: 'To enroll athletes in a course:\n\n1. Go to Admin → Courses\n2. Find the course card\n3. Click the person+ icon (Enroll Athletes)\n4. Check the box next to each athlete you want to enroll\n5. Click "Save Enrollments"\n\nAthletes get instant access — the course shows up in their Courses page right away.\n\nYou can also see the enrollment count on each course card.\n\nFor free courses, athletes can also self-enroll by clicking "Enroll Free" on the course library page.',
    actions: [{ label: 'Manage Courses', href: '/admin/courses' }],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── POP QUIZ (ATHLETE) ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['pop quiz', 'quiz', 'quizzes', 'questionnaire', 'what is pop quiz', 'complete quiz', 'assessment', 'game iq', 'knowledge test'],
    title: 'Pop Quiz',
    response: 'Pop Quiz is where your coach tests your game knowledge with True/False questions!\n\nHow it works:\n1. Go to Pop Quiz from your sidebar\n2. You\'ll see stat cards for pending and completed quizzes\n3. Filter by All, Pending, or Completed\n4. Click "Take Quiz" on any pending quiz\n5. Answer each question True or False\n6. Click "Submit" when done\n\nAfter submitting:\n• You\'ll see your score right away (e.g., "4 of 5 correct — 80%")\n• Each question shows if you got it right (green) or wrong (red)\n• Your coach can also see your responses and score\n\nComplete quizzes to earn Pop Quiz badges — Beginner, Bronze, Silver, and Gold!',
    actions: [{ label: 'Pop Quiz', href: '/questionnaires' }],
    followUp: ['Can I see my score?', 'How do courses work?', 'What badges can I earn?'],
    role: 'athlete',
  },
  {
    keywords: ['quiz score', 'quiz result', 'my score', 'how did i do', 'see results'],
    title: 'Quiz Scores',
    response: 'After completing a pop quiz:\n\n• Your score is shown immediately (e.g., "4 of 5 correct — 80%")\n• Green = correct answer, Red = wrong answer\n• You can click any completed quiz to review your answers\n• Your coach also sees your score and individual responses\n\nCompleted quizzes move to the "Completed" tab. You can always go back and review them!\n\nBonus: Each quiz you complete counts toward your Pop Quiz badges (Beginner → Bronze → Silver → Gold).',
    actions: [{ label: 'Pop Quiz', href: '/questionnaires' }],
    role: 'athlete',
  },

  // ── POP QUIZ (COACH) ──
  {
    keywords: ['create quiz', 'make quiz', 'create questionnaire', 'build quiz', 'new quiz', 'manage quizzes', 'pop quiz coach'],
    title: 'Creating Pop Quizzes (Coach Tool)',
    response: 'You can create True/False quizzes and assign them to athletes:\n\n1. Go to Admin → Pop Quiz\n2. Click "New Quiz"\n3. Add a title and optional description\n4. Build your questions:\n   • Type each question\n   • Set the correct answer (True or False)\n   • Click "Add" to add it to the list\n5. Save the quiz\n\nExample questions:\n• "A pitcher should follow through toward the target" → True\n• "You should swing at every pitch" → False\n\nYou can add as many questions as you want. Edit or delete quizzes anytime from the management page.\n\nAthletes earn Pop Quiz badges for completing quizzes (Beginner → Bronze → Silver → Gold)!',
    actions: [{ label: 'Manage Quizzes', href: '/admin/questionnaires' }],
    followUp: ['How do I assign a quiz?', 'How do I see responses?', 'How do I create a course?'],
    role: 'coach',
  },
  {
    keywords: ['assign quiz', 'assign questionnaire', 'send quiz', 'give quiz to athlete'],
    title: 'Assigning Pop Quizzes to Athletes',
    response: 'To assign a pop quiz to athletes:\n\n1. Go to Admin → Pop Quiz\n2. Find the quiz you want to assign\n3. Click the person+ icon (Assign)\n4. Check the box next to each athlete\n5. Optionally set a due date and add notes\n6. Click "Assign"\n\nThe quiz appears immediately in the athlete\'s Pop Quiz page as "Pending." They\'ll see any notes or due date you set.\n\nYou can assign the same quiz to multiple athletes at once!',
    actions: [{ label: 'Manage Quizzes', href: '/admin/questionnaires' }],
    role: 'coach',
  },
  {
    keywords: ['quiz responses', 'see quiz results', 'athlete quiz score', 'view responses', 'quiz results'],
    title: 'Viewing Quiz Responses',
    response: 'To see how athletes did on a pop quiz:\n\n1. Go to Admin → Pop Quiz\n2. Find the quiz\n3. Click the chart icon (Responses)\n4. You\'ll see each assigned athlete with:\n   • Completion status (Pending or Completed)\n   • Score (e.g., "4/5 — 80%")\n   • Date completed\n\nThis helps you track which athletes are keeping up with their game knowledge and how well they understand concepts.',
    actions: [{ label: 'View Quizzes', href: '/admin/questionnaires' }],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── EDIT AVAILABILITY (COACH) ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['edit availability', 'edit slot', 'change slot', 'modify availability', 'update time slot', 'edit time slot'],
    title: 'Editing Availability Slots',
    response: 'You can edit your existing availability slots:\n\n1. Go to Admin → Availability\n2. Find the slot you want to change\n3. Click the pencil (Edit) icon\n4. Update the start time, end time, location, or linked service\n5. Save changes\n\nImportant: If a slot has active bookings, you\'ll see a warning. Changing the time will affect booked athletes — consider reaching out to let them know.\n\nYou can also delete slots that have no bookings. Slots with active bookings cannot be deleted (cancel the bookings first).',
    actions: [{ label: 'Manage Availability', href: '/admin/availability' }],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── EDIT BOOKINGS (COACH) ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['edit booking', 'booking notes', 'coach notes', 'internal notes', 'add notes to booking', 'no show', 'no-show', 'mark no show'],
    title: 'Editing Bookings & Notes',
    response: 'You can edit bookings to add notes and update status:\n\n1. Go to Calendar (Confirm/Book) in the sidebar\n2. Find the booking\n3. Click the pencil (Edit) icon\n4. You can update:\n   • Coach Notes — visible to the athlete (e.g., "Great session! Work on follow-through")\n   • Internal Notes — private, only coaches/admins see these\n   • Status — Confirm, Complete, or Cancel the booking\n5. Save changes\n\nNo-Shows:\n• Click the "No Show" button on any confirmed booking\n• This marks the session as missed and tracks attendance\n\nAll notes are saved and visible when you review past sessions.',
    actions: [{ label: 'Calendar', href: '/admin/bookings' }],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── BOOK FOR ATHLETE (COACH) ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['book for athlete', 'create booking', 'admin booking', 'book on behalf', 'on-site payment', 'on site payment', 'comp booking', 'complimentary booking', 'manual booking'],
    title: 'Booking for an Athlete (Coach Tool)',
    response: 'You can create bookings on behalf of athletes — this also blocks the time slot so nobody else can take it!\n\nWhere to find it:\n• Admin Home → orange "Book for Athlete" button (top right)\n• Calendar (Confirm/Book) page → "Book for Athlete" button at top\n• Availability page → orange tip banner at top links here too\n• Coach Locker → "Book for Athlete" quick link\n\nHow it works:\n1. Click "Book for Athlete" from any of the locations above\n2. Select the athlete from the dropdown\n3. Pick an available slot (date + time)\n4. Select the service/training type\n5. Choose a payment method:\n   • Stripe — normal online payment\n   • On-Site — athlete pays in person (cash/card at facility)\n   • Use Package — deducts from athlete\'s active session pack\n   • Complimentary — free session (no charge)\n6. Add optional notes\n7. Click "Create Booking"\n\nThe time slot is immediately blocked — no one else can book that slot. Great for walk-ins, phone bookings, transferring clients from another system, or giving comp sessions!',
    actions: [{ label: 'Book for Athlete', href: '/admin/bookings?action=book' }],
    followUp: ['How do I edit a booking?', 'How do I manage availability?'],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── VIDEO ON SERVICES (COACH) ──
  // ════════════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════════════
  // ── AUTOMATED EMAILS ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['email notification', 'booking email', 'confirmation email', 'automated email', 'do i get an email', 'will i get notified', 'email confirmation'],
    title: 'Automated Email Notifications',
    response: 'PSP.Pro sends professional branded emails automatically — no manual follow-up needed!\n\nFor Athletes:\n• Booking Confirmation — sent after card payment with full session details, coach, location, and a link to your dashboard\n• Pay-on-Site Confirmation — sent when you book without a card, with a reminder to bring payment\n• Cancellation Notice — sent if a session is cancelled, with a link to rebook\n\nFor Coaches:\n• New Booking Alert — sent every time an athlete books a session, with their name, service, date/time, and payment method\n\nAll emails match the PSP.Pro brand design and include direct links to your dashboard.',
    actions: [{ label: 'Book a Session', href: '/booking' }],
  },

  // ════════════════════════════════════════════════════════════
  // ── GALLERY / MEDIA (ATHLETE-FACING) ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['gallery', 'photos', 'media', 'images', 'pictures', 'training photos', 'highlight', 'highlights', 'content hub'],
    title: 'Content Hub',
    response: 'The Content Hub is your one-stop dashboard for managing all content on PSP.Pro:\n\n**Blog Posts tab:**\n• Create, edit, and publish blog articles\n• Upload images and GIFs directly into posts (max 5MB each)\n• Embed YouTube or Vimeo videos inline with one click\n• Upload or paste a thumbnail image for each post\n• Toggle posts between Draft and Published\n• Set categories, thumbnails, and featured status\n• Content supports Markdown formatting\n\n**Media Gallery tab:**\n• Training Drills — instructional photos and clips\n• Athlete Progress — before/after and milestone shots\n• Facility — our training space and equipment\n• Session Highlights — action shots from sessions\n• Testimonials — athlete stories and results\n• Events — camps, clinics, and special events\n\nFind it in your sidebar under "Content" or go to Admin → Content Hub.',
    actions: [{ label: 'Content Hub', href: '/admin/media' }],
    role: 'coach',
  },

  // ── BLOG MEDIA (COACH) — How to add images/videos to blog posts ──
  {
    keywords: ['blog image', 'blog photo', 'blog video', 'add image to blog', 'add photo to blog', 'add video to blog', 'embed video blog', 'upload image blog', 'blog gif', 'blog thumbnail', 'blog media', 'add picture to post', 'insert image', 'insert video'],
    title: 'Adding Images & Videos to Blog Posts',
    response: 'You can add rich media directly to your blog posts!\n\n📸 Adding Images/GIFs:\n1. Open the blog editor (Content Hub → Blog tab → New Post or Edit)\n2. Click the "Add Image" button in the toolbar above the content area\n3. Pick a JPG, PNG, GIF, or WebP file (max 5MB)\n4. The image uploads and auto-inserts into your content at the cursor position\n5. GIFs keep their animation!\n\n🎥 Embedding Videos:\n1. Click the "Embed Video" button in the toolbar\n2. Paste a YouTube or Vimeo URL\n3. The video embeds inline — readers see a full video player on the published post\n\n🖼️ Thumbnail Image:\n• Click "Upload Thumbnail" to upload a cover image for the post\n• Or paste a URL in the text field\n• The thumbnail shows on the blog listing page and at the top of the article\n\nTips:\n• Images are auto-optimized (resized to 1200px wide, compressed)\n• You can also type Markdown manually: ![alt text](/media/blog/image.jpg)\n• For videos, type: [video](https://youtube.com/watch?v=...)',
    actions: [{ label: 'Content Hub', href: '/admin/media' }],
    followUp: ['How do I create a blog post?', 'What is the Content Hub?'],
    role: 'coach',
  },

  // ── CREATING A BLOG POST (COACH) ──
  {
    keywords: ['create blog', 'write blog', 'new blog post', 'publish blog', 'blog post', 'write article', 'create article', 'how to blog'],
    title: 'Creating a Blog Post',
    response: 'To create a blog post:\n\n1. Go to Admin → Content Hub (or sidebar → Content)\n2. Make sure you\'re on the "Blog Posts" tab\n3. Click the orange "New Post" button\n4. Fill in the form:\n   • Title — auto-generates the URL slug\n   • Category — Pitching, Hitting, Recovery, Speed & Agility, Nutrition, Mental Game, Strength, Coaching Tips, or General\n   • Read Time — e.g., "5 min read"\n   • Thumbnail — upload an image or paste a URL\n   • Excerpt — short summary shown on the blog listing page\n   • Content — write using Markdown with the media toolbar\n5. Use the toolbar to add images (Add Image button) or embed YouTube/Vimeo videos (Embed Video button)\n6. Toggle "Published" when you\'re ready to go live (or keep as Draft)\n7. Toggle "Featured" to highlight the post at the top of the blog page\n8. Click "Create Post"\n\nYour post is live at /blog/your-slug-here!\n\nMarkdown tips:\n• ## for headings\n• **bold** for emphasis\n• - for bullet points\n• 1. for numbered lists',
    actions: [{ label: 'Content Hub', href: '/admin/media' }, { label: 'View Blog', href: '/blog' }],
    followUp: ['How do I add images to a blog post?', 'How do I embed a video?'],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── ANALYTICS (COACH) ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['analytics', 'revenue', 'reports', 'business stats', 'how much money', 'earnings', 'performance report', 'business analytics'],
    title: 'Analytics Dashboard (Coach Tool)',
    response: 'The Analytics page gives you a full business overview:\n\n📊 Key Metrics:\n• Total Revenue — all-time and filtered by period\n• Total Bookings — confirmed sessions\n• Active Athletes — athletes with recent activity\n• Completion Rate — percentage of booked sessions completed\n\n📈 Growth Indicators:\nEach metric shows period-over-period change (up or down arrow) so you can see trends.\n\n🔍 Time Filters:\n• Last 7 Days\n• Last 30 Days\n• Last 90 Days\n\n📋 Recent Bookings Table:\nShows athlete name, service, date, amount, and payment status.\n\nUse this to track your business growth, spot trends, and plan your schedule!',
    actions: [{ label: 'View Analytics', href: '/admin/analytics' }],
    role: 'coach',
  },

  {
    keywords: ['video url', 'service video', 'add video to service', 'training video on service', 'demo video'],
    title: 'Adding Videos to Services',
    response: 'You can attach a demo/promo video to any lesson type:\n\n1. Go to Admin → Lesson Builder\n2. Click Edit on any lesson type\n3. Scroll to the "Video URL" field\n4. Paste a YouTube, Vimeo, or direct video link\n5. Save\n\nThe video will appear on the Pricing page as a play button. Athletes (and visitors) can watch it to see what the training looks like before booking!\n\nThis is great for showcasing your training style and helping athletes choose the right lesson.',
    actions: [{ label: 'Lesson Builder', href: '/admin/services' }],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── ORGANIZATIONS / MULTI-TENANT (COACH/ADMIN) ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['organization', 'org', 'academy', 'team org', 'create org', 'organizations', 'white label', 'white-label', 'multi tenant', 'my academy', 'coaching academy', 'training academy'],
    title: 'Organizations (Multi-Tenant)',
    response: 'Organizations let you run a fully branded coaching academy under your own name — powered by PSP.Pro behind the scenes!\n\nWhat you can do:\n• Create an org with a custom name, slug, colors, and tagline\n• Get a public landing page at propersports.pro/org/your-slug\n• Invite coaches and athletes as members\n• Connect Stripe to receive automatic split payouts\n• Set white-label branding (primary color, secondary color, logo, about text)\n• Control self-signup and approval settings\n\nWho can create orgs:\n• Coaches, Admins, and Master Admins\n\nFind it:\n• Admin → Organizations (sidebar)\n• Or go to /admin/org directly',
    actions: [{ label: 'Organizations', href: '/admin/org' }],
    followUp: ['How do I create an organization?', 'How does the org landing page work?', 'How do I connect Stripe to my org?'],
    role: 'coach',
  },

  {
    keywords: ['create organization', 'new org', 'set up org', 'start academy', 'new academy', 'how to create org'],
    title: 'Creating an Organization',
    response: 'Here\'s how to create your own coaching organization:\n\n1. Go to Admin → Organizations (sidebar)\n2. Click the orange "New Org" button\n3. Fill in:\n   • Org Name — e.g., "Elite Athletics Academy"\n   • Slug — auto-generated from name, used in your URL: /org/elite-athletics\n   • Tagline — optional motto or short description\n   • Primary Color — your brand color for buttons and highlights\n   • Secondary Color — accent color\n   • Platform Fee % — PSP keeps this % of each booking (default 15%)\n4. Click "Create Organization"\n\nYou\'re automatically added as the org owner. You can invite coaches and athletes right after!\n\nYour public landing page goes live immediately at:\npropersports.pro/org/your-slug',
    actions: [{ label: 'Create Org', href: '/admin/org' }],
    followUp: ['How do I invite members to my org?', 'How do I customize my org branding?', 'How do I connect Stripe payouts?'],
    role: 'coach',
  },

  {
    keywords: ['org landing page', 'org page', 'public org page', 'organization page', 'academy page', 'athlete booking page', 'org booking link'],
    title: 'Organization Public Landing Page',
    response: 'Every org gets a branded public landing page athletes can visit — no login required!\n\nYour page lives at:\npropersports.pro/org/your-slug\n\nWhat athletes see:\n• Your org name, tagline, and colors throughout\n• Hero headline and subheadline (set in Branding tab)\n• About section (custom text you write)\n• Your coaches listed with their names and photos\n• "Book Now" button → sends athlete to the booking page with your org ID pre-attached\n• "Join the Team" button (if self-signup is enabled)\n\nHow to customize it:\n1. Go to Admin → Organizations → Branding tab\n2. Update name, tagline, primary/secondary colors\n3. Add a hero headline, subheadline, and about text\n4. Save — changes are live instantly\n\nShare your link on social media, emails, or your own website!',
    actions: [{ label: 'Organizations', href: '/admin/org' }],
    followUp: ['How do I edit my org branding?', 'How do I add coaches to my org?', 'How does booking work for my org?'],
    role: 'coach',
  },

  {
    keywords: ['invite member', 'add member org', 'add coach to org', 'add athlete to org', 'org members', 'team members', 'manage org members'],
    title: 'Inviting Members to Your Org',
    response: 'You can add coaches and athletes directly to your organization:\n\n1. Go to Admin → Organizations\n2. Select your org from the left\n3. Click the "Members" tab\n4. In the "Add Member" form:\n   • Enter their email address\n   • Choose a role: Athlete, Coach, or Admin\n   • Click "Add"\n\nThe member is added instantly (they need an existing PSP.Pro account).\n\nMember roles:\n• Owner — full control (that\'s you)\n• Admin — can manage org settings and members\n• Coach — can run sessions and view athletes in the org\n• Athlete — can book sessions scoped to your org\n\nTo remove a member, click the X next to their name in the member list.\n\nNote: Only active PSP.Pro accounts can be added. Athletes without accounts should sign up at /signup first.',
    actions: [{ label: 'Manage Org Members', href: '/admin/org' }],
    followUp: ['How do I remove a member?', 'What can coaches in my org do?', 'How do I set up payouts?'],
    role: 'coach',
  },

  {
    keywords: ['org branding', 'customize org', 'org colors', 'white label branding', 'brand my org', 'org logo', 'org tagline', 'org hero', 'org about text'],
    title: 'Customizing Org Branding',
    response: 'Your org can have completely custom branding — colors, name, tagline, and more!\n\n1. Go to Admin → Organizations → Branding tab\n2. Update:\n   • Org Name — shown on your landing page header\n   • Tagline — short motto shown under your name\n   • Primary Color — buttons, accents, and highlights on your landing page\n   • Secondary Color — secondary text, links, and sport badges\n3. You\'ll see a live preview at the bottom showing how it looks\n4. Click "Save Branding"\n\nAdvanced branding (set via the PATCH API or future settings):\n• Hero Headline — big text at the top of your landing page\n• Hero Subheadline — subtitle under the hero\n• About Text — paragraph about your academy\n• Logo URL — image shown in the header\n\nColors affect your public landing page at propersports.pro/org/your-slug. Each org can have totally different colors!',
    actions: [{ label: 'Org Branding', href: '/admin/org' }],
    followUp: ['How do I update my org landing page?', 'How do I add a logo?', 'Where is my org page?'],
    role: 'coach',
  },

  {
    keywords: ['stripe connect', 'connect stripe', 'payouts', 'org payouts', 'split payment', 'receive payment', 'payout account', 'bank account', 'connect bank', 'coach payout', 'revenue split', 'platform fee', 'how do i get paid'],
    title: 'Stripe Connect & Org Payouts',
    response: 'Connect your Stripe account to automatically receive your share of every booking payment!\n\nHow it works:\n1. Athlete pays the full session price at checkout\n2. PSP platform fee is automatically deducted (default 15%)\n3. The remainder is automatically transferred to your bank via Stripe\n4. A payout ledger entry is recorded for your records\n\nHow to connect:\n1. Go to Admin → Organizations → Payouts tab\n2. Click "Connect Stripe Account"\n3. You\'ll be redirected to Stripe Express onboarding (~5 minutes)\n4. Enter your business info and bank account\n5. After completing, you\'ll return to PSP.Pro with status "Connected"\n\nSplit example (with 15% platform fee):\n• Athlete pays $75 for a session\n• PSP keeps $11.25 (15%)\n• You receive $63.75 (85%)\n\nChecking your status:\n• Payouts tab shows "Connected" with your revenue % and Stripe account ID\n• Payouts typically arrive in 2 business days\n\nIf you don\'t connect Stripe, all payments go to PSP.Pro (normal flow).',
    actions: [{ label: 'Org Payouts', href: '/admin/org' }],
    followUp: ['How much do I keep from each booking?', 'What is the platform fee?', 'How do I set up an org?'],
    role: 'coach',
  },

  {
    keywords: ['org settings', 'organization settings', 'self signup org', 'require approval', 'org self signup', 'deactivate org', 'org active'],
    title: 'Organization Settings',
    response: 'Control how your org works from the Settings tab:\n\n⚙️ Allow Self-Signup\n• When ON: Athletes can join your org without an invite\n• When OFF: Only invited members can join\n• Toggle instantly — changes are immediate\n\n✅ Require Coach Approval\n• When ON: New athletes must be approved before accessing org content\n• When OFF: Athletes can self-join and get instant access\n• Good for keeping your roster tight and high-quality\n\nDanger Zone (Master Admin only):\n• Deactivate Organization — disables the org and removes the public landing page\n• This does NOT delete data — it just makes the org inactive\n\nYou can find Settings by:\n1. Going to Admin → Organizations\n2. Selecting your org\n3. Clicking the "Settings" tab',
    actions: [{ label: 'Org Settings', href: '/admin/org' }],
    role: 'coach',
  },

  {
    keywords: ['org booking', 'book through org', 'org athlete booking', 'book for org athlete', 'org checkout', 'org session', 'booking my org'],
    title: 'Bookings Through Your Org',
    response: 'When athletes book from your org\'s landing page, their bookings are automatically tagged to your org!\n\nHere\'s the full flow:\n1. Athlete visits propersports.pro/org/your-slug\n2. Clicks "Book Now"\n3. Booking page opens with your org ID pre-attached (?org=your-org-id)\n4. Athlete selects service, date, time, and pays\n5. Booking is saved in the database tagged to your org\n6. If you have Stripe Connect enabled, the payout split happens automatically\n\nYou can see org-tagged bookings in:\n• Admin → Calendar (Confirm/Book) — your normal booking management page\n\nThe org system is additive — all existing booking features (confirm, notes, metrics, complete, cancel) work exactly the same. Org just adds attribution and split payments on top.',
    actions: [{ label: 'Calendar', href: '/admin/bookings' }, { label: 'Organizations', href: '/admin/org' }],
    followUp: ['How do Stripe payouts work?', 'How do I confirm bookings?', 'How do I view my org page?'],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── ELITE MEMBERSHIP DISCOUNT ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['elite discount', 'elite member', 'elite membership', '10 percent off', '10% off', 'auto discount', 'membership discount', 'elite tier', 'elite benefit', 'elite perks'],
    title: 'Elite Membership Discount',
    response: 'Elite members get an automatic 10% discount on every booking!\n\nHow it works:\n• When you check out, the system detects your Elite membership tier\n• A 10% discount is automatically applied to your session price\n• You\'ll see the discount displayed on the confirmation step before paying\n• The original price is shown crossed out with the new price highlighted\n\nExample:\n• Session costs $75 → Elite price: $67.50 (save $7.50!)\n\nThe discount works for both card payments and pay-on-site bookings. It also stacks with promo codes — Elite discount applies first, then the promo code on top!\n\nAsk about our membership tiers on the Pricing page.',
    actions: [{ label: 'View Pricing', href: '/pricing' }, { label: 'Book a Session', href: '/booking' }],
    followUp: ['How do I become an Elite member?', 'What are promo codes?', 'How do I book a session?'],
  },

  // ════════════════════════════════════════════════════════════
  // ── PROMO CODES ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['promo code', 'promo', 'discount code', 'coupon', 'coupon code', 'promotion', 'promotional code', 'apply code', 'enter code'],
    title: 'Promo & Discount Codes',
    response: 'You can apply promo codes at checkout for extra savings!\n\nHow to use a promo code:\n1. Go through the booking flow normally\n2. On the confirmation step (Step 4), you\'ll see a "Have a promo code?" section\n3. Enter your code and click "Apply"\n4. If valid, the discount is applied instantly and you\'ll see the new total\n\nTypes of discounts:\n• Percentage off (e.g., 20% off)\n• Fixed amount off (e.g., $10 off)\n\nPromo codes may have:\n• Expiration dates\n• Usage limits\n• Minimum purchase amounts\n• Category restrictions (bookings only, packages only, etc.)\n\nPro tip: If you\'re an Elite member, your 10% membership discount stacks with promo codes for maximum savings!',
    actions: [{ label: 'Book a Session', href: '/booking' }],
    followUp: ['What is the Elite discount?', 'How do I book a session?'],
  },
  {
    keywords: ['create promo', 'manage promos', 'admin promo', 'make promo code', 'new promo code', 'promo admin'],
    title: 'Managing Promo Codes (Coach Tool)',
    response: 'Coaches and admins can create and manage promo codes!\n\nGo to Admin → Promo Codes (sidebar)\n\nCreate a promo code:\n1. Click "Create Promo Code"\n2. Set the code (e.g., "SPRING20")\n3. Choose discount type: Percentage or Fixed Amount\n4. Set the discount value (e.g., 20 for 20%)\n5. Optional: Set max uses, expiration date, and minimum purchase amount\n6. Choose what it applies to: All, Bookings only, Packages only, or Memberships only\n7. Click "Create"\n\nManage codes:\n• Copy any code to clipboard with one click\n• Toggle codes active/inactive\n• See usage count vs. max uses\n• Delete expired or unused codes\n\nShare codes on social media, in emails, or give to walk-in clients for a deal!',
    actions: [{ label: 'Promo Codes', href: '/admin/promos' }],
    followUp: ['How does the Elite discount work?', 'How do I book for an athlete?'],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── PAYMENT PLANS / INSTALLMENTS ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['payment plan', 'installment', 'installments', 'pay in parts', 'split payment', 'monthly payment', 'pay over time', 'financing'],
    title: 'Payment Plans & Installments',
    response: 'For training packages over $200, you can split the payment into installments!\n\nHow it works:\n• Packages $200-$400: Split into 2 monthly payments\n• Packages $400-$600: Split into 3 monthly payments\n• Packages $600+: Split into 4 monthly payments\n\nExample: 10-Session Pack ($675)\n• 3 payments of $225/month instead of $675 upfront\n\nYour package activates immediately after the first payment — you don\'t have to wait until all payments are complete to start training!\n\nPayments are processed automatically each month through Stripe. You\'ll get an email receipt for each payment.\n\nLook for the "Pay in installments" option on the booking confirmation step when purchasing qualifying packages.',
    actions: [{ label: 'View Packages', href: '/pricing' }, { label: 'Book a Session', href: '/booking' }],
    followUp: ['What packages are available?', 'How do I book a session?'],
  },

  // ════════════════════════════════════════════════════════════
  // ── IN-APP MESSAGING ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['message', 'messages', 'messaging', 'chat with coach', 'send message', 'direct message', 'dm', 'inbox', 'conversation', 'talk to coach', 'message coach', 'message athlete'],
    title: 'In-App Messaging',
    response: 'PSP.Pro has built-in messaging so you can chat directly with your coaches!\n\nHow to use it:\n1. Go to Messages from your sidebar\n2. Start a new conversation by clicking "New" and selecting a contact\n3. Type your message and hit Send\n4. Messages are delivered in real-time — no refreshing needed!\n\nWho can you message?\n• Athletes can message coaches they\'ve booked sessions with\n• Coaches can message any of their athletes\n\nFeatures:\n• Real-time delivery (messages appear instantly)\n• Unread count badge in the sidebar\n• Full conversation history\n• Works on mobile and desktop\n\nPerfect for asking about drill feedback, scheduling questions, or sharing training updates!',
    actions: [{ label: 'Messages', href: '/messages' }],
    followUp: ['How do I book a session?', 'How do drills work?'],
  },

  // ════════════════════════════════════════════════════════════
  // ── CALENDAR SYNC ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['calendar sync', 'calendar subscribe', 'ical', 'google calendar', 'apple calendar', 'outlook calendar', 'add to calendar', 'sync calendar', 'calendar feed', 'calendar export'],
    title: 'Calendar Sync',
    response: 'Sync your PSP training sessions with your personal calendar!\n\nTwo options:\n\n1. Subscribe (auto-updating)\n• Go to My Lessons (Sessions page)\n• Click "Sync Calendar" at the top\n• The subscription URL is copied to your clipboard\n• Paste it into Google Calendar, Apple Calendar, or Outlook\n• Your sessions will automatically appear and stay updated!\n\n2. Add to Calendar (one-time)\n• After booking a session, click "Add to Calendar" on the success page\n• Downloads a calendar file for that specific session\n\nThe calendar feed includes:\n• Session date and time\n• Coach name\n• Session type\n• Location\n• Status (confirmed, pending, etc.)\n\nAny changes to your bookings (reschedules, cancellations) automatically update in your synced calendar!',
    actions: [{ label: 'My Sessions', href: '/sessions' }],
    followUp: ['How do I book a session?', 'Can I cancel a session?'],
  },

  // ════════════════════════════════════════════════════════════
  // ── RSVP / ATTENDANCE TRACKING ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['rsvp', 'attendance', 'check in', 'checkin', 'check-in', 'going', 'maybe', 'cant make it', 'attending', 'confirm attendance', 'no show tracking'],
    title: 'RSVP & Attendance',
    response: 'Let your coaches know if you can make it to your sessions!\n\nFor Athletes:\n• Go to My Lessons (Sessions page)\n• Each upcoming session has RSVP buttons: Going, Maybe, or Can\'t go\n• Click to update your status — coaches see it instantly\n• You can change your RSVP anytime before the session\n\nFor Coaches:\n• The Calendar page shows a "Check In" button on confirmed bookings\n• Click "Check In" when the athlete arrives\n• Mark "No-Show" if the athlete doesn\'t show up\n• Track attendance patterns over time with the No-Shows stat counter\n\nRSVP helps coaches plan sessions better and track who\'s committed to training!',
    actions: [{ label: 'My Sessions', href: '/sessions' }],
    followUp: ['How do I cancel a session?', 'What is the cancellation policy?'],
  },
  {
    keywords: ['coach check in', 'mark attendance', 'attendance tracking coach', 'track no shows', 'athlete check in'],
    title: 'Attendance Tracking (Coach Tool)',
    response: 'Track your athletes\' attendance right from the Calendar page!\n\nCheck-In:\n1. Go to Calendar (Confirm/Book)\n2. Find a confirmed booking for today\n3. Click "Check In" when the athlete arrives\n4. The button changes to "Checked In" with a timestamp\n\nNo-Shows:\n• If an athlete doesn\'t show up, click "No-Show"\n• No-shows are tracked in the stats bar at the top\n• This helps you identify attendance patterns\n\nThe stats row now shows:\n• Total Bookings, Confirmed, Pending, Revenue, and No-Shows\n\nUse this data to follow up with athletes who miss sessions!',
    actions: [{ label: 'Calendar', href: '/admin/bookings' }],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── PROGRESS REPORTS ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['progress report', 'monthly report', 'performance report', 'report card', 'email report', 'send report', 'athlete report', 'training report'],
    title: 'Progress Reports',
    response: 'PSP.Pro can generate detailed progress reports for athletes!\n\nFor Athletes:\n• Go to "Report" in your sidebar\n• See a full summary of your last 30 days:\n  - Quick stats: sessions completed, drills done, new personal records\n  - Metrics comparison: current vs. previous period with improvement arrows\n  - Goals progress: see how close you are to each target\n  - Coach notes from your sessions\n  - Personal records achieved\n\nFor Coaches:\n• Go to Admin → Athletes → click an athlete\n• Click "Send Report" button at the top\n• A branded progress report email is sent to the athlete\n• The report covers the last 30 days of training data\n\nReports are auto-generated from real training data — no manual work needed!',
    actions: [{ label: 'View My Report', href: '/progress-report' }],
    followUp: ['How do I track my progress?', 'What are personal records?'],
  },
  {
    keywords: ['send progress report', 'email progress report', 'generate report', 'report for athlete', 'coach send report'],
    title: 'Sending Progress Reports (Coach Tool)',
    response: 'Send professional progress reports to your athletes with one click!\n\n1. Go to Admin → Athletes\n2. Click on any athlete\n3. Click the "Send Report" button (top right, next to "Add Performance Data")\n4. The system generates a full 30-day progress report and emails it to the athlete\n\nThe email report includes:\n• Sessions completed and drills done\n• Performance metrics with before/after comparisons\n• Personal records achieved\n• Goals progress with completion percentages\n• Your coach notes from their sessions\n\nThe email is professionally branded with PSP.Pro design and a link to view the full dashboard.\n\nTip: Send reports monthly to keep athletes and parents engaged!',
    actions: [{ label: 'Manage Athletes', href: '/admin/athletes' }],
    role: 'coach',
  },

  // ════════════════════════════════════════════════════════════
  // ── WEARABLE / DEVICE DATA IMPORT ──
  // ════════════════════════════════════════════════════════════
  {
    keywords: ['wearable', 'device import', 'data import', 'rapsodo', 'blast motion', 'pocket radar', 'hittrax', 'csv import', 'import data', 'device data', 'sensor data', 'upload csv'],
    title: 'Device Data Import',
    response: 'Import training data from popular sports devices directly into PSP.Pro!\n\nSupported devices:\n• Rapsodo — pitching/hitting data (velocity, spin rate, break)\n• Blast Motion — bat sensor data (bat speed, attack angle, power)\n• Pocket Radar — speed readings (velocity)\n• HitTrax — batting cage data (exit velo, launch angle, distance)\n\nHow to import:\n1. Go to Admin → Data Import (sidebar)\n2. Select the athlete\n3. Choose the device type\n4. Upload the CSV file exported from your device\n5. Click "Import Data"\n\nThe data is automatically:\n• Parsed based on the device format\n• Mapped to the athlete\'s performance metrics\n• Added to their progress charts and personal records\n\nImport history tracks all uploads with status and record counts.',
    actions: [{ label: 'Data Import', href: '/admin/imports' }],
    followUp: ['How do I log metrics manually?', 'How do I view athlete performance?'],
    role: 'coach',
  },
]

// ─── Hype Coach Tone Enhancer ─────────────────────────────────
// Adds motivational coach energy to responses
const HYPE_OPENERS = [
  'Great question!',
  'Love that you asked!',
  'Let\'s break it down!',
  'Here we go!',
  'Oh yeah, I got you!',
  'Let\'s get into it!',
  'Glad you asked!',
  'Alright, let\'s work!',
]

const HYPE_CLOSERS = [
  '\n\nLet\'s get after it! Progression Over Perfection!',
  '\n\nYou got this! Progression Over Perfection!',
  '\n\nLet\'s go! Progression Over Perfection!',
  '\n\nNow let\'s make it happen!',
  '\n\nKeep grinding — Progression Over Perfection!',
  '\n\nThat\'s how we do it at PSP!',
]

function addCoachHype(response: string): string {
  // Use a simple hash of the response to pick consistent but varied openers/closers
  const hash = response.length + response.charCodeAt(0)
  const opener = HYPE_OPENERS[hash % HYPE_OPENERS.length]
  const closer = HYPE_CLOSERS[hash % HYPE_CLOSERS.length]
  return `${opener} ${response}${closer}`
}

// ─── Smart Matching Engine ───────────────────────────────────
function findBestMatch(query: string, userRole: RoleFilter): KBEntry {
  const q = query.toLowerCase().trim()
  const queryWords = q.split(/\s+/)

  // Filter entries by role: show 'all' + entries matching user's role
  const eligible = KNOWLEDGE_BASE.filter(entry => {
    const r = entry.role || 'all'
    if (r === 'all') return true
    if (r === userRole) return true
    // Coaches also see athlete content (they need to explain features to players)
    if (userRole === 'coach' && r === 'athlete') return true
    return false
  })

  // Score each entry
  let bestScore = 0
  let bestMatch: KBEntry | null = null

  for (const entry of eligible) {
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

    // Boost entries matching the user's exact role
    if (entry.role === userRole) {
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

  // Role-aware fallback
  const roleName = userRole === 'coach' ? 'Coach' : userRole === 'athlete' ? 'Athlete' : ''
  const roleHint = userRole === 'coach'
    ? '\n• Manage courses, drills & pop quizzes\n• Edit availability & bookings\n• Book sessions for athletes\n• Create blog posts with images & videos'
    : userRole === 'athlete'
    ? '\n• Your courses & video lessons\n• Pop Quiz — test your game IQ\n• Drills, progress & achievements'
    : '\n• How to join PSP.Pro\n• Training programs & pricing\n• What to expect'

  return {
    keywords: [],
    title: `Let's Figure This Out${roleName ? `, ${roleName}` : ''}!`,
    response: `No worries — I got you! Here's what I can help with:\n\n• Training programs & what sports we offer\n• Pricing, packages & how to save big\n• Booking sessions step by step${roleHint}\n• Account settings & login help\n• Location, hours & contact info\n• Walk through ANY page on the site\n\nTry asking "walk me through the pricing page" or "how do I book a session" — I know every page inside and out! Let's get after it!`,
    actions: QUICK_ACTIONS.map(a => ({ label: a.label, href: a.href })),
    followUp: userRole === 'coach'
      ? ['How do I create a course?', 'How do I create a quiz?', 'How do I book for an athlete?']
      : userRole === 'athlete'
      ? ['How do courses work?', 'What is Pop Quiz?', 'How do I book a session?']
      : ['What sports do you train?', 'How do I get started?', 'Tell me about pricing'],
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
  const { profile, isCoach, isAdmin } = useUserRole()

  // Determine role filter for KB matching
  const userRole: RoleFilter = isCoach || isAdmin ? 'coach' : profile ? 'athlete' : 'visitor'

  // Smooth auto-scroll: always scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame for smoother scroll timing
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    }
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
      const name = profile?.full_name?.split(' ')[0] || ''
      const greeting = userRole === 'coach'
        ? `What's up${name ? ` ${name}` : ''}, Coach! I'm your PSP Guide — think of me as your digital assistant coach. Need help with bookings, drills, courses, quizzes, the blog, or anything on this platform? Let's get it done! Progression Over Perfection!`
        : userRole === 'athlete'
        ? `Let's GO${name ? ` ${name}` : ''}! I'm your PSP Guide — here to help you crush your training goals. Ask me about your drills, sessions, courses, quizzes, progress tracking, or literally anything. I know every corner of this platform. Let's work!`
        : 'What\'s up! Welcome to PSP.Pro — where it\'s all about Progression Over Perfection! I\'m your PSP Guide and I know this entire platform inside and out. Ask me about training programs, pricing, how to join the team, or anything else. Let\'s get you started!'
      setMessages([
        {
          id: 'greeting',
          type: 'assistant',
          content: greeting,
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

    const match = findBestMatch(query.trim(), userRole)
    const hypedResponse = addCoachHype(match.response)
    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: hypedResponse,
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
              className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:left-auto sm:bottom-6 sm:right-6 z-[102] sm:w-[420px] h-[85vh] sm:h-auto sm:max-h-[700px] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-slate-900 border border-white/10"
            >
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-orange/10 to-cyan/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange" />
                  <span className="font-bold text-white">PSP.Pro Guide</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange/20 text-orange rounded-full font-medium">Smart</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex-shrink-0 px-4 py-2.5 border-b border-white/5 bg-white/5">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map((action, i) => (
                    <Link
                      key={i}
                      href={action.href}
                      onClick={() => setIsOpen(false)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-orange/20 text-white/80 hover:text-orange transition-colors border border-white/10 hover:border-orange/50"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
                        <div className="max-w-[90%] px-3 py-2.5 rounded-2xl rounded-tl-sm bg-white/10 text-white/90 text-sm whitespace-pre-line leading-relaxed">
                          {msg.module?.title && (
                            <div className="font-bold text-white mb-1.5 text-sm">
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
                    <p className="text-xs text-white/50 mb-2">Try asking:</p>
                    <div className="flex flex-col gap-1.5">
                      {getSuggestions().map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s.query)}
                          className="text-left px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-orange/10 text-white/80 hover:text-orange transition-all border border-white/10 hover:border-orange/30"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} className="h-2" />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex-shrink-0 px-4 py-3 border-t border-white/10 bg-slate-800/50">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask anything about PSP.Pro..."
                    className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange to-orange-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-white/40 mt-2 text-center">
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
