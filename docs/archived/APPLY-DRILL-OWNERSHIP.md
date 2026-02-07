# Apply Drill Ownership Migration

This migration adds drill ownership tracking so:
- **Coaches** can only edit/delete drills THEY created
- **Admins** can edit/delete ALL drills (full access)

## Quick Steps

1. **Login to Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your PSP.Pro project

2. **Open SQL Editor**:
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

3. **Copy & Paste the SQL**:
   - Open: `supabase/migrations/007_add_drill_ownership.sql`
   - Copy the entire file contents
   - Paste into the SQL Editor

4. **Run the Migration**:
   - Click **"Run"** button (or Cmd/Ctrl + Enter)
   - You should see: "Success" message

5. **Done!** ✅

## What This Changes

### Before:
- All coaches could edit/delete any drill
- No ownership tracking

### After:
- Drills have `created_by` field (tracks who created it)
- Coaches can only edit/delete their own drills
- Admins can edit/delete all drills
- RLS policies enforce ownership rules automatically

## Verification

After running the migration, test:
1. Login as a coach → create a drill → verify you can edit/delete it
2. Login as a different coach → verify you CANNOT edit/delete the first coach's drill
3. Login as admin → verify you CAN edit/delete ALL drills

## Note on Existing Drills

All existing drills will be assigned to the first admin account found. You can manually reassign ownership later if needed by updating the `created_by` field in the Supabase dashboard.
