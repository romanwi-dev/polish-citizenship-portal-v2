-- Add verification columns to documents table for PDF generation quality tracking
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS pre_verification_result jsonb,
ADD COLUMN IF NOT EXISTS pre_verification_score numeric,
ADD COLUMN IF NOT EXISTS post_verification_result jsonb,
ADD COLUMN IF NOT EXISTS post_verification_score numeric,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

-- Add comment for documentation
COMMENT ON COLUMN documents.pre_verification_result IS 'OpenAI pre-generation verification result including scores and recommendations';
COMMENT ON COLUMN documents.pre_verification_score IS 'Overall score (0-10) from pre-generation verification';
COMMENT ON COLUMN documents.post_verification_result IS 'OpenAI post-generation verification result comparing actual PDF to proposal';
COMMENT ON COLUMN documents.post_verification_score IS 'Overall score (0-10) from post-generation verification';
COMMENT ON COLUMN documents.verification_status IS 'Status: pending, verified, or failed';