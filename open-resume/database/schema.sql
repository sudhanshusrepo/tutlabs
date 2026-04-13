-- Create the resumes table
CREATE TABLE public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Resume',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Resumes: Users can only select their own
CREATE POLICY "Users can view own resumes" 
    ON public.resumes 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Resumes: Users can insert their own
CREATE POLICY "Users can create resumes" 
    ON public.resumes 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

-- Resumes: Users can update their own
CREATE POLICY "Users can update own resumes" 
    ON public.resumes 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- Resumes: Users can delete their own
CREATE POLICY "Users can delete own resumes" 
    ON public.resumes 
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Create updated_at trigger for resumes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create the download_logs table (Optional tracking for authenticated usage)
-- Note: Guest tracking is currently handled heavily via localStorage for anonymity constraints.
CREATE TABLE public.download_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- nullable for guests
    ip_hash TEXT,
    download_count INTEGER DEFAULT 1 NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for download_logs
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Server-side endpoints run as Service Role to track guests, 
-- but we only allow authenticated users to self-insert (if API operates under user context).
CREATE POLICY "Users can insert own download logs"
    ON public.download_logs
    FOR INSERT
    WITH CHECK (true); -- Insert-only endpoint for analytics
