-- First, add the Polish flag columns if they don't exist
ALTER TABLE master_table
ADD COLUMN IF NOT EXISTS father_is_polish BOOLEAN DEFAULT NULL;

ALTER TABLE master_table
ADD COLUMN IF NOT EXISTS mother_is_polish BOOLEAN DEFAULT NULL;

-- Add the bloodline side tracking column
ALTER TABLE master_table
ADD COLUMN IF NOT EXISTS polish_bloodline_side TEXT 
CHECK (polish_bloodline_side IN ('paternal', 'maternal', 'both', NULL));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_master_table_bloodline_side 
ON master_table(polish_bloodline_side);

CREATE INDEX IF NOT EXISTS idx_master_table_father_is_polish
ON master_table(father_is_polish);

CREATE INDEX IF NOT EXISTS idx_master_table_mother_is_polish
ON master_table(mother_is_polish);

-- Auto-detect and populate bloodline side for existing records
UPDATE master_table
SET polish_bloodline_side = CASE
  WHEN father_is_polish = true AND mother_is_polish = false THEN 'paternal'
  WHEN mother_is_polish = true AND father_is_polish = false THEN 'maternal'
  WHEN father_is_polish = true AND mother_is_polish = true THEN 'both'
  ELSE NULL
END
WHERE polish_bloodline_side IS NULL;

-- Create trigger function to auto-update bloodline side when flags change
CREATE OR REPLACE FUNCTION auto_update_bloodline_side()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-detect bloodline side based on Polish parent flags
  NEW.polish_bloodline_side := CASE
    WHEN NEW.father_is_polish = true AND NEW.mother_is_polish = false THEN 'paternal'
    WHEN NEW.mother_is_polish = true AND NEW.father_is_polish = false THEN 'maternal'
    WHEN NEW.father_is_polish = true AND NEW.mother_is_polish = true THEN 'both'
    ELSE NULL
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update on INSERT or UPDATE
DROP TRIGGER IF EXISTS trigger_auto_update_bloodline_side ON master_table;

CREATE TRIGGER trigger_auto_update_bloodline_side
BEFORE INSERT OR UPDATE OF father_is_polish, mother_is_polish ON master_table
FOR EACH ROW
EXECUTE FUNCTION auto_update_bloodline_side();

-- Add helpful comments for documentation
COMMENT ON COLUMN master_table.father_is_polish IS 'Flag indicating if father was Polish at birth of applicant';
COMMENT ON COLUMN master_table.mother_is_polish IS 'Flag indicating if mother was Polish at birth of applicant';
COMMENT ON COLUMN master_table.polish_bloodline_side IS 'Auto-tracked Polish bloodline path: paternal, maternal, both, or NULL. Updates automatically when father_is_polish or mother_is_polish changes.';