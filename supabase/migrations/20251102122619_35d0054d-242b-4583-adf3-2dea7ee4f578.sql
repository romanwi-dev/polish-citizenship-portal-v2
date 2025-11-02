-- Phase 1: Smart Document Classification Schema
-- Add columns for AI-powered document classification and form data tracking

ALTER TABLE documents
ADD COLUMN IF NOT EXISTS ai_detected_type TEXT,
ADD COLUMN IF NOT EXISTS ai_detected_person TEXT,
ADD COLUMN IF NOT EXISTS detection_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS user_overrode_detection BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_applied_to_forms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS applied_by UUID REFERENCES auth.users(id);

-- Add index for classification queries
CREATE INDEX IF NOT EXISTS idx_documents_ai_detection ON documents(ai_detected_type, ai_detected_person);
CREATE INDEX IF NOT EXISTS idx_documents_applied ON documents(data_applied_to_forms, case_id);

-- Comment for documentation
COMMENT ON COLUMN documents.ai_detected_type IS 'AI-detected document type (birth_certificate, marriage_certificate, etc.)';
COMMENT ON COLUMN documents.ai_detected_person IS 'AI-detected person type (AP, F, M, PGF, PGM, MGF, MGM, SPOUSE)';
COMMENT ON COLUMN documents.detection_confidence IS 'AI confidence score for classification (0.0 - 1.0)';
COMMENT ON COLUMN documents.user_overrode_detection IS 'True if HAC manually corrected AI classification';
COMMENT ON COLUMN documents.data_applied_to_forms IS 'True if OCR data has been applied to master_table';
COMMENT ON COLUMN documents.applied_at IS 'Timestamp when OCR data was applied to forms';
COMMENT ON COLUMN documents.applied_by IS 'User who applied OCR data to forms';