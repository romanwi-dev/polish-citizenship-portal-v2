-- Sprint 3: OCR Conflicts table for conflict detection

CREATE TABLE ocr_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  ocr_value TEXT,
  manual_value TEXT,
  ocr_confidence DECIMAL(5,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved_ocr', 'resolved_manual', 'ignored')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ocr_conflicts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff can manage OCR conflicts"
  ON ocr_conflicts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- Indexes
CREATE INDEX idx_ocr_conflicts_case ON ocr_conflicts(case_id);
CREATE INDEX idx_ocr_conflicts_document ON ocr_conflicts(document_id);
CREATE INDEX idx_ocr_conflicts_status ON ocr_conflicts(status);

-- Trigger for updated_at
CREATE TRIGGER ocr_conflicts_updated_at
  BEFORE UPDATE ON ocr_conflicts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();