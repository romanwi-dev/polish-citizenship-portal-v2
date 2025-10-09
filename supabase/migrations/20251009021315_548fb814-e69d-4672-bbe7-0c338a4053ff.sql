-- Drop existing trigger first
DROP TRIGGER IF EXISTS sync_children_last_names_trigger ON master_table;

-- Recreate the function with correct logic: prioritize father_last_name
CREATE OR REPLACE FUNCTION sync_children_last_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine the last name to use based on priority:
  -- 1. father_last_name (highest priority)
  -- 2. spouse_last_name (if applicant is female)
  -- 3. applicant_last_name (fallback)
  
  DECLARE
    last_name_to_use TEXT;
  BEGIN
    IF NEW.father_last_name IS NOT NULL AND NEW.father_last_name != '' THEN
      last_name_to_use := NEW.father_last_name;
    ELSIF NEW.applicant_sex = 'Female' AND NEW.spouse_last_name IS NOT NULL AND NEW.spouse_last_name != '' THEN
      last_name_to_use := NEW.spouse_last_name;
    ELSE
      last_name_to_use := NEW.applicant_last_name;
    END IF;

    -- Update all children's last names
    FOR i IN 1..10 LOOP
      EXECUTE format('UPDATE master_table SET child_%s_last_name = $1 WHERE case_id = $2', i)
      USING last_name_to_use, NEW.case_id;
    END LOOP;

    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to fire on relevant field changes
CREATE TRIGGER sync_children_last_names_trigger
AFTER INSERT OR UPDATE OF father_last_name, spouse_last_name, applicant_last_name, applicant_sex
ON master_table
FOR EACH ROW
EXECUTE FUNCTION sync_children_last_names();