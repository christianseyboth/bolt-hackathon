-- Fix foreign key constraints to allow proper user deletion
-- This script ensures that when an auth.users record is deleted,
-- all related records are properly cleaned up

-- 1. First, let's check what foreign key constraints exist on accounts table
-- You can run this in your Supabase SQL editor to see current constraints:
/*
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name,
    rc.delete_rule
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name = 'accounts' OR ccu.table_name = 'users')
    AND tc.table_schema = 'public';
*/

-- 2. Drop existing foreign key constraints that need to be fixed
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find and drop the accounts.owner_id constraint
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'accounts'
      AND kcu.column_name = 'owner_id'
      AND tc.table_schema = 'public';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.accounts DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped accounts.owner_id constraint: %', constraint_name;
    END IF;

        -- Find and drop the api_keys.account_id constraint
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'api_keys'
      AND kcu.column_name = 'account_id'
      AND tc.table_schema = 'public';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.api_keys DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped api_keys.account_id constraint: %', constraint_name;
    END IF;

    -- Find and drop the authorized_addresses.created_by constraint (CRITICAL!)
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'authorized_addresses'
      AND kcu.column_name = 'created_by'
      AND tc.table_schema = 'public';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.authorized_addresses DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped authorized_addresses.created_by constraint: %', constraint_name;
    END IF;
END $$;

-- 3. Add the correct foreign key constraint with CASCADE deletion
ALTER TABLE public.accounts
ADD CONSTRAINT accounts_owner_id_fkey
FOREIGN KEY (owner_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 4. Add the correct foreign key constraints with CASCADE deletion
ALTER TABLE public.api_keys
ADD CONSTRAINT api_keys_account_id_fkey
FOREIGN KEY (account_id)
REFERENCES public.accounts(id)
ON DELETE CASCADE;

-- 5. Add CASCADE constraint for authorized_addresses.created_by (CRITICAL FIX!)
ALTER TABLE public.authorized_addresses
ADD CONSTRAINT authorized_addresses_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Note: subscriptions table already has proper CASCADE constraints according to your schema

-- 5. Create a function to safely delete users with all dependencies
CREATE OR REPLACE FUNCTION public.delete_user_completely(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    account_record RECORD;
    sub_record RECORD;
BEGIN
    -- Get the account associated with this user
    SELECT id INTO account_record FROM public.accounts WHERE owner_id = user_id;

    IF account_record IS NOT NULL THEN
        RAISE NOTICE 'Deleting user data for account: %', account_record.id;

        -- 1. Delete authorized_addresses (both via subscriptions AND created_by user)
        FOR sub_record IN SELECT id FROM public.subscriptions WHERE account_id = account_record.id LOOP
            DELETE FROM public.authorized_addresses WHERE subscription_id = sub_record.id;
        END LOOP;

        -- CRITICAL: Also delete authorized_addresses created by this user
        DELETE FROM public.authorized_addresses WHERE created_by = user_id;

        -- 2. Delete API keys (no cascade constraint)
        DELETE FROM public.api_keys WHERE account_id = account_record.id;

        -- 3. Delete mail_events (has cascade but delete explicitly)
        DELETE FROM public.mail_events WHERE account_id = account_record.id;

        -- 4. Delete subscriptions (has cascade)
        DELETE FROM public.subscriptions WHERE account_id = account_record.id;

        -- 5. Delete account (should cascade to auth.users if constraint is fixed)
        DELETE FROM public.accounts WHERE id = account_record.id;

        RAISE NOTICE 'Successfully deleted all data for user: %', user_id;
    END IF;

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting user %: %', user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.delete_user_completely(UUID) TO service_role;

-- 7. Test the constraints (optional - uncomment to test)
/*
-- This should show that foreign keys are now set with CASCADE delete
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name,
    rc.delete_rule
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name IN ('accounts', 'api_keys', 'subscriptions'))
    AND tc.table_schema = 'public'
    AND rc.delete_rule = 'CASCADE';
*/
