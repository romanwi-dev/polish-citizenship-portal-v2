-- Create trigger to automatically create master_table record when a case is created
CREATE OR REPLACE FUNCTION public.create_master_table_for_case()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new master_table record for the newly created case
  INSERT INTO public.master_table (case_id, language_preference, completion_percentage)
  VALUES (NEW.id, 'EN', 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger that fires after case insertion
DROP TRIGGER IF EXISTS create_master_table_on_case_insert ON public.cases;
CREATE TRIGGER create_master_table_on_case_insert
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.create_master_table_for_case();

-- Backfill master_table for existing cases that don't have one
INSERT INTO public.master_table (case_id, language_preference, completion_percentage)
SELECT c.id, 'EN', 0
FROM public.cases c
LEFT JOIN public.master_table m ON m.case_id = c.id
WHERE m.id IS NULL;