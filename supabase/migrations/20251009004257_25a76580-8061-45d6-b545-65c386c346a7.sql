-- Drop the old trigger and function with CASCADE
DROP TRIGGER IF EXISTS sync_children_names_trigger ON public.master_table CASCADE;
DROP FUNCTION IF EXISTS public.sync_children_last_names() CASCADE;

-- Create new trigger function that syncs children last names based on parent gender
CREATE OR REPLACE FUNCTION public.sync_children_last_names()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  parent_last_name TEXT;
BEGIN
  -- Determine parent's last name based on gender
  -- If applicant is male (or no gender set), use applicant_last_name
  -- If applicant is female and has spouse, use spouse_last_name
  IF NEW.applicant_sex = 'F' AND NEW.spouse_last_name IS NOT NULL THEN
    parent_last_name = NEW.spouse_last_name;
  ELSE
    parent_last_name = NEW.applicant_last_name;
  END IF;
  
  -- Sync to all children if parent last name is set
  IF parent_last_name IS NOT NULL THEN
    NEW.child_1_last_name = parent_last_name;
    NEW.child_2_last_name = parent_last_name;
    NEW.child_3_last_name = parent_last_name;
    NEW.child_4_last_name = parent_last_name;
    NEW.child_5_last_name = parent_last_name;
    NEW.child_6_last_name = parent_last_name;
    NEW.child_7_last_name = parent_last_name;
    NEW.child_8_last_name = parent_last_name;
    NEW.child_9_last_name = parent_last_name;
    NEW.child_10_last_name = parent_last_name;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires on insert or update
CREATE TRIGGER sync_children_last_names_trigger
  BEFORE INSERT OR UPDATE OF applicant_last_name, spouse_last_name, applicant_sex
  ON public.master_table
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_children_last_names();