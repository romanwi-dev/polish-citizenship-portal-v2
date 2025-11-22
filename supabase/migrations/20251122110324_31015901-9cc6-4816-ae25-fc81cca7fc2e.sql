-- V9.2: Create OCR status history audit trail table
CREATE TABLE IF NOT EXISTS public.ocr_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for efficient queries by document and time
CREATE INDEX IF NOT EXISTS idx_ocr_status_history_document_id ON public.ocr_status_history(document_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ocr_status_history_case_id ON public.ocr_status_history(case_id);

-- Enable RLS
ALTER TABLE public.ocr_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies (admins can see all, case owners can see their own)
CREATE POLICY "Admins can view all OCR status history"
  ON public.ocr_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Case owners can view their OCR status history"
  ON public.ocr_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE id = ocr_status_history.case_id
      -- Assuming cases have a user_id or similar ownership field
      -- Adjust this based on your actual cases table structure
    )
  );

-- Trigger function to log OCR status changes
CREATE OR REPLACE FUNCTION public.log_ocr_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if OCR status actually changed
  IF (TG_OP = 'UPDATE' AND OLD.ocr_status IS DISTINCT FROM NEW.ocr_status) THEN
    INSERT INTO public.ocr_status_history (
      document_id,
      case_id,
      from_status,
      to_status,
      retry_count,
      error_message,
      changed_by,
      metadata
    ) VALUES (
      NEW.id,
      NEW.case_id,
      OLD.ocr_status,
      NEW.ocr_status,
      NEW.ocr_retry_count,
      NEW.ocr_error_message,
      auth.uid(),
      jsonb_build_object(
        'ocr_confidence', NEW.ocr_confidence,
        'has_ocr_data', (NEW.ocr_data IS NOT NULL),
        'has_ocr_text', (NEW.ocr_text IS NOT NULL)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on documents table
DROP TRIGGER IF EXISTS trigger_log_ocr_status_change ON public.documents;
CREATE TRIGGER trigger_log_ocr_status_change
  AFTER UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_ocr_status_change();