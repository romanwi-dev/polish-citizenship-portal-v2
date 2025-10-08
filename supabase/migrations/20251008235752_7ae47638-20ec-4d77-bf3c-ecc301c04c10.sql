-- Improve trigger to work on INSERT and UPDATE, and handle NULL -> value changes
DROP TRIGGER IF EXISTS sync_children_names_trigger ON master_table;

CREATE OR REPLACE FUNCTION sync_children_last_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync father's last name to all children when:
  -- 1. INSERT: father_last_name is not null
  -- 2. UPDATE: father_last_name changed (including from NULL to a value)
  IF NEW.father_last_name IS NOT NULL AND (
    TG_OP = 'INSERT' OR 
    (TG_OP = 'UPDATE' AND (OLD.father_last_name IS NULL OR NEW.father_last_name != OLD.father_last_name))
  ) THEN
    NEW.child_1_last_name = NEW.father_last_name;
    NEW.child_2_last_name = NEW.father_last_name;
    NEW.child_3_last_name = NEW.father_last_name;
    NEW.child_4_last_name = NEW.father_last_name;
    NEW.child_5_last_name = NEW.father_last_name;
    NEW.child_6_last_name = NEW.father_last_name;
    NEW.child_7_last_name = NEW.father_last_name;
    NEW.child_8_last_name = NEW.father_last_name;
    NEW.child_9_last_name = NEW.father_last_name;
    NEW.child_10_last_name = NEW.father_last_name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Create trigger that runs BEFORE INSERT OR UPDATE
CREATE TRIGGER sync_children_names_trigger
  BEFORE INSERT OR UPDATE ON master_table
  FOR EACH ROW
  EXECUTE FUNCTION sync_children_last_names();