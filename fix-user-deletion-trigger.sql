-- Fix the handle_user_deletion trigger to match your actual schema
-- This trigger is causing auth user deletion to fail because it references non-existent tables

-- 1. First, let's see what triggers exist on auth.users
-- You can run this query to see current triggers:
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

-- 2. Drop the existing problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_deletion();

-- 3. Create a new handle_user_deletion function that matches your actual schema
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete authorized_addresses created by this user
    DELETE FROM public.authorized_addresses WHERE created_by = OLD.id;

    -- Delete accounts owned by this user (this will cascade to other tables)
    DELETE FROM public.accounts WHERE owner_id = OLD.id;

    -- Note: Due to CASCADE constraints, deleting accounts will automatically delete:
    -- - api_keys (via account_id foreign key)
    -- - subscriptions (via account_id foreign key)
    -- - mail_events (via account_id foreign key)
    -- - authorized_addresses (via subscription_id foreign key)

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger (AFTER DELETE to clean up remaining references)
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_deletion();

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_user_deletion() TO service_role;

-- Alternative: If you want to DISABLE the trigger entirely (recommended for now)
-- since we're handling deletion properly in the application code:
/*
-- Just drop the trigger and function entirely
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_deletion();
*/

-- 6. Check what triggers remain after cleanup
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
