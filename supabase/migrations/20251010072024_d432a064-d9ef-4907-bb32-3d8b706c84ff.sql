-- Add marriage certificate tracking fields for parents
ALTER TABLE public.master_table
ADD COLUMN IF NOT EXISTS father_has_marriage_cert boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS mother_has_marriage_cert boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parents_has_marriage_cert boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parents_has_marriage_foreign_docs boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parents_has_marriage_additional_docs boolean DEFAULT false;