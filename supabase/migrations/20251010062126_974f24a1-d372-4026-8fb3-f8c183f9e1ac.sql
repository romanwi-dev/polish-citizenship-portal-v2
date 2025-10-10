-- Add missing document tracking fields for all family members
-- These fields enable document completion tracking in the interactive family tree

-- Spouse document fields (missing death cert and naturalization)
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS spouse_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS spouse_has_naturalization boolean DEFAULT false;

-- Father document fields
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS father_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS father_has_passport boolean DEFAULT false;

-- Mother document fields
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS mother_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS mother_has_passport boolean DEFAULT false;

-- Paternal Grandfather (PGF) document fields
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS pgf_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS pgf_has_passport boolean DEFAULT false;

-- Paternal Grandmother (PGM) document fields
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS pgm_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS pgm_has_passport boolean DEFAULT false;

-- Maternal Grandfather (MGF) document fields
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS mgf_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS mgf_has_passport boolean DEFAULT false;

-- Maternal Grandmother (MGM) document fields
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS mgm_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS mgm_has_passport boolean DEFAULT false;

-- Paternal Great Grandfather (PGGF) document fields
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS pggf_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS pggf_has_passport boolean DEFAULT false;

-- Paternal Great Grandmother (PGGM) document fields
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS pggm_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS pggm_has_passport boolean DEFAULT false;

-- Maternal Great Grandfather (MGGF) document fields
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS mggf_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS mggf_has_passport boolean DEFAULT false;

-- Maternal Great Grandmother (MGGM) document fields
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS mggm_has_death_cert boolean DEFAULT false;
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS mggm_has_passport boolean DEFAULT false;

-- Applicant missing death cert field
ALTER TABLE master_table ADD COLUMN IF NOT EXISTS applicant_has_death_cert boolean DEFAULT false;