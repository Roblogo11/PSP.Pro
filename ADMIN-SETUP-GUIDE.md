# Admin Setup Guide - PSP.Pro

## Problem
When new users sign up, they're automatically assigned the `'athlete'` role, even if they should be admins. This causes admins to be redirected to `/locker` instead of `/admin` after login.

## Solution Implemented

### ✅ Immediate Fix (Already Done)
Rob Logo's account (`roblogo.com@gmail.com`) has been updated to `admin` role. You should now be redirected to `/admin` after login.

### 🔧 Permanent Fix (Run This Once)

To prevent this issue for future admin accounts:

1. **Go to Supabase Dashboard**
   - Open your project: https://supabase.com/dashboard
   - Navigate to: **SQL Editor**

2. **Run the Smart Admin Detection Migration**
   - Open the file: `supabase/migrations/018_smart_admin_detection.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **RUN**

3. **Verify It Worked**
   ```sql
   SELECT * FROM admin_whitelist;
   ```
   You should see:
   - `roblogo.com@gmail.com` → `master_admin`
   - `admin@psp.pro` → `admin`

## How It Works

The migration creates an `admin_whitelist` table that stores emails and their intended roles. When a new user signs up, the system:

1. Checks if their email is in the whitelist
2. If YES → assigns the whitelisted role (`admin`, `coach`, `master_admin`)
3. If NO → assigns default role (`athlete`)

## Adding New Admins/Coaches

### Option 1: Add to Whitelist BEFORE They Sign Up (Recommended)

Run this in Supabase SQL Editor:
```sql
INSERT INTO admin_whitelist (email, role, notes)
VALUES ('newadmin@example.com', 'admin', 'Description here');
```

Then when they sign up, they'll automatically get the correct role!

### Option 2: Upgrade After Sign Up (Old Way)

If someone already signed up as an athlete:
```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'their-email@example.com');
```

## Available Roles

| Role | Access Level |
|------|--------------|
| `athlete` | Locker room only (`/locker`) |
| `coach` | Coach dashboard + athlete data |
| `admin` | Full admin panel (`/admin`) |
| `master_admin` | Admin + can modify admin_whitelist |

## Testing

1. Add a test email to the whitelist with role `admin`
2. Sign up with that email
3. Log in
4. Should be redirected to `/admin` automatically ✓

## Files Changed

- ✅ `/fix-roblogo-admin.js` - One-time script to fix Rob's account
- ✅ `/supabase/migrations/018_smart_admin_detection.sql` - Smart admin detection system
- ✅ `/update-roblogo-to-admin.sql` - Manual SQL fallback
- ✅ `/ADMIN-SETUP-GUIDE.md` - This guide

## Troubleshooting

### Still redirecting to /locker after login?

1. Check your role:
   ```sql
   SELECT p.role, au.email
   FROM profiles p
   JOIN auth.users au ON au.id = p.id
   WHERE au.email = 'your-email@example.com';
   ```

2. If role is not `admin`, run:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
   ```

3. Log out and log back in (hard refresh: `Cmd+Shift+R`)

### Migration won't run?

Just copy/paste the SQL directly in Supabase SQL Editor - it's the most reliable method.

---

**Last Updated:** 2026-02-06
**Status:** ✅ Rob's account fixed, migration ready to deploy
