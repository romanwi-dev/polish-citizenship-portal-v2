-- Add missing Civil Registry and USC form fields to master_table

-- Representative/Attorney (Pełnomocnik) fields
ALTER TABLE public.master_table 
  ADD COLUMN IF NOT EXISTS representative_full_name TEXT,
  ADD COLUMN IF NOT EXISTS representative_address TEXT,
  ADD COLUMN IF NOT EXISTS representative_address_cont TEXT,
  ADD COLUMN IF NOT EXISTS representative_phone TEXT,
  ADD COLUMN IF NOT EXISTS representative_email TEXT,
  ADD COLUMN IF NOT EXISTS submission_location TEXT,
  ADD COLUMN IF NOT EXISTS submission_date DATE,
  ADD COLUMN IF NOT EXISTS birth_act_number TEXT,
  ADD COLUMN IF NOT EXISTS birth_act_year TEXT,
  ADD COLUMN IF NOT EXISTS birth_act_location TEXT,
  ADD COLUMN IF NOT EXISTS polish_birth_act_number TEXT,
  ADD COLUMN IF NOT EXISTS foreign_act_location TEXT,
  ADD COLUMN IF NOT EXISTS marriage_act_location TEXT,
  ADD COLUMN IF NOT EXISTS act_type_birth BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS act_type_marriage BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.master_table.representative_full_name IS 'Full name of legal representative/attorney (pełnomocnik)';
COMMENT ON COLUMN public.master_table.representative_address IS 'Address of legal representative';
COMMENT ON COLUMN public.master_table.submission_location IS 'City/location where civil registry request is being submitted';
COMMENT ON COLUMN public.master_table.submission_date IS 'Date of submission for civil registry requests';
COMMENT ON COLUMN public.master_table.birth_act_number IS 'Birth certificate act number';
COMMENT ON COLUMN public.master_table.act_type_birth IS 'Checkbox: This is a birth act request';
COMMENT ON COLUMN public.master_table.act_type_marriage IS 'Checkbox: This is a marriage act request';