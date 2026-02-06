# Apply Complete Booking & Coach-Athlete System

This migration adds a complete booking system with coach-athlete tracking, packages, and progress monitoring.

## 🚀 What This Adds

### New Tables:
1. **services** - Session types (pitching, hitting, group, etc.) with pricing
2. **bookings** - Complete scheduling with coach/athlete/service tracking
3. **packages** - Session bundles (5-pack, 10-pack, 20-pack)
4. **coach_athletes** - Which athletes belong to which coaches

### New Features:
- ✅ Coaches see which athletes booked their sessions
- ✅ Track payment status per session
- ✅ Session attendance (checked in, no-show, completed)
- ✅ Coach-athlete relationships for filtering
- ✅ Package tracking (sessions remaining)
- ✅ Progress views for coaches (velocity gains, drill completions)
- ✅ Migrates old `sessions` data to new `bookings` table

## 📋 Quick Steps

1. **Login to Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your PSP.Pro project

2. **Open SQL Editor**:
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

3. **Copy & Paste the SQL**:
   - Open: `supabase/migrations/008_complete_booking_system.sql`
   - Copy the entire file contents
   - Paste into the SQL Editor

4. **Run the Migration**:
   - Click **"Run"** button (or Cmd/Ctrl + Enter)
   - Should see: "Success" message
   - This will take a few seconds (creates tables, migrates data, sets up policies)

5. **Done!** ✅

## 🔍 What Changed

### Services Added
The migration automatically creates 5 default services:
- 1-on-1 Pitching ($75/hr)
- 1-on-1 Hitting ($75/hr)
- Group Training ($50/90min)
- Video Analysis ($50/30min)
- Recovery Session ($45/45min)

### Old Sessions Migrated
All existing `sessions` are automatically migrated to the new `bookings` table with:
- Athlete assigned
- Default service (1-on-1 Pitching)
- Status set correctly
- All notes preserved

### New Booking Flow
**Before:**
```
Session → user_id (athlete only)
```

**After:**
```
Booking → athlete_id + coach_id + service_id + package_id
        → status (pending/confirmed/completed/cancelled/no-show)
        → payment_status
        → attendance tracking
```

## 📊 New Views for Coaches

### 1. `coach_upcoming_sessions`
Shows coaches their upcoming sessions with athlete details:
```sql
SELECT * FROM coach_upcoming_sessions WHERE coach_id = 'your-coach-id';
```

### 2. `athlete_progress_summary`
Shows each athlete's progress for their assigned coach:
```sql
SELECT * FROM athlete_progress_summary WHERE coach_id = 'your-coach-id';
```

## 🔐 Permissions (RLS)

**Athletes:**
- View/create their own bookings
- View their own packages
- See their assigned coaches

**Coaches:**
- View bookings where they're assigned as coach
- View their assigned athletes
- Update their bookings (add notes, mark attendance)

**Admins:**
- Full access to all tables
- Manage coach-athlete relationships
- Create packages
- Override any booking

## ⚠️ Important Notes

1. **Old sessions table** - Not deleted, but new bookings use `bookings` table
2. **assigned_drills.assigned_by** - Changed from TEXT to UUID reference
3. **Default service** - Old sessions default to "1-on-1 Pitching"
4. **Coach assignment** - Old sessions have no coach assigned (NULL)

## 🧪 Testing

After migration, test:

1. **As Admin:**
   - View all bookings: Check `bookings` table
   - Create a package for an athlete
   - Assign athlete to a coach in `coach_athletes`

2. **As Coach:**
   - View upcoming sessions (should see bookings where coach_id matches)
   - View assigned athletes
   - Update booking notes

3. **As Athlete:**
   - View your bookings
   - View your packages
   - See remaining sessions

## 🆘 Troubleshooting

**Migration fails?**
- Check if you already ran it (tables might exist)
- Check for foreign key violations
- Verify auth.uid() is working

**Can't see bookings?**
- Check RLS policies are enabled
- Verify user role in `profiles` table
- Check coach_id matches logged-in user

**Old sessions missing?**
- Check `bookings` table - they should be migrated
- Old `sessions` table still exists with original data
