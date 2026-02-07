# PSP.Pro Migration Guide

## Overview
This guide walks through migrating the ShockAI foundation to the PSP.Pro Athletic OS platform.

## ✅ Phase 1: Foundation (COMPLETED)

### What We Built
1. **Premium Theme System**
   - [tailwind.config.ts](tailwind.config.ts) - Deep Navy, Electric Orange, glassmorphism
   - [src/app/globals.css](src/app/globals.css) - Higgsfield-inspired styling
   - Custom animations, glow effects, and Bento grid utilities

2. **Supabase Integration**
   - Client utilities for browser components
   - Server utilities for SSR/API routes
   - Middleware for auth session management
   - TypeScript types for database schema

3. **Core Dashboard Components**
   - High-tech collapsible sidebar (desktop + mobile)
   - Velocity chart with Recharts
   - Next session countdown widget
   - Stat cards with Bento grid layout
   - Athlete Locker dashboard page

4. **Architecture Documentation**
   - Complete app/ directory structure
   - Database schema design
   - Component organization
   - SEO strategy for Virginia Beach/Norfolk

## 🚧 Phase 2: Database & Authentication (NEXT)

### Supabase Setup

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com/dashboard
   # Create new project
   # Copy your project URL and anon key
   ```

2. **Run Database Migrations**
   Create these tables in Supabase SQL Editor:

   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Profiles table (extends auth.users)
   CREATE TABLE public.profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     full_name TEXT,
     avatar_url TEXT,
     athlete_type TEXT CHECK (athlete_type IN ('baseball', 'softball', 'other')),
     age INTEGER,
     parent_email TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   -- Enable Row Level Security
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

   -- Profiles are viewable by everyone, but only updatable by the user
   CREATE POLICY "Public profiles are viewable by everyone"
     ON public.profiles FOR SELECT
     USING (true);

   CREATE POLICY "Users can update own profile"
     ON public.profiles FOR UPDATE
     USING (auth.uid() = id);

   -- Sessions table
   CREATE TABLE public.sessions (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
     scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
     completed BOOLEAN DEFAULT FALSE,
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own sessions"
     ON public.sessions FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can create own sessions"
     ON public.sessions FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Drills table (admin-managed)
   CREATE TABLE public.drills (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     video_url TEXT NOT NULL,
     thumbnail_url TEXT,
     tags TEXT[] DEFAULT '{}',
     difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
     duration INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Drills are viewable by everyone"
     ON public.drills FOR SELECT
     USING (true);

   -- Drill completions
   CREATE TABLE public.drill_completions (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
     drill_id UUID REFERENCES public.drills(id) ON DELETE CASCADE,
     completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     velocity_mph NUMERIC(5,2)
   );

   ALTER TABLE public.drill_completions ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own completions"
     ON public.drill_completions FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can create own completions"
     ON public.drill_completions FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Velocity logs
   CREATE TABLE public.velocity_logs (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
     session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
     velocity_mph NUMERIC(5,2) NOT NULL,
     recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   ALTER TABLE public.velocity_logs ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own velocity logs"
     ON public.velocity_logs FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can create own velocity logs"
     ON public.velocity_logs FOR INSERT
     WITH CHECK (auth.uid() = user_id);
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.local.example .env.local
   # Fill in your Supabase credentials
   ```

### Authentication Pages

Create these auth pages:

1. **Login Page**: `src/app/(auth)/login/page.tsx`
2. **Signup Page**: `src/app/(auth)/signup/page.tsx`
3. **Auth Layout**: `src/app/(auth)/layout.tsx`

### Protected Routes

Add auth protection to dashboard routes:

```typescript
// src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar />
      <main className="flex-1 lg:ml-0">{children}</main>
    </div>
  )
}
```

## 🎯 Phase 3: Drill Bank & Video System

### Requirements
1. Video hosting solution (Cloudflare Stream or Mux)
2. Drill grid component with filters
3. Video player with progress tracking
4. Admin drill upload interface

### Components to Build
- `src/components/drills/drill-grid.tsx`
- `src/components/drills/drill-card.tsx`
- `src/components/drills/drill-filter.tsx`
- `src/components/drills/video-player.tsx`
- `src/app/(dashboard)/drills/page.tsx`
- `src/app/(dashboard)/drills/[id]/page.tsx`

## 📊 Phase 4: Data Visualization & Analytics

### Features
1. Enhanced velocity tracking with more data points
2. Session history with performance metrics
3. Drill completion statistics
4. Progress reports (PDF export)
5. Parent dashboard view

### Components to Build
- Progress charts (Recharts)
- Data export functionality
- Email notifications (Resend)
- PDF generation (react-pdf)

## 🎨 Phase 5: Marketing Site

### Pages to Create
1. Public homepage with hero, features, testimonials
2. Programs page (Baseball & Softball)
3. Pricing page with tier comparison
4. About page (team, facility, mission)
5. Contact page with form
6. Blog (with CMS integration)

### SEO Optimization
- Dynamic metadata for all pages
- Schema.org markup (LocalBusiness, Organization)
- Sitemap.xml generation
- Local SEO for Virginia Beach/Norfolk

## 🚀 Phase 6: Launch Checklist

### Pre-Launch
- [ ] Complete Supabase setup
- [ ] Test authentication flow
- [ ] Upload sample drills to database
- [ ] Test mobile experience thoroughly
- [ ] Performance audit (Lighthouse > 95)
- [ ] Security audit
- [ ] Set up analytics (Vercel Analytics)
- [ ] Configure custom domain
- [ ] SSL certificate

### Launch Day
- [ ] Deploy to Vercel production
- [ ] Test all features in production
- [ ] Monitor error logs
- [ ] Send launch emails
- [ ] Social media announcements

### Post-Launch
- [ ] Gather user feedback
- [ ] Monitor performance metrics
- [ ] Iterate on UX based on data
- [ ] Add requested features

## 📝 Migration Notes

### Legacy ShockAI Code
All original ShockAI code has been **preserved** in the current file structure. When ready to clean up:

1. Archive old components:
   ```bash
   mkdir -p archive/shockai
   mv src/components/sections archive/shockai/
   mv src/components/navigation archive/shockai/
   ```

2. Archive old pages:
   ```bash
   mv src/app/about/ceo-* archive/shockai/
   mv src/app/studio archive/shockai/
   ```

### Configuration Files
- Old config: `src/config/site.ts` (ShockAI)
- New config: `src/config/psp-site.ts` (PSP.Pro)

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## 📚 Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)

## 🆘 Support

For questions or issues:
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Review Supabase logs for backend issues
- Check Vercel logs for deployment issues
- Test locally first before deploying

## 🎉 What's Working Now

You can immediately test:
1. **Visual Theme**: Run `npm run dev` and visit any page to see the new Higgsfield aesthetic
2. **Dashboard Layout**: Visit `/locker` to see the Bento grid dashboard (will need auth first)
3. **Components**: All UI components are ready and styled
4. **Responsive Design**: Test on mobile - the sidebar collapses to bottom navigation

## 🔜 Next Immediate Steps

1. Set up Supabase project (10 minutes)
2. Run database migrations (5 minutes)
3. Create auth pages (30 minutes)
4. Test complete user flow
5. Start building Drill Bank

---

Built with ⚡ by Claude Code for PSP.Pro
