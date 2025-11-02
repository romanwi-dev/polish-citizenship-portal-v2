-- Add 'queued' to the ocr_status CHECK constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_ocr_status_check;

ALTER TABLE documents ADD CONSTRAINT documents_ocr_status_check 
  CHECK (ocr_status = ANY (ARRAY[
    'pending'::text, 
    'queued'::text,
    'processing'::text, 
    'completed'::text, 
    'failed'::text, 
    'needs_review'::text
  ]));