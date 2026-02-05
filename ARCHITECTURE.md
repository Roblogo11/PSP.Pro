# PSP.Pro - Athletic OS Architecture

## Overview
This document outlines the new architecture for Proper Sports Performance (PSP.Pro), transforming the ShockAI foundation into a premium athletic training platform.

## Design Philosophy
- **Aesthetic**: Higgsfield AI-inspired dark mode with glassmorphism
- **Utility**: SEMrush-style density and efficiency
- **Mobile-First**: Optimized for parents at softball fields
- **Performance**: SSR, optimized images, instant load times

## Color System

### Primary Palette
- **Deep Navy** (#050A18): Primary background, command center feel
- **Electric Orange** (#FF4B2B): Primary CTA, highlights, velocity indicators
- **Slate Gray** (#4A5568): Secondary UI elements, borders
- **Soft White** (#F7FAFC): Primary text

### Usage
- Navy: All backgrounds, panels, modals
- Orange: CTAs, progress bars, active states, glows
- Slate: Inactive states, secondary text, borders
- White: Primary text, high-contrast elements

## App Directory Structure

```
src/app/
├── (auth)/                          # Authentication group
│   ├── login/                       # Login page
│   ├── signup/                      # Signup page
│   └── layout.tsx                   # Auth layout wrapper
│
├── (dashboard)/                     # Protected dashboard group
│   ├── layout.tsx                   # Dashboard layout with sidebar
│   ├── locker/                      # The Athlete Locker (main dashboard)
│   │   └── page.tsx                 # SSR - Velocity chart, next session, drills
│   ├── drills/                      # The Drill Bank
│   │   ├── page.tsx                 # SSR - Video grid with filters
│   │   └── [id]/page.tsx            # Individual drill detail
│   ├── sessions/                    # Session history & upcoming
│   │   └── page.tsx                 # SSR - Calendar view
│   ├── progress/                    # Progress tracking
│   │   └── page.tsx                 # SSR - Charts & analytics
│   ├── booking/                     # Scheduling wrapper
│   │   └── page.tsx                 # Embedded booking tool
│   └── settings/                    # User settings
│       └── page.tsx                 # Profile, notifications
│
├── (marketing)/                     # Public marketing pages
│   ├── layout.tsx                   # Marketing layout
│   ├── page.tsx                     # Homepage
│   ├── about/                       # About PSP
│   ├── programs/                    # Training programs
│   ├── pricing/                     # Pricing tiers
│   ├── blog/                        # SEO blog (SSR)
│   │   ├── page.tsx                 # Blog index
│   │   └── [slug]/page.tsx          # Individual posts
│   └── contact/                     # Contact form
│
├── api/                             # API routes
│   ├── auth/                        # Auth endpoints
│   │   ├── signup/route.ts
│   │   └── login/route.ts
│   ├── drills/                      # Drill data
│   │   └── route.ts
│   ├── sessions/                    # Session booking
│   │   └── route.ts
│   └── velocity/                    # Velocity tracking
│       └── route.ts
│
├── layout.tsx                       # Root layout
├── globals.css                      # Global styles (Higgsfield theme)
└── not-found.tsx                    # 404 page
```

## Component Architecture

```
src/components/
├── layout/
│   ├── sidebar.tsx                  # Collapsible high-tech sidebar
│   ├── header.tsx                   # Top header (mobile menu trigger)
│   └── footer.tsx                   # Marketing footer
│
├── dashboard/
│   ├── velocity-chart.tsx           # Line chart with Recharts
│   ├── next-session-card.tsx        # Countdown widget
│   ├── assigned-drills.tsx          # Drill card grid
│   ├── stat-card.tsx                # Bento grid stat display
│   └── progress-ring.tsx            # Circular progress indicator
│
├── drills/
│   ├── drill-grid.tsx               # Video grid with hover preview
│   ├── drill-card.tsx               # Individual drill card
│   ├── drill-filter.tsx             # Tag filtering UI
│   └── drill-player.tsx             # Video player modal
│
├── booking/
│   └── booking-embed.tsx            # Styled wrapper for external tool
│
├── ui/                              # Reusable UI primitives
│   ├── button.tsx                   # Styled buttons
│   ├── card.tsx                     # Glass card component
│   ├── input.tsx                    # Form inputs
│   ├── modal.tsx                    # Modal dialog
│   └── avatar.tsx                   # User avatar
│
└── motion/                          # Framer Motion wrappers
    ├── fade-in.tsx                  # Fade in animation
    ├── slide-up.tsx                 # Slide up animation
    └── stagger-container.tsx        # Stagger children
```

## Data Layer

### Supabase Schema

```sql
-- Users (extends Supabase auth.users)
profiles (
  id uuid references auth.users,
  full_name text,
  avatar_url text,
  athlete_type text, -- 'baseball', 'softball', etc.
  age integer,
  parent_email text,
  created_at timestamp
)

-- Training Sessions
sessions (
  id uuid primary key,
  user_id uuid references profiles,
  scheduled_at timestamp,
  completed boolean,
  notes text,
  created_at timestamp
)

-- Drills
drills (
  id uuid primary key,
  title text,
  description text,
  video_url text,
  thumbnail_url text,
  tags text[], -- ['mechanics', 'speed', 'recovery']
  difficulty text, -- 'beginner', 'intermediate', 'advanced'
  duration integer, -- in seconds
  created_at timestamp
)

-- User Drill Completion
drill_completions (
  id uuid primary key,
  user_id uuid references profiles,
  drill_id uuid references drills,
  completed_at timestamp,
  velocity_mph numeric -- if applicable
)

-- Velocity Tracking
velocity_logs (
  id uuid primary key,
  user_id uuid references profiles,
  session_id uuid references sessions,
  velocity_mph numeric,
  recorded_at timestamp
)
```

## Key Features

### 1. The Athlete Locker (Dashboard)
- **Velocity Chart**: Line graph showing progress over time (Recharts)
- **Next Session**: Countdown timer with session details
- **Assigned Drills**: 3-4 featured drills with video thumbnails
- **Quick Stats**: Bento grid with total sessions, avg velocity, streak

### 2. The Drill Bank
- **Video Grid**: Hover to preview, click to play
- **Smart Filters**: By tags (Mechanics, Speed, Recovery)
- **Search**: Real-time search by title/description
- **Mobile Optimized**: Large tap targets, instant loading

### 3. Booking Wrapper
- **Seamless Integration**: Custom-styled wrapper around Calendly/Acuity
- **Brand Consistent**: Matches PSP.Pro aesthetic
- **Mobile-Friendly**: Optimized for on-the-go booking

## Performance Targets

- **LCP**: < 1.5s
- **FID**: < 50ms
- **CLS**: < 0.1
- **Mobile Score**: > 95

## SEO Strategy

### Local SEO (Virginia Beach/Norfolk)
- Dynamic metadata for each page
- Schema.org markup for LocalBusiness
- Blog content targeting local keywords
- Google My Business integration

### Technical SEO
- SSR for critical pages (drills, blog)
- Sitemap.xml with priority levels
- Robots.txt optimization
- Image optimization with Next.js Image

## Development Priorities

### Phase 1: Core Dashboard (Current)
1. ✅ Tailwind config with brand colors
2. ✅ Global CSS with glassmorphism
3. ⏳ Supabase setup
4. ⏳ Authentication flow
5. ⏳ Sidebar navigation
6. ⏳ Athlete Dashboard skeleton

### Phase 2: Drill Bank
1. Drill database setup
2. Video hosting strategy
3. Grid component with filters
4. Individual drill pages

### Phase 3: Data & Analytics
1. Velocity tracking UI
2. Session management
3. Progress charts
4. Export functionality

### Phase 4: Marketing & SEO
1. Public homepage
2. Blog setup
3. Metadata optimization
4. Performance audit

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics
- **Monitoring**: Sentry (optional)

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site
NEXT_PUBLIC_SITE_URL=https://propersports.pro

# External Services
CALENDLY_API_KEY=your-calendly-key (if using API)
```

## Deployment

- **Platform**: Vercel
- **Branch Strategy**:
  - `main` → Production (propersports.pro)
  - `dev` → Preview (dev.propersports.pro)
- **CI/CD**: Automatic deployments on push
- **Edge Functions**: Vercel Serverless for API routes
