-- Add OBY (citizenship application) tracking fields to master_table
ALTER TABLE public.master_table
ADD COLUMN IF NOT EXISTS oby_status TEXT DEFAULT 'not_started' CHECK (oby_status IN ('not_started', 'draft', 'review', 'filed', 'submitted')),
ADD COLUMN IF NOT EXISTS oby_draft_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS oby_filed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS oby_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS oby_hac_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS oby_hac_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS oby_hac_notes TEXT,
ADD COLUMN IF NOT EXISTS oby_reference_number TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_master_table_oby_status ON public.master_table(oby_status);
CREATE INDEX IF NOT EXISTS idx_master_table_case_oby ON public.master_table(case_id, oby_status);

COMMENT ON COLUMN public.master_table.oby_status IS 'Status of citizenship application (OBY): not_started, draft, review, filed, submitted';
COMMENT ON COLUMN public.master_table.oby_filed_at IS 'When OBY was marked as filed and ready to submit';
COMMENT ON COLUMN public.master_table.oby_submitted_at IS 'When OBY was actually submitted to government';