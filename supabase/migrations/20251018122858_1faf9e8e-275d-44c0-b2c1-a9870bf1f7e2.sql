-- Create USC (Civil Registry) workflow tracking table
CREATE TABLE IF NOT EXISTS public.usc_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('umiejscowienie', 'uzupelnienie')),
  person_type TEXT NOT NULL CHECK (person_type IN ('AP', 'SPOUSE', 'F', 'M', 'PGF', 'PGM', 'MGF', 'MGM')),
  
  -- Document details
  document_type TEXT NOT NULL CHECK (document_type IN ('birth', 'marriage', 'death', 'other')),
  registry_office TEXT,
  registry_city TEXT,
  registry_voivodeship TEXT,
  
  -- Workflow status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'letter_generated', 'sent', 'response_received', 'completed', 'rejected')),
  
  -- Tracking dates
  letter_generated_at TIMESTAMP WITH TIME ZONE,
  letter_sent_at TIMESTAMP WITH TIME ZONE,
  response_received_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Details
  application_details JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Related document
  result_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usc_requests ENABLE ROW LEVEL SECURITY;

-- Policies for USC requests
CREATE POLICY "Staff can manage USC requests"
  ON public.usc_requests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Clients can view their USC requests"
  ON public.usc_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_portal_access
      WHERE client_portal_access.case_id = usc_requests.case_id
      AND client_portal_access.user_id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX idx_usc_requests_case_id ON public.usc_requests(case_id);
CREATE INDEX idx_usc_requests_status ON public.usc_requests(status);

-- Update trigger
CREATE TRIGGER update_usc_requests_updated_at
  BEFORE UPDATE ON public.usc_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();