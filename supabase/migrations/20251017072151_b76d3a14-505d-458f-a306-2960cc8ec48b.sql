-- ====================================
-- PHASE 1: FIX CLIENT AUTHENTICATION
-- ====================================

-- Update client_portal_access to ensure user_id is properly linked
ALTER TABLE client_portal_access 
  ALTER COLUMN user_id SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_client_portal_access_user_id 
  ON client_portal_access(user_id);

-- Drop old RLS policies and create new secure ones
DROP POLICY IF EXISTS "Clients can view their own cases" ON cases;
DROP POLICY IF EXISTS "Clients view own documents" ON documents;
DROP POLICY IF EXISTS "Clients can view their own intake data" ON intake_data;
DROP POLICY IF EXISTS "Clients can view their own master data" ON master_table;
DROP POLICY IF EXISTS "Clients can view their own POAs" ON poa;
DROP POLICY IF EXISTS "Clients can view their own OBY forms" ON oby_forms;

-- Create new RLS policies using proper auth.uid()
CREATE POLICY "Clients can view their own cases"
ON cases FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM client_portal_access 
    WHERE user_id = auth.uid() 
    AND case_id = cases.id
  )
);

CREATE POLICY "Clients view own documents"
ON documents FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM client_portal_access 
    WHERE user_id = auth.uid() 
    AND case_id = documents.case_id
  )
);

CREATE POLICY "Clients can view their own intake data"
ON intake_data FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM client_portal_access 
    WHERE user_id = auth.uid() 
    AND case_id = intake_data.case_id
  )
);

CREATE POLICY "Clients can view their own master data"
ON master_table FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM client_portal_access 
    WHERE user_id = auth.uid() 
    AND case_id = master_table.case_id
  )
);

CREATE POLICY "Clients can view their own POAs"
ON poa FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM client_portal_access 
    WHERE user_id = auth.uid() 
    AND case_id = poa.case_id
  )
);

CREATE POLICY "Clients can view their own OBY forms"
ON oby_forms FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM client_portal_access 
    WHERE user_id = auth.uid() 
    AND case_id = oby_forms.case_id
  )
);

-- ====================================
-- PHASE 3: OCR PROCESSING AUDIT TRAIL
-- ====================================

-- Create OCR processing logs table for security audit trail
CREATE TABLE IF NOT EXISTS ocr_processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  processing_duration_ms integer,
  image_size_bytes bigint,
  extracted_fields jsonb DEFAULT '{}'::jsonb,
  confidence numeric,
  processed_by uuid REFERENCES auth.users(id),
  image_deleted_at timestamptz,
  memory_used_mb numeric,
  status text DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on OCR logs
ALTER TABLE ocr_processing_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view processing logs
CREATE POLICY "Admins view OCR logs"
ON ocr_processing_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- System can insert logs (public access for edge functions)
CREATE POLICY "System can insert OCR logs"
ON ocr_processing_logs FOR INSERT
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ocr_logs_document_id ON ocr_processing_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_ocr_logs_case_id ON ocr_processing_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_ocr_logs_started_at ON ocr_processing_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ocr_logs_status ON ocr_processing_logs(status);

COMMENT ON TABLE ocr_processing_logs IS 'Audit trail for all OCR processing operations - tracks image processing, deletion, and compliance';
COMMENT ON COLUMN ocr_processing_logs.image_deleted_at IS 'Timestamp proving image was deleted from memory after processing';
COMMENT ON COLUMN ocr_processing_logs.memory_used_mb IS 'Peak memory usage during processing for monitoring';