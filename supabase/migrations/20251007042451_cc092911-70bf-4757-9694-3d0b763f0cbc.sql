-- Add marital status field to master_table
ALTER TABLE public.master_table 
ADD COLUMN IF NOT EXISTS applicant_is_married boolean DEFAULT false;