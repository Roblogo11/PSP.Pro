# Apply Availability & Calendar Booking System

This adds a complete availability system so coaches can set their hours and athletes can book from a calendar.

## 🎯 What This Adds:

### New Features:
- ✅ **Available Slots Table** - Coaches set their available times
- ✅ **Calendar Booking** - Athletes see availability on calendar
- ✅ **Auto Slot Management** - Booking counts update automatically
- ✅ **Recurring Slots** - Set weekly hours once, apply to whole month
- ✅ **Group Sessions** - Multiple athletes can book same slot
- ✅ **Helper Function** - Bulk-create slots for the week

### How It Works:
```
Coach → Sets availability (Mon-Fri 3-9pm, Sat 9-5pm)
   ↓
System → Creates time slots (60min blocks)
   ↓
Athlete → Sees available times on calendar
   ↓
Athlete → Books slot → Count decrements
   ↓
Coach → Sees booking with athlete details
```

## 📋 Quick Steps:

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your PSP.Pro project

2. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

3. **Copy & Paste the SQL**
   - Open: `supabase/migrations/009_add_availability_system.sql`
   - Copy the entire file contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click **"Run"** button (or Cmd/Ctrl + Enter)
   - Should see: "Success" message

5. **Done!** ✅

## 🗓️ Creating Availability (Coaches):

### Option 1: Manual (One-by-one)
```sql
INSERT INTO available_slots (coach_id, slot_date, start_time, end_time, location)
VALUES ('your-coach-id', '2026-02-10', '15:00', '16:00', 'PSP Training Facility');
```

### Option 2: Bulk (Whole Week) - RECOMMENDED
```sql
SELECT generate_weekly_slots(
  'your-coach-id'::UUID,           -- Your coach ID
  '2026-02-10'::DATE,              -- Start date
  '2026-03-10'::DATE,              -- End date
  ARRAY[1,2,3,4,5]::INTEGER[],    -- Mon-Fri (1-5)
  '15:00'::TIME,                   -- Start time (3PM)
  '21:00'::TIME,                   -- End time (9PM)
  60,                              -- 60-minute slots
  'PSP Training Facility',         -- Location
  1                                -- Max 1 athlete per slot (1-on-1)
);
```

This creates 60-minute time slots for Mon-Fri, 3PM-9PM!

**For group sessions:** Set `max_bookings` to 4 (allows 4 athletes)

## 📊 What Changed:

### Before:
```
No availability system
Athletes couldn't book
Coaches manually scheduled
```

### After:
```
✅ Coaches set availability
✅ Athletes see calendar with open slots
✅ Booking system auto-updates counts
✅ Slots show as full when booked
✅ Group sessions supported
```

## 🔄 Auto Features:

### Booking Triggers:
- **Booking created** → Slot count increments
- **Booking cancelled** → Slot count decrements
- **Slot full** → Marked unavailable automatically
- **Slot opened** → Marked available when cancellation happens

### Permissions:
- **Athletes:** View only available slots (future dates)
- **Coaches:** View/manage their own slots (all dates)
- **Admins:** View/manage all slots

## 💡 Pro Tips:

1. **Weekly Hours:** Use `generate_weekly_slots()` to set up a month at once
2. **Group Training:** Set `max_bookings = 4` for group sessions
3. **Lunch Breaks:** Don't create slots during lunch (12-1pm)
4. **Weekends:** Use different hours (Sat: 9-5pm vs weekday 3-9pm)

## 🧪 Testing:

1. **As Coach:**
   - Run `generate_weekly_slots()` for your ID
   - Check `available_slots` table
   - Should see slots created

2. **As Athlete:**
   - Go to `/booking`
   - Should see calendar with available dates
   - Click date → see available times
   - Book a slot → count should update

3. **Verify:**
   - Check `available_slots.current_bookings` increments
   - Check `is_available = FALSE` when slot is full

## 🆘 Troubleshooting:

**No slots showing?**
- Check if slots exist for future dates
- Check if `is_available = TRUE`
- Check RLS policies (athlete can only see available slots)

**Slot count not updating?**
- Check trigger is enabled: `trigger_update_slot_booking_count`
- Check booking has `slot_id` set
- Check booking status (cancelled bookings don't count)

**Can't create slots?**
- Verify you're a coach/admin
- Check start_time < end_time
- Check max_bookings > 0
