-- Add version column to documents table for optimistic locking
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;

-- Create index for faster version lookups
CREATE INDEX IF NOT EXISTS idx_documents_version ON public.documents(id, version);

-- Add function to increment version on updates
CREATE OR REPLACE FUNCTION public.increment_document_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-increment version
DROP TRIGGER IF EXISTS increment_document_version_trigger ON public.documents;
CREATE TRIGGER increment_document_version_trigger
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_document_version();

-- Add comment for documentation
COMMENT ON COLUMN public.documents.version IS 'Optimistic locking version number - incremented on each update to prevent race conditions';