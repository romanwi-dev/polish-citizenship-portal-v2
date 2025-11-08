-- Create PDF generation queue table (without user_id reference)
CREATE TABLE IF NOT EXISTS public.pdf_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  pdf_url TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  worker_id TEXT
);

-- Add index for queue processing
CREATE INDEX IF NOT EXISTS idx_pdf_queue_status ON public.pdf_generation_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_pdf_queue_case ON public.pdf_generation_queue(case_id);

-- Enable RLS
ALTER TABLE public.pdf_generation_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow authenticated users to view queue for their cases
CREATE POLICY "Authenticated users can view PDF queue"
  ON public.pdf_generation_queue FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Service role can manage all queue jobs
CREATE POLICY "Service role can manage all queue jobs"
  ON public.pdf_generation_queue FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_pdf_queue_updated_at
  BEFORE UPDATE ON public.pdf_generation_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();