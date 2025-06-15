-- Complete user setup: Creates both account and subscription for new users
-- This ensures every user has both an account and a free subscription

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_account_id UUID;
BEGIN
    -- Generate account ID
    new_account_id := gen_random_uuid();

    -- 1. Create the account record
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
        emails_left
    ) VALUES (
        new_account_id,
        'Free',                      -- Free plan
        NEW.email,                   -- User's email as billing email
        NOW(),                       -- Created timestamp
        NOW(),                       -- Updated timestamp
        'owner',                     -- Default role
        NEW.id,                      -- Foreign key to auth.users.id
        NULL,                        -- No Stripe customer ID yet
        NULL,                        -- No Stripe subscription ID yet
        'active',                    -- Subscription status for free plan
        NULL,                        -- Free plan doesn't expire
        100                          -- Default emails for free plan (adjust as needed)
    );

    -- 2. Create the subscription record for the free plan
    INSERT INTO public.subscriptions (
        id,
        account_id,
        plan_id,                     -- You might need to set this to your free plan UUID
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
        NOW() + INTERVAL '1 year',   -- Free plan expires in 1 year (or set to NULL for unlimited)
        1,                           -- 1 seat for free users
        0,                           -- Free plan costs $0 per seat
        0,                           -- Total price is $0
        false,                       -- Don't cancel at period end
        NOW(),                       -- Created timestamp
        NOW(),                       -- Updated timestamp
        100,                         -- Analysis emails allowed (adjust as needed)
        'Free',                      -- Plan name
        0                            -- No analysis used yet
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
