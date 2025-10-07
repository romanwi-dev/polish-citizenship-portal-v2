-- Add poa_date_filed to master_table
ALTER TABLE master_table 
ADD COLUMN IF NOT EXISTS poa_date_filed date;