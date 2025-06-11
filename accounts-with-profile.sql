-- Add profile fields to existing accounts table instead of creating separate profiles table
-- This is cleaner and avoids JOINs

-- 1. Add profile fields to your existing accounts table
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- 2. Update the handle_new_user function to include profile data in accounts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_account_id UUID;
    user_full_name TEXT;
    user_avatar_url TEXT;
    oauth_provider TEXT;
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

    -- 1. Create the account record with profile data
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
        full_name,              -- Profile data
        avatar_url,             -- OAuth avatar
        provider                -- Auth provider
    ) VALUES (
        new_account_id,
        'Free',                 -- Free plan
        NEW.email,              -- User's email as billing email
        NOW(),                  -- Created timestamp
        NOW(),                  -- Updated timestamp
        'owner',                -- Default role
        NEW.id,                 -- Foreign key to auth.users.id
        NULL,                   -- No Stripe customer ID yet
        NULL,                   -- No Stripe subscription ID yet
        'active',               -- Subscription status for free plan
        NULL,                   -- Free plan doesn't expire
        100,                    -- Default emails for free plan
        user_full_name,         -- Full name from OAuth or email
        user_avatar_url,        -- Avatar from OAuth provider
        oauth_provider          -- Which provider was used
    );

    -- 2. Create the subscription record for the free plan
    INSERT INTO public.subscriptions (
        id,
        account_id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        seats,
        price_per_seat,
        total_price,
        cancel_at_period_end,
        created_at,
        updated_at,
        analysis_amount,
        plan_name,
        analysis_used
    ) VALUES (
        gen_random_uuid(),           -- Generate subscription ID
        new_account_id,              -- Link to the account we just created
        NULL,                        -- Set to your free plan UUID if you have one
        'active',                    -- Active free subscription
        NOW(),                       -- Period starts now
        NOW() + INTERVAL '1 year',   -- Free plan expires in 1 year
        1,                           -- 1 seat for free users
        0,                           -- Free plan costs $0 per seat
        0,                           -- Total price is $0
        false,                       -- Don't cancel at period end
        NOW(),                       -- Created timestamp
        NOW(),                       -- Updated timestamp
        100,                         -- Analysis emails allowed
        'Free',                      -- Plan name
        0                            -- No analysis used yet
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to handle profile updates when user data changes
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.accounts
    SET
        billing_email = NEW.email,
        full_name = COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            full_name
        ),
        avatar_url = COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            NEW.raw_user_meta_data->>'image_url',
            avatar_url
        ),
        updated_at = NOW()
    WHERE owner_id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create/update triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_update() TO service_role;
