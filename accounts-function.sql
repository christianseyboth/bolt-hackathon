-- Create the handle_new_user function for your exact accounts table structure
-- This automatically creates a free account when a new user registers

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a new free account for the new user
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
        gen_random_uuid(),           -- Generate new UUID for account ID
        'Free',                      -- Free plan as requested
        NEW.email,                   -- User's email as billing email
        NOW(),                       -- Created timestamp
        NOW(),                       -- Updated timestamp
        'owner',                     -- Default role (adjust if needed)
        NEW.id,                      -- Foreign key to auth.users.id
        NULL,                        -- No Stripe customer ID yet
        NULL,                        -- No Stripe subscription ID yet
        'active',                    -- Subscription status for free plan
        NULL,                        -- Free plan doesn't expire
        100                          -- Default emails for free plan (adjust as needed)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists (it should already be there)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
