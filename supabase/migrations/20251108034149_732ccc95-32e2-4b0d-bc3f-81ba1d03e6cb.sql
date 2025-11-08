-- Create pdf-outputs storage bucket for generated PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-outputs',
  'pdf-outputs',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for pdf-outputs bucket
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdf-outputs');

CREATE POLICY "Anyone can view PDFs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pdf-outputs');

CREATE POLICY "Authenticated users can delete their PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pdf-outputs');