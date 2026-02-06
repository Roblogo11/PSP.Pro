-- PSP.Pro - Create Admin User
-- Run this in your Supabase SQL Editor

-- Step 1: First, sign up through the app UI with these credentials:
-- Email: admin@psp.pro
-- Password: PSPAdmin2024!

-- Step 2: After signing up, run this query to make yourself an admin:
-- Replace 'admin@psp.pro' with the email you used

UPDATE profiles
SET role = 'admin',
    full_name = 'PSP Admin'
WHERE email = 'admin@psp.pro';

-- Verify it worked:
SELECT id, email, full_name, role
FROM profiles
WHERE email = 'admin@psp.pro';

-- Alternative: If you want to create a coach account instead:
UPDATE profiles
SET role = 'coach',
    full_name = 'Coach Name'
WHERE email = 'your-email@example.com';
