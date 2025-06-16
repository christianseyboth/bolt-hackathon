-- Create cancellation feedback table to track why users cancel subscriptions
CREATE TABLE IF NOT EXISTS public.cancellation_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    subscription_id TEXT NOT NULL, -- Stripe subscription ID
    plan_name TEXT NOT NULL,
    reason TEXT, -- The cancellation reason ID (e.g., 'too-expensive', 'not-using', etc.)
    feedback TEXT, -- Optional user feedback text
    cancel_at_period_end BOOLEAN DEFAULT true,
    cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_account_id ON public.cancellation_feedback(account_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_reason ON public.cancellation_feedback(reason);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_plan_name ON public.cancellation_feedback(plan_name);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_cancelled_at ON public.cancellation_feedback(cancelled_at DESC);

-- Enable Row Level Security
ALTER TABLE public.cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to read their own cancellation feedback
CREATE POLICY "Users can view their own cancellation feedback" ON public.cancellation_feedback
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM public.accounts WHERE owner_id = auth.uid()
        )
    );

-- Allow service role to insert cancellation feedback
CREATE POLICY "Service role can insert cancellation feedback" ON public.cancellation_feedback
    FOR INSERT WITH CHECK (true);

-- Allow service role to read all cancellation feedback for analytics
CREATE POLICY "Service role can read all cancellation feedback" ON public.cancellation_feedback
    FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON public.cancellation_feedback TO authenticated;
GRANT ALL ON public.cancellation_feedback TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.cancellation_feedback IS 'Stores user feedback and reasons when they cancel subscriptions for business insights';
COMMENT ON COLUMN public.cancellation_feedback.reason IS 'Cancellation reason ID from predefined list (too-expensive, not-using, missing-features, etc.)';
COMMENT ON COLUMN public.cancellation_feedback.feedback IS 'Optional free-text feedback from the user';
COMMENT ON COLUMN public.cancellation_feedback.cancel_at_period_end IS 'Whether the cancellation was immediate or at period end';
