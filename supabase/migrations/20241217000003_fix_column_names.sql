-- Fix column naming inconsistency in subscriptions table
-- Check if we have 'status' column and rename it to 'subscription_status'

-- First, check if we have the old 'status' column and rename it
DO $$
BEGIN
    -- Check if 'status' column exists and 'subscription_status' doesn't
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'subscriptions'
        AND column_name = 'status'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'subscriptions'
        AND column_name = 'subscription_status'
        AND table_schema = 'public'
    ) THEN
        -- Rename status to subscription_status
        ALTER TABLE public.subscriptions RENAME COLUMN status TO subscription_status;
        RAISE NOTICE 'Renamed status column to subscription_status';
    END IF;

    -- If we have both columns, copy data from status to subscription_status and drop status
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'subscriptions'
        AND column_name = 'status'
        AND table_schema = 'public'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'subscriptions'
        AND column_name = 'subscription_status'
        AND table_schema = 'public'
    ) THEN
        -- Copy data from status to subscription_status where subscription_status is null
        UPDATE public.subscriptions
        SET subscription_status = status
        WHERE subscription_status IS NULL AND status IS NOT NULL;

        -- Drop the old status column
        ALTER TABLE public.subscriptions DROP COLUMN status;
        RAISE NOTICE 'Migrated data from status to subscription_status and dropped status column';
    END IF;

    -- Ensure subscription_status column exists with proper default
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'subscriptions'
        AND column_name = 'subscription_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.subscriptions ADD COLUMN subscription_status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added subscription_status column';
    END IF;
END $$;

-- Ensure the constraint exists on the correct column
DROP CONSTRAINT IF EXISTS subscriptions_status_check ON public.subscriptions;
DROP CONSTRAINT IF EXISTS subscriptions_subscription_status_check ON public.subscriptions;

-- Add the correct constraint
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_subscription_status_check
CHECK (subscription_status IN ('active', 'cancelled', 'trialing', 'past_due', 'incomplete', 'incomplete_expired', 'unpaid'));

-- Update any existing records with invalid status values
UPDATE public.subscriptions
SET subscription_status = 'active'
WHERE subscription_status NOT IN ('active', 'cancelled', 'trialing', 'past_due', 'incomplete', 'incomplete_expired', 'unpaid')
OR subscription_status IS NULL;
