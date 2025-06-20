-- Enable realtime for mail_events table
-- This migration adds the mail_events table to the supabase_realtime publication
-- so that realtime subscriptions can work properly

-- Check if mail_events table exists and add it to realtime publication
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'mail_events'
        AND table_schema = 'public'
    ) THEN
        -- Check if table is already in the publication
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND tablename = 'mail_events'
        ) THEN
            -- Add table to realtime publication
            ALTER PUBLICATION supabase_realtime ADD TABLE public.mail_events;
            RAISE NOTICE 'Added mail_events table to supabase_realtime publication';
        ELSE
            RAISE NOTICE 'mail_events table is already in supabase_realtime publication';
        END IF;
    ELSE
        RAISE NOTICE 'mail_events table does not exist - skipping realtime setup';
    END IF;
END $$;

-- Verify the setup
SELECT
    tablename,
    pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'mail_events';
