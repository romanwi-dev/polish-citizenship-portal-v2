-- Add triggers for automatic updated_at timestamp updates (only for tables that don't have them yet)

-- Check and add trigger for documents
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_documents_updated_at'
  ) THEN
    CREATE TRIGGER update_documents_updated_at
      BEFORE UPDATE ON public.documents
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Check and add trigger for intake_data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_intake_data_updated_at'
  ) THEN
    CREATE TRIGGER update_intake_data_updated_at
      BEFORE UPDATE ON public.intake_data
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Check and add trigger for civil_acts_requests
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_civil_acts_requests_updated_at'
  ) THEN
    CREATE TRIGGER update_civil_acts_requests_updated_at
      BEFORE UPDATE ON public.civil_acts_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Check and add trigger for archive_searches
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_archive_searches_updated_at'
  ) THEN
    CREATE TRIGGER update_archive_searches_updated_at
      BEFORE UPDATE ON public.archive_searches
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Check and add trigger for local_document_requests
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_local_document_requests_updated_at'
  ) THEN
    CREATE TRIGGER update_local_document_requests_updated_at
      BEFORE UPDATE ON public.local_document_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Check and add trigger for contact_submissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_contact_submissions_updated_at'
  ) THEN
    CREATE TRIGGER update_contact_submissions_updated_at
      BEFORE UPDATE ON public.contact_submissions
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Check and add trigger for ai_conversations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_ai_conversations_updated_at'
  ) THEN
    CREATE TRIGGER update_ai_conversations_updated_at
      BEFORE UPDATE ON public.ai_conversations
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;