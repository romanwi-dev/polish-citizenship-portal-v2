-- Create phase_a_analyses table for storing Phase A analysis results
CREATE TABLE IF NOT EXISTS public.phase_a_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  analysis_text TEXT NOT NULL,
  total_issues INTEGER NOT NULL DEFAULT 0,
  critical_issues TEXT[] DEFAULT '{}',
  proposed_changes TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phase_a_analyses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all analyses
CREATE POLICY "Anyone can view phase A analyses"
  ON public.phase_a_analyses
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert analyses
CREATE POLICY "Authenticated users can insert phase A analyses"
  ON public.phase_a_analyses
  FOR INSERT
  WITH CHECK (true);