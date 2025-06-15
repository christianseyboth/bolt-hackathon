-- Fix scheduled_reports table schema
-- Run this in your Supabase SQL Editor

-- First, check if the table exists and what columns it has
-- (This is just for reference, you can see the output in the Results tab)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'scheduled_reports'
  AND table_schema = 'public';

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scheduled_reports'
          AND column_name = 'updated_at'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.scheduled_reports
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scheduled_reports'
          AND column_name = 'created_at'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.scheduled_reports
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Ensure next_run column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scheduled_reports'
          AND column_name = 'next_run'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.scheduled_reports
        ADD COLUMN next_run TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS handle_scheduled_reports_updated_at ON public.scheduled_reports;

-- Recreate the trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER handle_scheduled_reports_updated_at
    BEFORE UPDATE ON public.scheduled_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime if not already enabled
DO $$
BEGIN
    -- Check if table is already in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND tablename = 'scheduled_reports'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_reports;
    END IF;
END $$;

-- Verify the final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'scheduled_reports'
  AND table_schema = 'public'
ORDER BY ordinal_position;
