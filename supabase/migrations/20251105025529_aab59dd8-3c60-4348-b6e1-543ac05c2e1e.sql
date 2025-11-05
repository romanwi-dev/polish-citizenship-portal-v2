-- Add missing error tracking column
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ocr_error_message TEXT;

-- Reset all failed documents to allow retry
UPDATE documents 
SET ocr_status = 'queued', 
    ocr_retry_count = 0,
    ocr_error_message = NULL
WHERE ocr_status = 'failed';