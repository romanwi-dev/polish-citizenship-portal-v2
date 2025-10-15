-- Add OCR-related columns to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS ocr_text TEXT,
ADD COLUMN IF NOT EXISTS ocr_confidence DECIMAL(3,2) CHECK (ocr_confidence >= 0 AND ocr_confidence <= 1),
ADD COLUMN IF NOT EXISTS ocr_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ocr_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS ocr_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed', 'needs_review'));

-- Add index for efficient OCR status queries
CREATE INDEX IF NOT EXISTS idx_documents_ocr_status ON public.documents(ocr_status);
CREATE INDEX IF NOT EXISTS idx_documents_ocr_confidence ON public.documents(ocr_confidence);

-- Add document_type column to help with OCR classification
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS document_type TEXT;

-- Create index for document type filtering
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);

COMMENT ON COLUMN public.documents.ocr_text IS 'Full text extracted from document via OCR';
COMMENT ON COLUMN public.documents.ocr_confidence IS 'Confidence score from 0.0 to 1.0';
COMMENT ON COLUMN public.documents.ocr_data IS 'Structured data extracted from document (names, dates, places, translations)';
COMMENT ON COLUMN public.documents.ocr_reviewed_by IS 'User who reviewed the OCR results';
COMMENT ON COLUMN public.documents.ocr_reviewed_at IS 'Timestamp when OCR was reviewed';
COMMENT ON COLUMN public.documents.ocr_status IS 'Status of OCR processing';
COMMENT ON COLUMN public.documents.document_type IS 'Type of document (birth_certificate, marriage_certificate, passport, historical, etc.)';