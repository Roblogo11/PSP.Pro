# 🔒 Apply RLS Security Fixes

## Quick Fix (2 minutes)

Your database tables need updated security policies so admins/coaches can create drills and manage data through the UI.

---

## Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your PSP.Pro project

2. **Open SQL Editor**:
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

3. **Copy & Paste the SQL**:
   - Open: `supabase/migrations/005_rls_fix_safe.sql` ← Use this one!
   - Copy the entire file contents
   - Paste into the SQL Editor

4. **Run the Migration**:
   - Click **"Run"** button (or Cmd/Ctrl + Enter)
   - You should see: "Success. No rows returned"

5. **Done!** ✅
   - Admins and coaches can now create drills via UI
   - All tables have proper security policies

---

## Option 2: Command Line (Alternative)

If you have the Supabase CLI installed locally:

```bash
npx supabase db push
```

This will apply all pending migrations including the RLS fixes.

---

## What This Fixes:

### Before:
- ❌ Admins/coaches couldn't create drills through the UI
- ❌ Missing policies blocked data management
- ❌ RLS errors in console when trying to add data

### After:
- ✅ Drills: Admins/coaches can create, edit; admins can delete
- ✅ Assigned Drills: Coaches can assign drills to athletes
- ✅ Sessions: Coaches can view all athlete sessions
- ✅ Velocity Logs: Coaches can add/view velocity data
- ✅ Drill Completions: Coaches can track athlete progress
- ✅ Profiles: Admins can manage all user profiles

---

## Verify It Worked:

1. Login to your admin dashboard
2. Try creating a drill using the UI:
   - Click "Create Drill" quick action
   - Fill in the form with a YouTube URL
   - Click "Create Drill"
3. If it saves successfully, you're good to go! 🎉

---

## Troubleshooting:

**If you see "policy violation" errors:**
- Make sure you ran the entire SQL migration file
- Check that your user role is set to 'admin' in the profiles table
- Try logging out and back in to refresh your session

**If the SQL Editor shows errors:**
- Make sure you copied the entire file (it's ~200 lines)
- Check that there are no extra characters or formatting issues
- Try running it in smaller chunks if needed

---

## Next Steps:

Once the RLS fixes are applied, follow the **DEMO-SETUP-GUIDE.md** to add your 2 sample drills and availability schedule!
