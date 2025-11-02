-- Create form_field_sources table to track where form data comes from
CREATE TABLE IF NOT EXISTS public.form_field_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('manual', 'ocr', 'api', 'calculated')),
  source_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  confidence DECIMAL(5,2),
  locked BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  applied_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.form_field_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all field sources"
  ON public.form_field_sources
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Staff can manage field sources"
  ON public.form_field_sources
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- Create indexes for performance
CREATE INDEX idx_field_sources_case_id ON public.form_field_sources(case_id);
CREATE INDEX idx_field_sources_document_id ON public.form_field_sources(source_document_id);
CREATE INDEX idx_field_sources_field_name ON public.form_field_sources(field_name);

-- Add trigger for updated_at
CREATE TRIGGER update_form_field_sources_updated_at
  BEFORE UPDATE ON public.form_field_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();