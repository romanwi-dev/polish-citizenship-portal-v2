-- Fix all existing data: sync father's last name to all children
UPDATE master_table
SET 
  child_1_last_name = father_last_name,
  child_2_last_name = father_last_name,
  child_3_last_name = father_last_name,
  child_4_last_name = father_last_name,
  child_5_last_name = father_last_name,
  child_6_last_name = father_last_name,
  child_7_last_name = father_last_name,
  child_8_last_name = father_last_name,
  child_9_last_name = father_last_name,
  child_10_last_name = father_last_name
WHERE father_last_name IS NOT NULL;

-- Create trigger function to auto-sync children's last names when father's last name changes
CREATE OR REPLACE FUNCTION sync_children_last_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync father's last name to all children
  IF NEW.father_last_name IS NOT NULL AND NEW.father_last_name != OLD.father_last_name THEN
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
$$ LANGUAGE plpgsql;

-- Create trigger that runs BEFORE update
DROP TRIGGER IF EXISTS sync_children_names_trigger ON master_table;
CREATE TRIGGER sync_children_names_trigger
  BEFORE UPDATE ON master_table
  FOR EACH ROW
  EXECUTE FUNCTION sync_children_last_names();