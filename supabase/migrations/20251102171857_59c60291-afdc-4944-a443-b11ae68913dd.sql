-- Add RPC function for high token usage detection
CREATE OR REPLACE FUNCTION get_high_token_usage_cases(
  since_timestamp timestamptz,
  token_threshold integer
)
RETURNS TABLE (
  case_id uuid,
  total_tokens bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aia.case_id,
    SUM(aia.total_tokens)::bigint as total_tokens
  FROM ai_agent_activity aia
  WHERE aia.created_at >= since_timestamp
    AND aia.case_id IS NOT NULL
  GROUP BY aia.case_id
  HAVING SUM(aia.total_tokens) > token_threshold
  ORDER BY total_tokens DESC;
END;
$$;