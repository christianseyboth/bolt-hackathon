-- Add columns for tracking scheduled subscription changes
-- This fixes the "Could not find the 'scheduled_change_date' column" error

-- Add columns for tracking scheduled downgrade/upgrade changes
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS scheduled_plan_change TEXT,
ADD COLUMN IF NOT EXISTS scheduled_change_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_schedule_id TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_scheduled_change_date ON public.subscriptions(scheduled_change_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_schedule_id ON public.subscriptions(stripe_schedule_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_scheduled_plan_change ON public.subscriptions(scheduled_plan_change);

-- Add helpful comments
COMMENT ON COLUMN public.subscriptions.scheduled_plan_change IS 'Plan name that will take effect on scheduled_change_date (for downgrades/upgrades)';
COMMENT ON COLUMN public.subscriptions.scheduled_change_date IS 'Date when the scheduled plan change will take effect';
COMMENT ON COLUMN public.subscriptions.stripe_schedule_id IS 'Stripe subscription schedule ID for tracking scheduled changes';

-- Grant permissions
GRANT SELECT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
