-- Fix storage policies for generated-pdfs bucket
-- Ensure bucket exists (safe if already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-pdfs',
  'generated-pdfs',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- Allow authenticated users and service role to upload PDFs
CREATE POLICY "Allow authenticated uploads to generated-pdfs"
ON storage.objects FOR INSERT
TO authenticated, service_role
WITH CHECK (bucket_id = 'generated-pdfs');

-- Allow authenticated users and service role to update their PDFs
CREATE POLICY "Allow authenticated updates to generated-pdfs"
ON storage.objects FOR UPDATE
TO authenticated, service_role
USING (bucket_id = 'generated-pdfs');

-- Allow authenticated users and service role to read PDFs (needed for signed URLs)
CREATE POLICY "Allow authenticated reads from generated-pdfs"
ON storage.objects FOR SELECT
TO authenticated, service_role
USING (bucket_id = 'generated-pdfs');

-- Allow authenticated users and service role to delete PDFs
CREATE POLICY "Allow authenticated deletes from generated-pdfs"
ON storage.objects FOR DELETE
TO authenticated, service_role
USING (bucket_id = 'generated-pdfs');