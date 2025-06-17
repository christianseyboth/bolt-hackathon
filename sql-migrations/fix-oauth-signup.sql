-- Fix OAuth signup: Create account and subscription automatically for new users
-- This ensures every new user (OAuth or email) gets proper account setup

-- 1. Create the handle_new_user function
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

    -- Create the account record
    INSERT INTO public.accounts (
        id,
        owner_id,
        billing_email,
        full_name,
        avatar_url,
        provider,
        plan,
        role,
        created_at,
        updated_at
    ) VALUES (
        new_account_id,
        NEW.id,                 -- Foreign key to auth.users.id
        NEW.email,              -- User's email as billing email
        user_full_name,         -- Full name from OAuth or email
        user_avatar_url,        -- Avatar from OAuth provider
        oauth_provider,         -- Which provider was used
        'Free',                 -- Free plan
        'owner',                -- Default role
        NOW(),                  -- Created timestamp
        NOW()                   -- Updated timestamp
    );

    -- Create the subscription record for the free plan
    INSERT INTO public.subscriptions (
        id,
        account_id,
        plan_name,
        subscription_status,
        seats,
        price_per_seat,
        total_price,
        analysis_amount,
        analysis_used,
        emails_left,
        current_period_start,
        cancel_at_period_end,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),      -- Generate subscription ID
        new_account_id,         -- Link to the account we just created
        'Free',                 -- Plan name
        'active',               -- Active free subscription
        1,                      -- 1 seat for free users
        0,                      -- Free plan costs $0 per seat
        0,                      -- Total price is $0
        100,                    -- Analysis emails allowed
        0,                      -- No analysis used yet
        100,                    -- Emails left
        NOW(),                  -- Period starts now
        false,                  -- Don't cancel at period end
        NOW(),                  -- Created timestamp
        NOW()                   -- Updated timestamp
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 4. Optional: Create function to handle profile updates when user data changes
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

-- 5. Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- 6. Grant permissions for update function
GRANT EXECUTE ON FUNCTION public.handle_user_update() TO service_role;
