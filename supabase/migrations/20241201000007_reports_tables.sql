-- Create reports history table
CREATE TABLE IF NOT EXISTS public.report_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('pdf', 'csv', 'xlsx', 'json')),
    size TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'generating')) DEFAULT 'generating',
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled reports table
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('pdf', 'csv', 'xlsx')),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    recipients TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    next_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_report_history_account_id ON public.report_history(account_id);
CREATE INDEX IF NOT EXISTS idx_report_history_created_at ON public.report_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_account_id ON public.scheduled_reports(account_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON public.scheduled_reports(next_run);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_is_active ON public.scheduled_reports(is_active);

-- Enable Row Level Security
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for report_history
CREATE POLICY "Users can view their own report history" ON public.report_history
    FOR SELECT USING (account_id IN (
        SELECT id FROM public.accounts WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own report history" ON public.report_history
    FOR INSERT WITH CHECK (account_id IN (
        SELECT id FROM public.accounts WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can update their own report history" ON public.report_history
    FOR UPDATE USING (account_id IN (
        SELECT id FROM public.accounts WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own report history" ON public.report_history
    FOR DELETE USING (account_id IN (
        SELECT id FROM public.accounts WHERE owner_id = auth.uid()
    ));

-- Create RLS policies for scheduled_reports
CREATE POLICY "Users can view their own scheduled reports" ON public.scheduled_reports
    FOR SELECT USING (account_id IN (
        SELECT id FROM public.accounts WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own scheduled reports" ON public.scheduled_reports
    FOR INSERT WITH CHECK (account_id IN (
        SELECT id FROM public.accounts WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can update their own scheduled reports" ON public.scheduled_reports
    FOR UPDATE USING (account_id IN (
        SELECT id FROM public.accounts WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own scheduled reports" ON public.scheduled_reports
    FOR DELETE USING (account_id IN (
        SELECT id FROM public.accounts WHERE owner_id = auth.uid()
    ));

-- Create trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
CREATE TRIGGER handle_report_history_updated_at
    BEFORE UPDATE ON public.report_history
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_scheduled_reports_updated_at
    BEFORE UPDATE ON public.scheduled_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for report_history table
ALTER PUBLICATION supabase_realtime ADD TABLE public.report_history;
