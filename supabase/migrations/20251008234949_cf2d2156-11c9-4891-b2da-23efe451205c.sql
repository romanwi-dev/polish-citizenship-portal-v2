-- Fix search_path security issue
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
$$ LANGUAGE plpgsql
SET search_path = public;