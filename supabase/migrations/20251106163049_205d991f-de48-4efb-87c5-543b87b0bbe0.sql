-- Add PDF generation tracking to workflow_instances
ALTER TABLE workflow_instances 
ADD COLUMN IF NOT EXISTS pdf_generation_status TEXT DEFAULT 'not_started' CHECK (pdf_generation_status IN ('not_started', 'generating', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS approved_for_generation_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES auth.users(id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_workflow_instances_pdf_status ON workflow_instances(pdf_generation_status);

-- Add storage bucket for draft PDFs if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('document-pdfs', 'document-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for PDF storage
CREATE POLICY "Authenticated users can view PDFs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'document-pdfs' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Service role can insert PDFs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'document-pdfs'
  AND auth.role() = 'service_role'
);

CREATE POLICY "Service role can update PDFs" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'document-pdfs'
  AND auth.role() = 'service_role'
);

CREATE POLICY "Service role can delete PDFs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'document-pdfs'
  AND auth.role() = 'service_role'
);