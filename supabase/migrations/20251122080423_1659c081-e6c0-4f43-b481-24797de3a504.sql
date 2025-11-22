-- Phase 1: Critical Database Fixes
-- Add exponential backoff support to documents table

-- Add exponential backoff field to documents
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS ocr_next_retry_at TIMESTAMPTZ;

-- Add index for efficient retry scheduling
CREATE INDEX IF NOT EXISTS idx_documents_ocr_next_retry 
ON documents(ocr_next_retry_at) 
WHERE ocr_status = 'pending';

-- Add comment for documentation
COMMENT ON COLUMN documents.ocr_next_retry_at IS 'Timestamp when the document is eligible for the next OCR retry attempt (exponential backoff)';