-- Create API Keys table
CREATE TABLE api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- User-friendly name for the key
    key_hash TEXT NOT NULL UNIQUE, -- Hashed version of the API key
    key_prefix VARCHAR(20) NOT NULL, -- First few chars for display (pa_live_abc...)
    permissions JSONB DEFAULT '["read"]'::jsonb, -- Array of permissions
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Optional expiration
    is_active BOOLEAN DEFAULT true,
    rate_limit INTEGER DEFAULT 1000, -- Requests per hour

    -- Constraints
    CONSTRAINT api_keys_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
    CONSTRAINT api_keys_valid_permissions CHECK (jsonb_typeof(permissions) = 'array')
);

-- Indexes for performance
CREATE INDEX idx_api_keys_account_id ON api_keys(account_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at) WHERE expires_at IS NOT NULL;

-- Updated at trigger
CREATE TRIGGER api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
CREATE POLICY "Users can view own api keys" ON api_keys
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM accounts WHERE owner_id = auth.uid()
        )
    );

-- Users can create API keys for their own account
CREATE POLICY "Users can create own api keys" ON api_keys
    FOR INSERT WITH CHECK (
        account_id IN (
            SELECT id FROM accounts WHERE owner_id = auth.uid()
        )
    );

-- Users can update their own API keys
CREATE POLICY "Users can update own api keys" ON api_keys
    FOR UPDATE USING (
        account_id IN (
            SELECT id FROM accounts WHERE owner_id = auth.uid()
        )
    );

-- Users can delete their own API keys
CREATE POLICY "Users can delete own api keys" ON api_keys
    FOR DELETE USING (
        account_id IN (
            SELECT id FROM accounts WHERE owner_id = auth.uid()
        )
    );

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
    key_length INTEGER := 32;
    characters TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..key_length LOOP
        result := result || substr(characters, floor(random() * length(characters) + 1)::INTEGER, 1);
    END LOOP;

    RETURN 'pa_live_' || result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to hash API key
CREATE OR REPLACE FUNCTION hash_api_key(api_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(api_key, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get API key prefix for display
CREATE OR REPLACE FUNCTION get_api_key_prefix(api_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN substr(api_key, 1, 12) || '...';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate API key and get account info
CREATE OR REPLACE FUNCTION validate_api_key(api_key TEXT)
RETURNS TABLE(
    account_id UUID,
    permissions JSONB,
    rate_limit INTEGER,
    is_valid BOOLEAN
) AS $$
DECLARE
    key_hash TEXT;
BEGIN
    key_hash := hash_api_key(api_key);

    RETURN QUERY
    SELECT
        ak.account_id,
        ak.permissions,
        ak.rate_limit,
        (ak.is_active AND (ak.expires_at IS NULL OR ak.expires_at > NOW())) as is_valid
    FROM api_keys ak
    WHERE ak.key_hash = validate_api_key.key_hash;

    -- Update last_used_at
    UPDATE api_keys
    SET last_used_at = NOW()
    WHERE api_keys.key_hash = validate_api_key.key_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
