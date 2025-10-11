-- Fix pdf-templates bucket permissions
-- Make bucket public and update RLS policies

UPDATE storage.buckets 
SET public = true 
WHERE id = 'pdf-templates';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can upload to pdf-templates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update pdf-templates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from pdf-templates" ON storage.objects;

-- Create permissive policies for pdf-templates
CREATE POLICY "Anyone can view pdf-templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf-templates');

CREATE POLICY "Authenticated users can upload pdf-templates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdf-templates' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update pdf-templates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pdf-templates' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete pdf-templates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pdf-templates' AND
  auth.uid() IS NOT NULL
);