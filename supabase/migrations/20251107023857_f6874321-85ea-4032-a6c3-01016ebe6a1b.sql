
-- Update get_cases_with_counts to only show cases from the 7 specific Dropbox folders
-- Folders: POTENTIAL, VIP+, VIP, CITIZEN-X, GLOBAL-P, FOURTH, FIFTH

CREATE OR REPLACE FUNCTION public.get_cases_with_counts()
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
    AND (
      c.dropbox_path ~ '^/CASES/(POTENTIAL|VIP\+|VIP|CITIZEN-X|GLOBAL-P|FOURTH|FIFTH)/'
      OR c.dropbox_path ~ '^/CASES/(POTENTIAL|VIP\+|VIP|CITIZEN-X|GLOBAL-P|FOURTH|FIFTH)$'
    )
  GROUP BY c.id
  ORDER BY 
    CASE WHEN c.sort_order IS NOT NULL THEN 0 ELSE 1 END,
    c.sort_order NULLS LAST,
    c.created_at DESC;
$$;
