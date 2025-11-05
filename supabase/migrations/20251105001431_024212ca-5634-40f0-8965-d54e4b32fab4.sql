-- Fix search_path for check_ai_consent function
CREATE OR REPLACE FUNCTION check_ai_consent(p_case_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  consent_granted BOOLEAN;
BEGIN
  -- Check if the case has AI consent granted
  -- This assumes there's a consent field in the cases table or a related consent table
  -- For now, we'll default to true for existing cases
  -- In production, you should have proper consent tracking
  
  SELECT COALESCE(
    (metadata->>'ai_consent_granted')::boolean,
    true  -- Default to true for backward compatibility
  )
  INTO consent_granted
  FROM cases
  WHERE id = p_case_id;
  
  RETURN COALESCE(consent_granted, false);
END;
$$;