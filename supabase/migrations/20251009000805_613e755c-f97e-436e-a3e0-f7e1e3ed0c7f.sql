-- Drop existing trigger if any
DROP TRIGGER IF EXISTS sync_children_last_names_trigger ON master_table;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.sync_children_last_names()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Sync father's last name to all children when father_last_name is set or changed
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
$$;

-- Create the trigger
CREATE TRIGGER sync_children_last_names_trigger
  BEFORE INSERT OR UPDATE ON master_table
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_children_last_names();