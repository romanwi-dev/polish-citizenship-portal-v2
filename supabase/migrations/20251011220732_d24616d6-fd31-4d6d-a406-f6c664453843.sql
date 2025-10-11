-- Create storage bucket for client photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-photos',
  'client-photos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies for client photos
CREATE POLICY "Public access to client photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-photos');

CREATE POLICY "Admins can upload client photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-photos' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role))
);

CREATE POLICY "Admins can update client photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'client-photos' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role))
);

CREATE POLICY "Admins can delete client photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'client-photos' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role))
);

-- Add client_photo_url column to cases table
ALTER TABLE public.cases
ADD COLUMN client_photo_url text;