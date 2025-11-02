-- Allow unauthenticated uploads to pdf-templates bucket for admin operations
DROP POLICY IF EXISTS "Authenticated users can upload pdf-templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update pdf-templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete pdf-templates" ON storage.objects;

-- Create new policies that allow anyone to upload/update/delete
CREATE POLICY "Anyone can upload pdf-templates"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'pdf-templates');

CREATE POLICY "Anyone can update pdf-templates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'pdf-templates')
WITH CHECK (bucket_id = 'pdf-templates');

CREATE POLICY "Anyone can delete pdf-templates"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'pdf-templates');