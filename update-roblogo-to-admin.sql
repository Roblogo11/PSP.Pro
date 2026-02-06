-- ============================================================================
-- Update roblogo.com@gmail.com to admin role
-- ============================================================================
-- Run this in your Supabase SQL Editor to give admin access

-- Update the user's role to admin using their UUID
UPDATE profiles
SET role = 'admin',
    full_name = 'Rob Logo (Admin)'
WHERE id = 'fc81d2bc-d35c-4b0e-a080-c584b8970356';

-- Verify the update worked
SELECT
  p.id,
  p.full_name,
  p.role,
  au.email,
  p.created_at
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.id = 'fc81d2bc-d35c-4b0e-a080-c584b8970356';

-- Expected result:
-- id: fc81d2bc-d35c-4b0e-a080-c584b8970356
-- full_name: Rob Logo (Admin)
-- role: admin
-- email: roblogo.com@gmail.com
