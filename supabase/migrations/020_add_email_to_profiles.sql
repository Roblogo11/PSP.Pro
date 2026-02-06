-- ============================================================================
-- Add Email to Profiles Table
-- Makes email accessible client-side for coaches viewing athlete lists
-- ============================================================================

-- 1. Add email column to profiles (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- 2. Populate email from auth.users for existing profiles
UPDATE profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id AND p.email IS NULL;

-- 3. Update the profile creation trigger to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  admin_role TEXT;
BEGIN
  -- Check if email is in admin whitelist
  SELECT role INTO admin_role FROM admin_whitelist WHERE email = new.email;

  -- Insert profile with email from auth.users
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email, -- Include email in profile
    COALESCE(admin_role, 'athlete'),
    now(),
    now()
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to sync email changes from auth.users to profiles
CREATE OR REPLACE FUNCTION sync_auth_email_to_profile()
RETURNS trigger AS $$
BEGIN
  -- When email changes in auth.users, update it in profiles
  UPDATE profiles
  SET email = NEW.email, updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_email_change ON auth.users;

-- Create trigger on auth.users email updates
CREATE TRIGGER on_auth_user_email_change
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION sync_auth_email_to_profile();

-- 5. Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add helpful comments
COMMENT ON COLUMN profiles.email IS 'User email synced from auth.users for client-side access';
COMMENT ON FUNCTION sync_auth_email_to_profile IS 'Keeps profile email in sync when auth.users email changes';
