-- Add processing mode to cases table
DO $$ BEGIN
  CREATE TYPE processing_mode AS ENUM ('standard', 'expedited', 'vip', 'vip_plus');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS processing_mode processing_mode DEFAULT 'standard';

-- Add client score column if not exists
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS client_score integer DEFAULT 0 CHECK (client_score >= 0 AND client_score <= 100);

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_cases_processing_mode ON public.cases(processing_mode);
CREATE INDEX IF NOT EXISTS idx_cases_client_score ON public.cases(client_score);

-- Drop and recreate the function with new fields
DROP FUNCTION IF EXISTS public.get_cases_with_counts();

CREATE FUNCTION public.get_cases_with_counts()
RETURNS TABLE (
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
  created_at timestamptz,
  updated_at timestamptz,
  processing_mode processing_mode,
  client_score integer,
  document_count bigint,
  task_count bigint,
  completed_task_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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