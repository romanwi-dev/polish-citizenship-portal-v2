-- Fix the version increment trigger to use BEFORE UPDATE for atomicity
DROP TRIGGER IF EXISTS increment_document_version_trigger ON public.documents;

-- Remove the problematic trigger function
DROP FUNCTION IF EXISTS public.increment_document_version();

-- Create optimized version increment function with BEFORE UPDATE
CREATE OR REPLACE FUNCTION public.increment_document_version_before()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if this is an actual update (not initial insert)
  IF OLD.version IS NOT NULL THEN
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create BEFORE UPDATE trigger for atomic version control
CREATE TRIGGER increment_document_version_trigger
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_document_version_before();

-- Add index for optimistic locking performance
CREATE INDEX IF NOT EXISTS idx_documents_id_version ON public.documents(id, version);

COMMENT ON FUNCTION public.increment_document_version_before() IS 'BEFORE UPDATE trigger ensures atomic version increment without race conditions';
COMMENT ON COLUMN public.documents.version IS 'Optimistic locking version - auto-incremented atomically in BEFORE UPDATE trigger to prevent race conditions';