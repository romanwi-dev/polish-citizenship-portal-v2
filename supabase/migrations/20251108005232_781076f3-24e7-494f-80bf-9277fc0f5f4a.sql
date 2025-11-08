-- Add missing marriage date and place fields for all family member combinations
-- These fields are required by the Family Tree PDF template

ALTER TABLE master_table 
ADD COLUMN IF NOT EXISTS father_mother_marriage_date DATE,
ADD COLUMN IF NOT EXISTS father_mother_marriage_place TEXT,
ADD COLUMN IF NOT EXISTS pgf_pgm_marriage_date DATE,
ADD COLUMN IF NOT EXISTS pgf_pgm_marriage_place TEXT,
ADD COLUMN IF NOT EXISTS pggf_pggm_marriage_date DATE,
ADD COLUMN IF NOT EXISTS pggf_pggm_marriage_place TEXT,
ADD COLUMN IF NOT EXISTS mgf_mgm_marriage_date DATE,
ADD COLUMN IF NOT EXISTS mgf_mgm_marriage_place TEXT,
ADD COLUMN IF NOT EXISTS mggf_mggm_marriage_date DATE,
ADD COLUMN IF NOT EXISTS mggf_mggm_marriage_place TEXT;

COMMENT ON COLUMN master_table.father_mother_marriage_date IS 'Marriage date of father and mother';
COMMENT ON COLUMN master_table.father_mother_marriage_place IS 'Marriage place of father and mother';
COMMENT ON COLUMN master_table.pgf_pgm_marriage_date IS 'Marriage date of paternal grandparents';
COMMENT ON COLUMN master_table.pgf_pgm_marriage_place IS 'Marriage place of paternal grandparents';
COMMENT ON COLUMN master_table.pggf_pggm_marriage_date IS 'Marriage date of paternal great-grandparents';
COMMENT ON COLUMN master_table.pggf_pggm_marriage_place IS 'Marriage place of paternal great-grandparents';
COMMENT ON COLUMN master_table.mgf_mgm_marriage_date IS 'Marriage date of maternal grandparents';
COMMENT ON COLUMN master_table.mgf_mgm_marriage_place IS 'Marriage place of maternal grandparents';
COMMENT ON COLUMN master_table.mggf_mggm_marriage_date IS 'Marriage date of maternal great-grandparents';
COMMENT ON COLUMN master_table.mggf_mggm_marriage_place IS 'Marriage place of maternal great-grandparents';