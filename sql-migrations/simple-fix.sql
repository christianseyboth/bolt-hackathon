-- Simple fix for "Database error saving new user" without creating profiles table
-- This script addresses common issues that prevent OAuth registration

-- 1. Check if there are any problematic triggers on auth.users
-- Drop any existing triggers that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- 2. Drop any functions that might be causing issues
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_update();

-- 3. If you have an existing profiles table that's causing issues, you can drop it
-- Uncomment the next line ONLY if you have a profiles table you want to remove
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 4. Ensure proper permissions (usually not needed, but just in case)
-- These are typically set by Supabase automatically
-- GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

-- That's it! This should allow OAuth registration to work with just auth.users table
