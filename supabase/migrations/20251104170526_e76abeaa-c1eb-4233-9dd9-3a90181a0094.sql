-- Add PII consent tracking to cases table
ALTER TABLE public.cases
ADD COLUMN IF NOT EXISTS ai_processing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_consent_given_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS ai_consent_given_by uuid REFERENCES auth.users(id);

-- Create audit log for AI PII processing
CREATE TABLE IF NOT EXISTS public.ai_pii_processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  operation_type text NOT NULL, -- 'ocr', 'classification', 'verification'
  pii_fields_sent jsonb NOT NULL, -- Array of field names sent to AI
  ai_provider text NOT NULL, -- 'openai', 'gemini', 'lovable-ai'
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.ai_pii_processing_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all logs
CREATE POLICY "Admins can view all PII logs"
  ON public.ai_pii_processing_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view logs for their own cases
CREATE POLICY "Users can view PII logs for their cases"
  ON public.ai_pii_processing_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_pii_logs_case_id ON public.ai_pii_processing_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_pii_logs_created_at ON public.ai_pii_processing_logs(created_at DESC);