-- Create PDF queue table for asynchronous PDF generation
CREATE TABLE IF NOT EXISTS public.pdf_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  pdf_url TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create index for efficient queue processing
CREATE INDEX idx_pdf_queue_status_created ON public.pdf_queue(status, created_at) WHERE status IN ('queued', 'processing');
CREATE INDEX idx_pdf_queue_case_id ON public.pdf_queue(case_id);

-- Enable RLS
ALTER TABLE public.pdf_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Cases don't have user_id, use client_portal_access instead
CREATE POLICY "Users can view their PDF queue jobs"
  ON public.pdf_queue
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'assistant'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.client_portal_access
      WHERE client_portal_access.case_id = pdf_queue.case_id
      AND client_portal_access.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert PDF queue jobs"
  ON public.pdf_queue
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'assistant'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.client_portal_access
      WHERE client_portal_access.case_id = pdf_queue.case_id
      AND client_portal_access.user_id = auth.uid()
    )
  );

CREATE POLICY "System can update PDF queue jobs"
  ON public.pdf_queue
  FOR UPDATE
  USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_pdf_queue_updated_at
  BEFORE UPDATE ON public.pdf_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to cleanup old completed/failed jobs (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_pdf_queue_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.pdf_queue
  WHERE status IN ('completed', 'failed')
    AND completed_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Function to reset stuck jobs (processing for more than 5 minutes)
CREATE OR REPLACE FUNCTION reset_stuck_pdf_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.pdf_queue
  SET 
    status = 'failed',
    error_message = 'Processing timeout - job was stuck for more than 5 minutes',
    completed_at = NOW()
  WHERE status = 'processing'
    AND updated_at < NOW() - INTERVAL '5 minutes';
END;
$$;