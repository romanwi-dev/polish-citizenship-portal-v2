-- Add missing POA-related columns to master_table
ALTER TABLE master_table 
  ADD COLUMN IF NOT EXISTS applicant_marital_status TEXT,
  ADD COLUMN IF NOT EXISTS applicant_has_minor_children TEXT,
  ADD COLUMN IF NOT EXISTS applicant_number_of_children TEXT;