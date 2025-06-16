-- Add company billing information fields to accounts table
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_address_line1 TEXT,
ADD COLUMN IF NOT EXISTS company_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS company_city TEXT,
ADD COLUMN IF NOT EXISTS company_state TEXT,
ADD COLUMN IF NOT EXISTS company_postal_code TEXT,
ADD COLUMN IF NOT EXISTS company_country TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS company_tax_id TEXT,
ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'individual' CHECK (billing_type IN ('individual', 'business')),
ADD COLUMN IF NOT EXISTS vat_number TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_billing_type ON public.accounts(billing_type);
CREATE INDEX IF NOT EXISTS idx_accounts_company_name ON public.accounts(company_name);

-- Add helpful comments
COMMENT ON COLUMN public.accounts.company_name IS 'Business/company name for business billing';
COMMENT ON COLUMN public.accounts.company_address_line1 IS 'Primary address line for business billing';
COMMENT ON COLUMN public.accounts.company_address_line2 IS 'Secondary address line (suite, apt, etc.)';
COMMENT ON COLUMN public.accounts.company_city IS 'City for business billing address';
COMMENT ON COLUMN public.accounts.company_state IS 'State/province for business billing address';
COMMENT ON COLUMN public.accounts.company_postal_code IS 'ZIP/postal code for business billing address';
COMMENT ON COLUMN public.accounts.company_country IS 'Country code for business billing address (ISO 3166-1 alpha-2)';
COMMENT ON COLUMN public.accounts.company_tax_id IS 'Tax ID/EIN for business billing';
COMMENT ON COLUMN public.accounts.billing_type IS 'Whether this is individual or business billing';
COMMENT ON COLUMN public.accounts.vat_number IS 'VAT number for international business billing';
