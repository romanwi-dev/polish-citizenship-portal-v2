-- Add missing spouse_passport_number column to master_table
ALTER TABLE public.master_table 
ADD COLUMN IF NOT EXISTS spouse_passport_number TEXT;