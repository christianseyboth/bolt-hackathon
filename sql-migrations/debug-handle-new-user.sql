-- Debug and fix handle_new_user function
-- First, let's check the actual subscriptions table schema

-- 1. Check subscriptions table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if there are any constraints that might be failing
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'subscriptions' AND tc.table_schema = 'public';

-- 3. Improved handle_new_user function with error handling and correct column names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_account_id UUID;
    user_full_name TEXT;
    user_avatar_url TEXT;
    oauth_provider TEXT;
    subscription_insert_result UUID;
BEGIN
    -- Generate account ID
    new_account_id := gen_random_uuid();

    -- Extract user data from OAuth or email signup
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    -- Get avatar URL from different OAuth providers
    user_avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',     -- GitHub
        NEW.raw_user_meta_data->>'picture',        -- Google
        NEW.raw_user_meta_data->>'image_url'       -- Other providers
    );

    -- Determine OAuth provider
    oauth_provider := COALESCE(
        NEW.raw_app_meta_data->>'provider',
        'email'
    );

    -- Log the start of account creation
    RAISE NOTICE 'Creating account for user: % (email: %)', NEW.id, NEW.email;

    -- 1. Create the account record with profile data
    BEGIN
        INSERT INTO public.accounts (
            id,
            plan,
            billing_email,
            created_at,
            updated_at,
            role,
            owner_id,
            stripe_customer_id,
            stripe_subscription_id,
            susbscription_status,
            subscription_ends_at,
            emails_left,
            full_name,
            avatar_url,
            provider
        ) VALUES (
            new_account_id,
            'Free',
            NEW.email,
            NOW(),
            NOW(),
            'admin',
            NEW.id,
            NULL,
            NULL,
            'active',
            NULL,
            100,
            user_full_name,
            user_avatar_url,
            oauth_provider
        );

        RAISE NOTICE 'Account created successfully: %', new_account_id;

    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create account: %', SQLERRM;
    END;

    -- 2. Create the subscription record for the free plan
    BEGIN
        -- Try the most common column name variations
        INSERT INTO public.subscriptions (
            id,
            account_id,
            plan_name,
            subscription_status,  -- Changed from 'status' to 'subscription_status'
            current_period_start,
            current_period_end,
            seats,
            price_per_seat,
            total_price,
            cancel_at_period_end,
            created_at,
            updated_at,
            analysis_amount,
            analysis_used,
            emails_left           -- Added this field as it might be required
        ) VALUES (
            gen_random_uuid(),
            new_account_id,
            'Free',
            'active',
            NOW(),
            NULL,  -- Free plan doesn't expire
            1,
            0,
            0,
            false,
            NOW(),
            NOW(),
            100,   -- Changed from 5 to 100 to match account emails_left
            0,
            100    -- Match the emails_left from account
        );

        GET DIAGNOSTICS subscription_insert_result = RESULT_COUNT;
        RAISE NOTICE 'Subscription created successfully for account: % (rows affected: %)', new_account_id, subscription_insert_result;

    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create subscription for account %: %', new_account_id, SQLERRM;
    END;

    RAISE NOTICE 'User setup completed successfully for: %', NEW.email;
    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'handle_new_user failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Alternative version if column names are different
-- Uncomment and modify this if the above doesn't work:
/*
CREATE OR REPLACE FUNCTION public.handle_new_user_alt()
RETURNS TRIGGER AS $$
DECLARE
    new_account_id UUID;
    user_full_name TEXT;
    user_avatar_url TEXT;
    oauth_provider TEXT;
BEGIN
    new_account_id := gen_random_uuid();

    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    user_avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        NEW.raw_user_meta_data->>'image_url'
    );

    oauth_provider := COALESCE(
        NEW.raw_app_meta_data->>'provider',
        'email'
    );

    -- Create account
    INSERT INTO public.accounts (
        id, plan, billing_email, created_at, updated_at, role, owner_id,
        stripe_customer_id, stripe_subscription_id, susbscription_status,
        subscription_ends_at, emails_left, full_name, avatar_url, provider
    ) VALUES (
        new_account_id, 'Free', NEW.email, NOW(), NOW(), 'admin', NEW.id,
        NULL, NULL, 'active', NULL, 100, user_full_name, user_avatar_url, oauth_provider
    );

    -- Create subscription with minimal required fields
    INSERT INTO public.subscriptions (
        id,
        account_id,
        plan_name,
        subscription_status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        new_account_id,
        'Free',
        'active',
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
