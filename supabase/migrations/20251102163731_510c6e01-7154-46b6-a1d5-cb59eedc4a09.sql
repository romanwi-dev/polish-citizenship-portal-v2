-- Create nextval wrapper function for case code sequences
CREATE OR REPLACE FUNCTION public.get_next_case_sequence(sequence_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_val integer;
BEGIN
  EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_val;
  RETURN next_val;
END;
$$;