-- Phase 3: Document Status Tracking
-- Add PDF status tracking to documents table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pdf_status') THEN
    CREATE TYPE pdf_status AS ENUM (
      'generated',
      'edited',
      'printed',
      'signed',
      'sent',
      'received',
      'archived'
    );
  END IF;
END $$;

-- Add status tracking columns to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS pdf_status pdf_status DEFAULT 'generated',
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS fedex_label_url TEXT,
ADD COLUMN IF NOT EXISTS signature_data TEXT,
ADD COLUMN IF NOT EXISTS validation_passed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS validation_errors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_corrections JSONB DEFAULT '[]'::jsonb;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_documents_pdf_status ON public.documents(pdf_status);
CREATE INDEX IF NOT EXISTS idx_documents_tracking ON public.documents(tracking_number) WHERE tracking_number IS NOT NULL;

-- Create PDF history tracking table
CREATE TABLE IF NOT EXISTS public.pdf_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status pdf_status,
  new_status pdf_status,
  changed_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on pdf_history
ALTER TABLE public.pdf_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for pdf_history
CREATE POLICY "Staff can view PDF history"
  ON public.pdf_history
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'assistant'::app_role)
  );

CREATE POLICY "Staff can create PDF history"
  ON public.pdf_history
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'assistant'::app_role)
  );

-- Create function to log PDF status changes
CREATE OR REPLACE FUNCTION log_pdf_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.pdf_status IS DISTINCT FROM NEW.pdf_status) THEN
    INSERT INTO public.pdf_history (document_id, action, old_status, new_status, changed_by)
    VALUES (NEW.id, 'status_change', OLD.pdf_status, NEW.pdf_status, auth.uid());
    
    NEW.status_updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for PDF status changes
DROP TRIGGER IF EXISTS trigger_log_pdf_status_change ON public.documents;
CREATE TRIGGER trigger_log_pdf_status_change
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION log_pdf_status_change();