-- Flexible handle_new_user function that works with different accounts table structures
-- This automatically creates a free account for every new user

-- First, let's check what columns your accounts table has:
-- Run this query in Supabase SQL Editor to see your table structure:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'accounts' AND table_schema = 'public';

-- Option 1: Basic accounts table (minimal columns)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a new free account for the new user
    -- Adjust the column names based on your actual accounts table structure
    INSERT INTO public.accounts (
        owner_id
        -- Add other columns as needed based on your table structure
        -- Common variations:
        -- name,
        -- plan,
        -- tier,
        -- status,
        -- subscription_tier,
        -- created_at,
        -- updated_at
    ) VALUES (
        NEW.id
        -- Add corresponding values:
        -- COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)) || '''s Account',
        -- 'free',
        -- 'free',
        -- 'active',
        -- 'free',
        -- NOW(),
        -- NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative: If you know your exact table structure, uncomment and modify this:
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.accounts (
        owner_id,
        name,
        tier,
        status,
        created_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)) || '''s Account',
        'free',
        'active',
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
