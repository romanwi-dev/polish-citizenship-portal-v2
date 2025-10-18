-- Add signature and signing fields to poa table
ALTER TABLE public.poa
ADD COLUMN IF NOT EXISTS client_signature_url TEXT,
ADD COLUMN IF NOT EXISTS client_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'approved', 'rejected'));

-- Add HAC approval fields
ALTER TABLE public.poa
ADD COLUMN IF NOT EXISTS hac_approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS hac_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS hac_notes TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_poa_status ON public.poa(status);
CREATE INDEX IF NOT EXISTS idx_poa_case_status ON public.poa(case_id, status);