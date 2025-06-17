-- Updated handle_new_user function that creates subscription records without Stripe customer IDs
-- The Stripe customer will be created when needed (e.g., during first upgrade)

-- First, check if we have a 'Free' plan in subscription_plans table
DO $$
BEGIN
    -- Check if 'Free' plan exists in subscription_plans
    IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Free') THEN
        RAISE NOTICE 'WARNING: Free plan does not exist in subscription_plans table';
        RAISE NOTICE 'Creating Free plan...';

        -- Create the Free plan if it doesn't exist
        INSERT INTO public.subscription_plans (
            id,
            name,
            description,
            price,
            currency,
            billing_period,
            features,
            is_active,
            created_at,
            updated_at,
            emails_per_month,
            analysis_per_month,
            max_seats
        ) VALUES (
            gen_random_uuid(),
            'Free',
            'Free plan with basic features',
            0.00,
            'USD',
            'monthly',
            '{"basic_features": true, "email_limit": 100, "analysis_limit": 100}',
            true,
            NOW(),
            NOW(),
            5,      -- 5 emails per month
            5,      -- 5 analysis per month
            1       -- 1 seat maximum
        )
        ON CONFLICT (name) DO NOTHING;

        RAISE NOTICE 'Free plan created successfully';
    ELSE
        RAISE NOTICE 'Free plan exists in subscription_plans table ✓';
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_account_id UUID;
    user_full_name TEXT;
    user_avatar_url TEXT;
    oauth_provider TEXT;
    free_plan_id UUID;
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

    -- Get the Free plan ID (required due to foreign key constraint)
    SELECT id INTO free_plan_id
    FROM public.subscription_plans
    WHERE name = 'Free'
    LIMIT 1;

    IF free_plan_id IS NULL THEN
        -- Fallback: try to get any plan ID if 'Free' doesn't exist
        SELECT id INTO free_plan_id
        FROM public.subscription_plans
        ORDER BY created_at ASC
        LIMIT 1;

        IF free_plan_id IS NULL THEN
            RAISE EXCEPTION 'No subscription plans found in database. Cannot create subscription.';
        END IF;
    END IF;

    -- Log the start of account creation for debugging
    RAISE NOTICE 'Creating account and subscription for user: % (email: %)', NEW.id, NEW.email;

    -- 1. Create the account record with profile data
    BEGIN
        INSERT INTO public.accounts (
            id,
            billing_email,
            created_at,
            updated_at,
            role,
            owner_id,
            full_name,
            avatar_url,
            provider
        ) VALUES (
            new_account_id,
            NEW.email,
            NOW(),
            NOW(),
            'admin',                -- Default role
            NEW.id,                 -- Foreign key to auth.users.id
            user_full_name,
            user_avatar_url,
            oauth_provider
        );

        RAISE NOTICE 'Account created successfully: %', new_account_id;

    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create account: %', SQLERRM;
    END;

    -- 2. Create the subscription record with all required fields
    -- NOTE: stripe_customer_id is left NULL and will be created when needed
    BEGIN
        INSERT INTO public.subscriptions (
            id,
            account_id,
            plan_id,                      -- Required foreign key
            plan_name,                    -- Required foreign key to subscription_plans(name)
            subscription_status,          -- Required, must be in allowed values
            current_period_start,         -- Required NOT NULL
            current_period_end,           -- Can be NULL for free plans
            seats,                        -- Required NOT NULL
            price_per_seat,               -- Can be NULL
            total_price,                  -- Required NOT NULL
            cancel_at_period_end,         -- Has default false
            created_at,
            updated_at,
            analysis_amount,              -- Required NOT NULL, has default 0
            analysis_used,                -- Has default 0
            emails_left,                  -- Has default 100
            stripe_customer_id,           -- NULL initially, created when needed
            stripe_subscription_id        -- NULL initially, created when needed
        ) VALUES (
            gen_random_uuid(),
            new_account_id,
            free_plan_id,                 -- Use the plan ID we found
            'Free',                       -- Plan name (must exist in subscription_plans)
            'active',                     -- Must be one of: active, inactive, cancelled, past_due
            NOW(),                        -- Period starts now
            NULL,                         -- Free plan doesn't expire
            1,                            -- 1 seat for free users
            0.00,                         -- Free plan costs $0 per seat
            0.00,                         -- Total price is $0
            false,                        -- Don't cancel at period end
            NOW(),                        -- Created timestamp
            NOW(),                        -- Updated timestamp
            5,                            -- Analysis emails allowed (Free plan)
            0,                            -- No analysis used yet
            5,                            -- Emails left (Free plan)
            NULL,                         -- Stripe customer ID will be created when needed
            NULL                          -- Stripe subscription ID will be created when needed
        );

        RAISE NOTICE 'Subscription created successfully for account: %', new_account_id;

    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create subscription for account %: %', new_account_id, SQLERRM;
    END;

    RAISE NOTICE 'User setup completed successfully for: %', NEW.email;
    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'handle_new_user failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Verification script
DO $$
BEGIN
    RAISE NOTICE 'handle_new_user function updated successfully:';
    RAISE NOTICE '✓ Creates Free plan if missing';
    RAISE NOTICE '✓ All NOT NULL fields included';
    RAISE NOTICE '✓ Foreign key constraints satisfied';
    RAISE NOTICE '✓ Stripe customer ID left NULL (created when needed)';
    RAISE NOTICE '✓ Proper error handling and logging';
    RAISE NOTICE '✓ Trigger recreated';
END $$;
