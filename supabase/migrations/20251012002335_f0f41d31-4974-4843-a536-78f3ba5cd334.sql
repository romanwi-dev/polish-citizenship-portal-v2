-- Add new fields to master_table for complete citizenship application support

-- Applicant additional fields
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS applicant_pesel TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS previous_decision_info TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS citizenship_change_permission TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS polish_citizenship_deprivation BOOLEAN DEFAULT false;

-- Parent additional fields
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS mother_marital_status TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS mother_pesel TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS mother_previous_names TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS father_marital_status TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS father_pesel TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS father_previous_names TEXT;

-- Grandparent additional fields
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS mgf_pesel TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS mgf_citizenship_at_birth TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS mgm_pesel TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS pgf_pesel TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS pgf_citizenship_at_birth TEXT;

-- Page 11: Attachment checkboxes (documents filed with application)
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS attachment_1_included BOOLEAN DEFAULT false;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS attachment_2_included BOOLEAN DEFAULT false;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS attachment_3_included BOOLEAN DEFAULT false;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS attachment_4_included BOOLEAN DEFAULT false;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS attachment_5_included BOOLEAN DEFAULT false;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS attachment_6_included BOOLEAN DEFAULT false;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS attachment_7_included BOOLEAN DEFAULT false;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS attachment_8_included BOOLEAN DEFAULT false;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS attachment_9_included BOOLEAN DEFAULT false;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS attachment_10_included BOOLEAN DEFAULT false;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS polish_preliminary_docs_info TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS important_additional_info TEXT;
ALTER TABLE public.master_table ADD COLUMN IF NOT EXISTS sibling_decision_info TEXT;