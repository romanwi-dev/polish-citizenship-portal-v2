-- Create storage bucket for PDF templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-templates', 'pdf-templates', false);

-- Allow authenticated users to read PDF templates
CREATE POLICY "Anyone can read PDF templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf-templates');

-- Allow service role to upload PDF templates (for admin use)
CREATE POLICY "Service role can upload PDF templates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pdf-templates' AND auth.role() = 'service_role');