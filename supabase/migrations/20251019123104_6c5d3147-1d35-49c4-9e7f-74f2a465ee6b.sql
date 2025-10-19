-- Add language column to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'UNKNOWN';

-- Add comment for documentation
COMMENT ON COLUMN public.documents.language IS 'Document language: PL, EN, DE, FR, ES, or UNKNOWN';

-- Create index for language filtering
CREATE INDEX IF NOT EXISTS idx_documents_language ON public.documents(language);

-- Create index for translation workflow queries
CREATE INDEX IF NOT EXISTS idx_documents_translation_status 
ON public.documents(needs_translation, is_translated) 
WHERE needs_translation = true;