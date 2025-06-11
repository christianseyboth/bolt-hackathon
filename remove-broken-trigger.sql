-- Remove the broken handle_user_deletion trigger that's preventing auth user deletion
-- This trigger references non-existent tables and is causing deletion failures

-- 1. Check what triggers currently exist on auth.users (optional)
/*
SELECT
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';
*/

-- 2. Drop the specific trigger that was found in the error message
DROP TRIGGER IF EXISTS on_user_deleted ON auth.users;

-- Drop any other possible trigger names
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP TRIGGER IF EXISTS handle_user_deletion_trigger ON auth.users;
DROP TRIGGER IF EXISTS user_deletion_trigger ON auth.users;

-- Now drop the problematic function (should work now that triggers are dropped)
DROP FUNCTION IF EXISTS public.handle_user_deletion();
DROP FUNCTION IF EXISTS handle_user_deletion();

-- 3. Verify triggers are removed (optional)
/*
SELECT
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';
*/

-- Note: We don't need this trigger because our application code
-- already handles proper deletion of all related data in the correct order
