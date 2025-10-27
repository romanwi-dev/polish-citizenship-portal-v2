-- Add sort_order column to cases table for manual reordering
ALTER TABLE cases ADD COLUMN sort_order integer DEFAULT NULL;

-- Add index for performance
CREATE INDEX idx_cases_sort_order ON cases(sort_order);

-- Comment for clarity
COMMENT ON COLUMN cases.sort_order IS 'Manual sorting position - lower numbers appear first, NULL uses automatic sorting';

-- Create RPC function for bulk sort order updates
CREATE OR REPLACE FUNCTION update_case_sort_orders(case_orders jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  case_order jsonb;
BEGIN
  FOR case_order IN SELECT * FROM jsonb_array_elements(case_orders)
  LOOP
    UPDATE cases
    SET sort_order = (case_order->>'sort_order')::integer,
        updated_at = now()
    WHERE id = (case_order->>'case_id')::uuid;
  END LOOP;
END;
$$;

-- Drop and recreate get_cases_with_counts to include sort_order
DROP FUNCTION IF EXISTS get_cases_with_counts();

CREATE OR REPLACE FUNCTION get_cases_with_counts()
RETURNS TABLE(
  id uuid,
  client_name text,
  client_code text,
  country text,
  status case_status,
  generation case_generation,
  is_vip boolean,
  start_date date,
  progress integer,
  dropbox_path text,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  processing_mode processing_mode,
  client_score integer,
  sort_order integer,
  document_count bigint,
  task_count bigint,
  completed_task_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    c.id,
    c.client_name,
    c.client_code,
    c.country,
    c.status,
    c.generation,
    c.is_vip,
    c.start_date,
    c.progress,
    c.dropbox_path,
    c.notes,
    c.created_at,
    c.updated_at,
    c.processing_mode,
    c.client_score,
    c.sort_order,
    COALESCE(COUNT(DISTINCT d.id), 0) as document_count,
    COALESCE(COUNT(DISTINCT t.id), 0) as task_count,
    COALESCE(COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed'), 0) as completed_task_count
  FROM public.cases c
  LEFT JOIN public.documents d ON d.case_id = c.id
  LEFT JOIN public.tasks t ON t.case_id = c.id
  WHERE auth.uid() IS NOT NULL
    AND c.status NOT IN ('finished', 'failed')
  GROUP BY c.id
  ORDER BY c.created_at DESC;
$$;