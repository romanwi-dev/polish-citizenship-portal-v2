-- IMMEDIATE PRIORITY: Fix RLS Policies for Security
-- This migration fixes overly permissive RLS policies that expose sensitive data

-- 1. Fix cases table RLS - Only authenticated users should see cases
DROP POLICY IF EXISTS "Public read access to cases" ON public.cases;

CREATE POLICY "Authenticated users can view cases"
ON public.cases
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 2. Fix documents table RLS - Only authenticated users should see documents  
DROP POLICY IF EXISTS "Public read access to documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can create documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON public.documents;

CREATE POLICY "Authenticated users can view documents"
ON public.documents
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and assistants can create documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

CREATE POLICY "Admins and assistants can update documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

CREATE POLICY "Admins and assistants can delete documents"
ON public.documents
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- 3. Fix contact_submissions - Admins should be able to read
DROP POLICY IF EXISTS "No public read access to submissions" ON public.contact_submissions;

CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Fix sync_logs RLS - Only authenticated users
DROP POLICY IF EXISTS "Authenticated users can view sync logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Authenticated users can create sync logs" ON public.sync_logs;

CREATE POLICY "Authenticated users can view sync logs"
ON public.sync_logs
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can create sync logs"
ON public.sync_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Add index for document count optimization (fix N+1 query problem)
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON public.documents(case_id);

-- 6. Add index for tasks optimization
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON public.tasks(case_id);

-- 7. Add index for intake_data optimization
CREATE INDEX IF NOT EXISTS idx_intake_data_case_id ON public.intake_data(case_id);

-- 8. Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_cases_status_created ON public.cases(status, created_at DESC);

-- 9. Create function to get document count for a case (optimize N+1 queries)
CREATE OR REPLACE FUNCTION public.get_case_document_count(case_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.documents
  WHERE case_id = case_uuid;
$$;

-- 10. Create function to get case with all related counts (single query optimization)
CREATE OR REPLACE FUNCTION public.get_cases_with_counts()
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
    COALESCE(COUNT(DISTINCT d.id), 0) as document_count,
    COALESCE(COUNT(DISTINCT t.id), 0) as task_count,
    COALESCE(COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed'), 0) as completed_task_count
  FROM public.cases c
  LEFT JOIN public.documents d ON d.case_id = c.id
  LEFT JOIN public.tasks t ON t.case_id = c.id
  WHERE auth.uid() IS NOT NULL
  GROUP BY c.id
  ORDER BY c.created_at DESC;
$$;