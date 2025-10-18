-- Create civil_acts_requests table
CREATE TABLE civil_acts_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  
  -- Request details
  request_type TEXT NOT NULL CHECK (request_type IN ('birth', 'marriage', 'death')),
  person_type TEXT NOT NULL CHECK (person_type IN ('AP', 'F', 'M', 'PGF', 'PGM', 'MGF', 'MGM', 'SP')),
  person_first_name TEXT,
  person_last_name TEXT,
  person_maiden_name TEXT,
  
  -- Location details
  registry_office TEXT NOT NULL,
  registry_city TEXT NOT NULL,
  registry_voivodeship TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'in_progress', 'received', 'failed')),
  submitted_date DATE,
  received_date DATE,
  
  -- Payment
  payment_required BOOLEAN DEFAULT true,
  payment_amount NUMERIC(10,2),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_date DATE,
  
  -- Document tracking
  document_id UUID REFERENCES documents(id),
  act_number TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE civil_acts_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can manage civil acts requests"
  ON civil_acts_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Clients can view their civil acts requests"
  ON civil_acts_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE case_id = civil_acts_requests.case_id
    AND user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_civil_acts_case_id ON civil_acts_requests(case_id);
CREATE INDEX idx_civil_acts_status ON civil_acts_requests(status);
CREATE INDEX idx_civil_acts_person_type ON civil_acts_requests(person_type);

-- Trigger for updated_at
CREATE TRIGGER update_civil_acts_updated_at
  BEFORE UPDATE ON civil_acts_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();