-- Sprint 2: Create complete translation workflow schema (correct order)

-- Sworn translators table
CREATE TABLE sworn_translators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  certification_number TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  languages JSONB DEFAULT '[]'::jsonb,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  total_jobs_completed INTEGER DEFAULT 0,
  hourly_rate_pln DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Translation agencies table
CREATE TABLE translation_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  languages JSONB DEFAULT '[]'::jsonb,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  total_jobs_completed INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Translation requests table
CREATE TABLE translation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  assigned_translator_id UUID REFERENCES sworn_translators(id),
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL DEFAULT 'PL',
  word_count INTEGER,
  estimated_days INTEGER,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  deadline DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  internal_notes TEXT,
  client_visible BOOLEAN DEFAULT TRUE,
  estimated_cost_pln DECIMAL(10,2),
  actual_cost_pln DECIMAL(10,2),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  certified_translation_document_id UUID REFERENCES documents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sworn_translators ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_requests ENABLE ROW LEVEL SECURITY;

-- Policies for sworn_translators
CREATE POLICY "Staff can manage sworn translators"
  ON sworn_translators FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- Policies for translation_agencies
CREATE POLICY "Staff can manage translation agencies"
  ON translation_agencies FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- Policies for translation_requests
CREATE POLICY "Staff can manage translation requests"
  ON translation_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Clients can view their visible translation requests"
  ON translation_requests FOR SELECT
  USING (
    client_visible = TRUE AND
    EXISTS (
      SELECT 1 FROM client_portal_access
      WHERE client_portal_access.case_id = translation_requests.case_id
      AND client_portal_access.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_translation_requests_case ON translation_requests(case_id);
CREATE INDEX idx_translation_requests_document ON translation_requests(document_id);
CREATE INDEX idx_translation_requests_status ON translation_requests(status);
CREATE INDEX idx_translation_requests_priority ON translation_requests(priority);
CREATE INDEX idx_translation_requests_deadline ON translation_requests(deadline);
CREATE INDEX idx_translation_requests_assigned_translator ON translation_requests(assigned_translator_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sworn_translators_updated_at
  BEFORE UPDATE ON sworn_translators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER translation_agencies_updated_at
  BEFORE UPDATE ON translation_agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER translation_requests_updated_at
  BEFORE UPDATE ON translation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();