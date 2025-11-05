-- Add PDF workflow version tracking columns to documents table
-- These columns track the lifecycle of PDF documents through editing and printing

ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS pdf_original_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_edited_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_locked_url TEXT,
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

-- Add comments for clarity
COMMENT ON COLUMN public.documents.pdf_original_url IS 'URL of the first generated editable PDF';
COMMENT ON COLUMN public.documents.pdf_edited_url IS 'URL of the manually edited PDF (uploaded by user)';
COMMENT ON COLUMN public.documents.pdf_locked_url IS 'URL of the final locked PDF ready for printing';
COMMENT ON COLUMN public.documents.edit_count IS 'Number of times the PDF has been edited';
COMMENT ON COLUMN public.documents.last_edited_at IS 'Timestamp of the last edit';
COMMENT ON COLUMN public.documents.locked_at IS 'Timestamp when PDF was locked for printing';

-- Create index for efficient queries on workflow status
CREATE INDEX IF NOT EXISTS idx_documents_pdf_workflow 
ON public.documents(pdf_status, locked_at) 
WHERE pdf_status IS NOT NULL;