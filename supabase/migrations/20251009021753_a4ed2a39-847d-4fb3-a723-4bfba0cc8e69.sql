-- Drop existing broken trigger and function
DROP TRIGGER IF EXISTS sync_children_last_names_trigger ON master_table;
DROP FUNCTION IF EXISTS sync_children_last_names();

-- Create corrected function that modifies NEW record directly
CREATE OR REPLACE FUNCTION sync_children_last_names()
RETURNS TRIGGER AS $$
DECLARE
  last_name_to_use TEXT;
BEGIN
  -- Priority: father_last_name > spouse_last_name (if female) > applicant_last_name
  IF NEW.father_last_name IS NOT NULL AND NEW.father_last_name != '' THEN
    last_name_to_use := NEW.father_last_name;
  ELSIF NEW.applicant_sex = 'Female' AND NEW.spouse_last_name IS NOT NULL AND NEW.spouse_last_name != '' THEN
    last_name_to_use := NEW.spouse_last_name;
  ELSE
    last_name_to_use := NEW.applicant_last_name;
  END IF;

  -- Directly update NEW record's child fields
  NEW.child_1_last_name := last_name_to_use;
  NEW.child_2_last_name := last_name_to_use;
  NEW.child_3_last_name := last_name_to_use;
  NEW.child_4_last_name := last_name_to_use;
  NEW.child_5_last_name := last_name_to_use;
  NEW.child_6_last_name := last_name_to_use;
  NEW.child_7_last_name := last_name_to_use;
  NEW.child_8_last_name := last_name_to_use;
  NEW.child_9_last_name := last_name_to_use;
  NEW.child_10_last_name := last_name_to_use;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create BEFORE trigger so we can modify NEW
CREATE TRIGGER sync_children_last_names_trigger
BEFORE INSERT OR UPDATE OF father_last_name, spouse_last_name, applicant_last_name, applicant_sex
ON master_table
FOR EACH ROW
EXECUTE FUNCTION sync_children_last_names();