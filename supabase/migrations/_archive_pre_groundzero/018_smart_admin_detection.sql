-- ============================================================================
-- Smart Admin Detection System
-- Prevents the issue where admin accounts get set to 'athlete' role
-- ============================================================================

-- Create a whitelist table for admin emails
CREATE TABLE IF NOT EXISTS admin_whitelist (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'master_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Add roblogo.com@gmail.com to whitelist
INSERT INTO admin_whitelist (email, role, notes)
VALUES
  ('roblogo.com@gmail.com', 'master_admin', 'Primary admin account'),
  ('admin@psp.pro', 'admin', 'Admin account')
ON CONFLICT (email) DO NOTHING;

-- Update the profile creation trigger to check whitelist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_email TEXT;
  admin_role TEXT;
BEGIN
  -- Get the email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = new.id;

  -- Check if this email is in the admin whitelist
  SELECT role INTO admin_role FROM admin_whitelist WHERE email = user_email;

  -- If in whitelist, use that role; otherwise default to 'athlete'
  INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(admin_role, 'athlete'),
    now(),
    now()
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for admin_whitelist (only admins can view/edit)
ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

-- Admins can view whitelist
CREATE POLICY "Admins can view admin whitelist"
  ON admin_whitelist
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- Only master_admins can insert/update whitelist
CREATE POLICY "Master admins can modify admin whitelist"
  ON admin_whitelist
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'master_admin'
    )
  );

-- Add helpful comment
COMMENT ON TABLE admin_whitelist IS 'Whitelist of admin/coach emails that should get elevated roles on signup';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile with correct role based on admin_whitelist';
