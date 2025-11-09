-- Add missing _is_polish boolean columns for grandparents and great-grandparents
ALTER TABLE master_table 
  ADD COLUMN IF NOT EXISTS pgf_is_polish boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pgm_is_polish boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS mgf_is_polish boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS mgm_is_polish boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pggf_is_polish boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pggm_is_polish boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS mggf_is_polish boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS mggm_is_polish boolean DEFAULT false;

COMMENT ON COLUMN master_table.pgf_is_polish IS 'Paternal Grandfather is Polish';
COMMENT ON COLUMN master_table.pgm_is_polish IS 'Paternal Grandmother is Polish';
COMMENT ON COLUMN master_table.mgf_is_polish IS 'Maternal Grandfather is Polish';
COMMENT ON COLUMN master_table.mgm_is_polish IS 'Maternal Grandmother is Polish';
COMMENT ON COLUMN master_table.pggf_is_polish IS 'Paternal Great-Grandfather is Polish';
COMMENT ON COLUMN master_table.pggm_is_polish IS 'Paternal Great-Grandmother is Polish';
COMMENT ON COLUMN master_table.mggf_is_polish IS 'Maternal Great-Grandfather is Polish';
COMMENT ON COLUMN master_table.mggm_is_polish IS 'Maternal Great-Grandmother is Polish';