-- Create passport_applications table
CREATE TABLE passport_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  
  -- Applicant info
  applicant_type TEXT NOT NULL CHECK (applicant_type IN ('primary', 'spouse', 'child')),
  applicant_first_name TEXT,
  applicant_last_name TEXT,
  applicant_dob DATE,
  
  -- Application details
  consulate_location TEXT,
  consulate_country TEXT,
  appointment_date TIMESTAMPTZ,
  appointment_confirmed BOOLEAN DEFAULT false,
  
  -- Status tracking
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'appointment_scheduled', 'documents_submitted', 'in_review', 'approved', 'passport_issued', 'passport_received', 'cancelled')),
  
  -- Document checklist
  checklist_generated BOOLEAN DEFAULT false,
  checklist_document_id UUID REFERENCES documents(id),
  
  -- Passport details
  passport_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  collection_method TEXT CHECK (collection_method IN ('pickup', 'mail', 'courier')),
  
  -- Tracking
  submitted_date DATE,
  approved_date DATE,
  issued_date DATE,
  received_date DATE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE passport_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can manage passport applications"
  ON passport_applications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Clients can view their passport applications"
  ON passport_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE case_id = passport_applications.case_id
    AND user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_passport_case_id ON passport_applications(case_id);
CREATE INDEX idx_passport_status ON passport_applications(status);
CREATE INDEX idx_passport_appointment_date ON passport_applications(appointment_date);

-- Trigger for updated_at
CREATE TRIGGER update_passport_updated_at
  BEFORE UPDATE ON passport_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();