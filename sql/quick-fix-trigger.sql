-- Quick fix: Drop the function with CASCADE to automatically drop dependent triggers
DROP FUNCTION IF EXISTS public.handle_user_deletion() CASCADE;
DROP FUNCTION IF EXISTS handle_user_deletion() CASCADE;

-- Verify all triggers are removed
SELECT
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';
