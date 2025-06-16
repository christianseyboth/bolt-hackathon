-- Migration: Consolidate subscription data into subscriptions table only
-- This removes the dual-table complexity that's causing sync issues

-- Step 1: Add missing fields to subscriptions table if they don't exist
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS emails_left INTEGER DEFAULT 100;

-- Step 2: Migrate any existing data from accounts to subscriptions
-- Copy Stripe customer ID from accounts to subscriptions
UPDATE public.subscriptions
SET stripe_customer_id = accounts.stripe_customer_id
FROM public.accounts
WHERE subscriptions.account_id = accounts.id
AND accounts.stripe_customer_id IS NOT NULL
AND subscriptions.stripe_customer_id IS NULL;

-- Copy emails_left from accounts to subscriptions for consistency
UPDATE public.subscriptions
SET emails_left = accounts.emails_left
FROM public.accounts
WHERE subscriptions.account_id = accounts.id
AND accounts.emails_left IS NOT NULL
AND subscriptions.emails_left IS NULL;

-- Copy stripe_subscription_id from accounts to subscriptions
UPDATE public.subscriptions
SET stripe_subscription_id = accounts.stripe_subscription_id
FROM public.accounts
WHERE subscriptions.account_id = accounts.id
AND accounts.stripe_subscription_id IS NOT NULL
AND subscriptions.stripe_subscription_id IS NULL;

-- Step 3: Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- Step 4: Remove redundant subscription fields from accounts table
-- Note: We'll do this in phases to be safe

-- Phase 1: Make columns nullable first (in case of dependencies)
ALTER TABLE public.accounts
ALTER COLUMN plan DROP NOT NULL,
ALTER COLUMN stripe_subscription_id DROP NOT NULL,
ALTER COLUMN susbscription_status DROP NOT NULL;

-- Add comments to mark these columns as deprecated
COMMENT ON COLUMN public.accounts.plan IS 'DEPRECATED: Use subscriptions.plan_name instead';
COMMENT ON COLUMN public.accounts.stripe_subscription_id IS 'DEPRECATED: Use subscriptions.stripe_subscription_id instead';
COMMENT ON COLUMN public.accounts.susbscription_status IS 'DEPRECATED: Use subscriptions.subscription_status instead';
COMMENT ON COLUMN public.accounts.subscription_ends_at IS 'DEPRECATED: Use subscriptions.current_period_end instead';
COMMENT ON COLUMN public.accounts.emails_left IS 'DEPRECATED: Use subscriptions.emails_left instead';

-- Step 5: Drop existing function and create correct helper function
DROP FUNCTION IF EXISTS public.get_current_subscription(UUID);

CREATE OR REPLACE FUNCTION public.get_current_subscription(account_uuid UUID)
RETURNS TABLE (
    id UUID,
    subscription_status TEXT,
    plan_name TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN,
    seats INTEGER,
    price_per_seat DECIMAL,
    total_price DECIMAL,
    analysis_amount INTEGER,
    analysis_used INTEGER,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    emails_left INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.subscription_status,
        s.plan_name,
        s.current_period_start,
        s.current_period_end,
        s.cancel_at_period_end,
        s.seats,
        s.price_per_seat,
        s.total_price,
        s.analysis_amount,
        s.analysis_used,
        s.stripe_subscription_id,
        s.stripe_customer_id,
        s.emails_left
    FROM public.subscriptions s
    WHERE s.account_id = account_uuid
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_current_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_subscription(UUID) TO service_role;

-- Step 6: Create view for backward compatibility (temporary)
CREATE OR REPLACE VIEW public.account_with_subscription AS
SELECT
    a.*,
    s.subscription_status as current_subscription_status,
    s.plan_name as current_plan,
    s.current_period_end as current_subscription_ends_at,
    s.emails_left as current_emails_left,
    s.stripe_subscription_id as current_stripe_subscription_id
FROM public.accounts a
LEFT JOIN public.subscriptions s ON a.id = s.account_id
WHERE s.id = (
    SELECT id FROM public.subscriptions
    WHERE account_id = a.id
    ORDER BY created_at DESC
    LIMIT 1
);

-- Grant permissions on the view
GRANT SELECT ON public.account_with_subscription TO authenticated;
GRANT SELECT ON public.account_with_subscription TO service_role;

-- Add helpful comment
COMMENT ON VIEW public.account_with_subscription IS 'Temporary view for backward compatibility. Application should migrate to use subscriptions table directly.';
