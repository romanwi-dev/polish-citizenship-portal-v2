-- Remove ALL death certificate columns from master_table
ALTER TABLE master_table 
  DROP COLUMN IF EXISTS applicant_has_death_cert,
  DROP COLUMN IF EXISTS spouse_has_death_cert,
  DROP COLUMN IF EXISTS father_has_death_cert,
  DROP COLUMN IF EXISTS mother_has_death_cert,
  DROP COLUMN IF EXISTS pgf_has_death_cert,
  DROP COLUMN IF EXISTS pgm_has_death_cert,
  DROP COLUMN IF EXISTS mgf_has_death_cert,
  DROP COLUMN IF EXISTS mgm_has_death_cert,
  DROP COLUMN IF EXISTS pggf_has_death_cert,
  DROP COLUMN IF EXISTS pggm_has_death_cert,
  DROP COLUMN IF EXISTS mggf_has_death_cert,
  DROP COLUMN IF EXISTS mggm_has_death_cert;