-- Create storage bucket for generated PDFs (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-pdfs',
  'generated-pdfs',
  false,
  10485760, -- 10MB limit per file
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create table to track generated documents
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL,
  template_type TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on generated_documents
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_generated_documents_case_id ON public.generated_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_created_at ON public.generated_documents(created_at DESC);

-- RLS Policy: Allow service role to insert (edge function)
CREATE POLICY "Service role can insert generated documents"
  ON public.generated_documents
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policy: Authenticated users can view documents for their accessible cases
CREATE POLICY "Users can view their generated documents"
  ON public.generated_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id::text = generated_documents.case_id
    )
  );

-- Storage policy: Only service role can upload (edge function only)
CREATE POLICY "Service role can upload PDFs"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'generated-pdfs');

-- Storage policy: Allow authenticated users to download via signed URLs
-- (The signed URL mechanism already handles auth, this is just for direct access)
CREATE POLICY "Authenticated users can access generated PDFs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'generated-pdfs');