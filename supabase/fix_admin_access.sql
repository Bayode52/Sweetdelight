-- FIX ADMIN ACCESS
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Update your role to 'admin'
-- Replace 'your-email@example.com' with the email you use to sign in
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- 2. Verify the update
SELECT id, email, role FROM public.profiles WHERE role = 'admin';
