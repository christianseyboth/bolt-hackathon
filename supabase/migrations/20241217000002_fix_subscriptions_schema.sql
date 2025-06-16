-- Fix subscriptions table schema to ensure all required columns exist
-- This addresses the "Could not find the 'status' column" error

-- First, let's check and add any missing columns that should exist
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'Free',
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS price_per_seat DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS analysis_amount INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS analysis_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS emails_left INTEGER DEFAULT 100;

-- Ensure proper constraints exist
-- Add subscription_status constraint if it doesn't exist
DO $$
BEGIN
    -- Only add constraint if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'subscriptions_subscription_status_check'
    ) THEN
        ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_subscription_status_check
        CHECK (subscription_status IN ('active', 'cancelled', 'trialing', 'past_due', 'incomplete', 'incomplete_expired', 'unpaid'));
    END IF;
END $$;

-- Add plan name constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'subscriptions_plan_name_check'
    ) THEN
        ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_plan_name_check
        CHECK (plan_name IN ('Free', 'Solo', 'Entrepreneur', 'Team', 'Pro', 'Enterprise'));
    END IF;
END $$;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_subscriptions_account_id ON public.subscriptions(account_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_name ON public.subscriptions(plan_name);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON public.subscriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_updated_at ON public.subscriptions(updated_at DESC);

-- Add helpful comments
COMMENT ON COLUMN public.subscriptions.status IS 'Subscription status from Stripe (active, cancelled, etc.)';
COMMENT ON COLUMN public.subscriptions.plan_name IS 'Plan name (Free, Solo, Entrepreneur, Team, etc.)';
COMMENT ON COLUMN public.subscriptions.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN public.subscriptions.emails_left IS 'Number of emails remaining in current period';
COMMENT ON COLUMN public.subscriptions.analysis_amount IS 'Total analysis emails allowed per period';
COMMENT ON COLUMN public.subscriptions.analysis_used IS 'Analysis emails used in current period';

-- Grant proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
