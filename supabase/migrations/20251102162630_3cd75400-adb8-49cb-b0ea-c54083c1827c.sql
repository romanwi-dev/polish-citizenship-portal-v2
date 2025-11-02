-- Add missing OCR-related columns to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS translated_text_polish TEXT,
ADD COLUMN IF NOT EXISTS translated_text_english TEXT,
ADD COLUMN IF NOT EXISTS translation_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS ai_generated_name TEXT,
ADD COLUMN IF NOT EXISTS name_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS ai_description TEXT,
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS document_tags TEXT[],
ADD COLUMN IF NOT EXISTS archival_significance TEXT CHECK (archival_significance IN ('high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS legal_validity TEXT,
ADD COLUMN IF NOT EXISTS folder_category TEXT,
ADD COLUMN IF NOT EXISTS subfolder_path TEXT;

-- Add comment explaining these fields
COMMENT ON COLUMN public.documents.translated_text_polish IS 'AI-generated Polish translation from OCR';
COMMENT ON COLUMN public.documents.translated_text_english IS 'AI-generated English translation from OCR';
COMMENT ON COLUMN public.documents.translation_confidence IS 'Confidence score for AI translations (0-1)';
COMMENT ON COLUMN public.documents.ai_generated_name IS 'Suggested filename from OCR AI';
COMMENT ON COLUMN public.documents.ai_description IS 'Full document description from OCR AI';
COMMENT ON COLUMN public.documents.ai_summary IS 'Brief summary from OCR AI';
COMMENT ON COLUMN public.documents.archival_significance IS 'Importance for citizenship case: high, medium, low';
COMMENT ON COLUMN public.documents.legal_validity IS 'Legal status: valid_as_is, requires_apostille, requires_certified_translation, requires_both';