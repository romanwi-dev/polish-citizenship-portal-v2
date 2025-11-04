-- Create ocr_conflicts table for tracking field conflicts
CREATE TABLE IF NOT EXISTS public.ocr_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  ocr_value TEXT,
  manual_value TEXT,
  confidence DECIMAL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create form_field_sources table for audit trail
CREATE TABLE IF NOT EXISTS public.form_field_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('manual', 'ocr', 'api')),
  source_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  applied_at TIMESTAMPTZ DEFAULT now(),
  applied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  field_value TEXT
);

-- Enable RLS
ALTER TABLE public.ocr_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_field_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ocr_conflicts
CREATE POLICY "Users can view their own ocr_conflicts"
  ON public.ocr_conflicts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own ocr_conflicts"
  ON public.ocr_conflicts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own ocr_conflicts"
  ON public.ocr_conflicts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for form_field_sources
CREATE POLICY "Users can view their own form_field_sources"
  ON public.form_field_sources FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own form_field_sources"
  ON public.form_field_sources FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_ocr_conflicts_case_id ON public.ocr_conflicts(case_id);
CREATE INDEX idx_ocr_conflicts_document_id ON public.ocr_conflicts(document_id);
CREATE INDEX idx_form_field_sources_case_id ON public.form_field_sources(case_id);
CREATE INDEX idx_form_field_sources_field_name ON public.form_field_sources(field_name);

-- Create updated_at trigger
CREATE TRIGGER update_ocr_conflicts_updated_at
  BEFORE UPDATE ON public.ocr_conflicts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();