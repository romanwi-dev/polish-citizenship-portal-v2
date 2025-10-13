-- Add separate fields for wife and husband last names after marriage
ALTER TABLE public.master_table 
ADD COLUMN IF NOT EXISTS wife_last_name_after_marriage TEXT,
ADD COLUMN IF NOT EXISTS husband_last_name_after_marriage TEXT;