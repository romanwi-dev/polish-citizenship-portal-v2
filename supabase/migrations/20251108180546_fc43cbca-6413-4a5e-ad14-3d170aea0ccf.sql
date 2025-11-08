-- Add OCR tracking columns to POA table
ALTER TABLE poa 
ADD COLUMN IF NOT EXISTS ocr_passport_confidence DECIMAL,
ADD COLUMN IF NOT EXISTS ocr_birth_cert_confidence DECIMAL,
ADD COLUMN IF NOT EXISTS ocr_extracted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS manual_review_required BOOLEAN DEFAULT false;

-- Add FedEx placeholder columns (for future integration)
ALTER TABLE poa 
ADD COLUMN IF NOT EXISTS fedex_tracking_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS fedex_label_url TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(50) DEFAULT 'pending';

-- Create OCR patterns memory table for AI agent learning
CREATE TABLE IF NOT EXISTS ocr_patterns_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_key VARCHAR(100) UNIQUE NOT NULL,
  pattern_data JSONB NOT NULL,
  success_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on OCR patterns memory
ALTER TABLE ocr_patterns_memory ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage OCR patterns
CREATE POLICY "Service role can manage OCR patterns"
ON ocr_patterns_memory
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);