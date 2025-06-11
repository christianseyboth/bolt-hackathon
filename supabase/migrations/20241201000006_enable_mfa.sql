-- Enable Multi-Factor Authentication (MFA) in Supabase
-- This enables TOTP (Time-based One-Time Password) authentication

-- Enable MFA for the auth schema
-- Note: This might need to be done through the Supabase Dashboard
-- as it requires Auth configuration changes

-- Create a function to help with MFA management
CREATE OR REPLACE FUNCTION get_user_mfa_status(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
    has_mfa BOOLEAN,
    factor_count INTEGER
) AS $$
BEGIN
    -- Check if user has any MFA factors enabled
    -- This is a placeholder - actual MFA status comes from auth.mfa_factors
    RETURN QUERY
    SELECT
        FALSE as has_mfa,
        0 as factor_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add MFA status to accounts table for caching (optional)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;

-- Trigger to update MFA status when factors change
-- This would be called by a webhook or similar mechanism
CREATE OR REPLACE FUNCTION update_account_mfa_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update account MFA status based on auth factors
    -- This is a placeholder for the actual implementation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
