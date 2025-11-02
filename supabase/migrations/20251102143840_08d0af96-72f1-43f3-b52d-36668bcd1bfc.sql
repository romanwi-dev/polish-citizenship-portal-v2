-- PHASE 1: Add OCR retry column
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS ocr_retry_count INTEGER DEFAULT 0;

-- PHASE 2: Enable pg_cron and pg_net extensions for OCR worker scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- PHASE 3: Schedule OCR worker to run every 5 minutes
SELECT cron.schedule(
  'ocr-worker-every-5-min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://oogmuakyqadpynnrasnd.supabase.co/functions/v1/ocr-worker',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZ211YWt5cWFkcHlubnJhc25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTE1NzIsImV4cCI6MjA3NTE2NzU3Mn0.r7ftd-s-PI5TJFTjhIrkeq32aqnq-BALz0eoJe5oRD0"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- PHASE 4: Fix function search paths for all database functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.rate_limit_logs
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_case_document_count(case_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::integer
  FROM public.documents
  WHERE case_id = case_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.log_pdf_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.pdf_status IS DISTINCT FROM NEW.pdf_status) THEN
    INSERT INTO public.pdf_history (document_id, action, old_status, new_status, changed_by)
    VALUES (NEW.id, 'status_change', OLD.pdf_status, NEW.pdf_status, auth.uid());
    
    NEW.status_updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_case_sort_orders(case_orders jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_severity text,
  p_action text,
  p_user_id uuid DEFAULT NULL::uuid,
  p_ip_address text DEFAULT NULL::text,
  p_user_agent text DEFAULT NULL::text,
  p_resource_type text DEFAULT NULL::text,
  p_resource_id uuid DEFAULT NULL::uuid,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_success boolean DEFAULT true,
  p_error_code text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_logs (
    event_type,
    severity,
    user_id,
    ip_address,
    user_agent,
    resource_type,
    resource_id,
    action,
    details,
    success,
    error_code
  ) VALUES (
    p_event_type,
    p_severity,
    p_action,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_resource_type,
    p_resource_id,
    p_details,
    p_success,
    p_error_code
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_security_metric(
  p_metric_type text,
  p_metric_value integer,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.security_metrics (
    metric_type,
    metric_value,
    metadata
  ) VALUES (
    p_metric_type,
    p_metric_value,
    p_metadata
  )
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$function$;

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
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.create_master_table_for_case()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.master_table (case_id, language_preference, completion_percentage)
  VALUES (NEW.id, 'EN', 0);
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rls_status()
RETURNS TABLE(table_name text, rls_enabled boolean, policy_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text,
    t.rowsecurity,
    COUNT(p.policyname)::integer
  FROM pg_tables t
  LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
  WHERE t.schemaname = 'public'
    AND t.tablename IN (
      'cases', 'documents', 'intake_data', 'master_table', 'poa', 
      'oby_forms', 'messages', 'archive_searches', 'local_document_requests',
      'user_roles', 'client_portal_access', 'security_audit_logs',
      'security_metrics', 'tasks', 'hac_logs', 'contact_submissions',
      'translation_jobs', 'sworn_translators', 'translation_agencies',
      'migration_logs', 'archive_document_requests', 'local_authorities'
    )
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_children_last_names()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  last_name_to_use TEXT;
BEGIN
  IF NEW.father_last_name IS NOT NULL AND NEW.father_last_name != '' THEN
    last_name_to_use := NEW.father_last_name;
  ELSIF NEW.applicant_sex = 'Female' AND NEW.spouse_last_name IS NOT NULL AND NEW.spouse_last_name != '' THEN
    last_name_to_use := NEW.spouse_last_name;
  ELSE
    last_name_to_use := NEW.applicant_last_name;
  END IF;

  NEW.child_1_last_name := last_name_to_use;
  NEW.child_2_last_name := last_name_to_use;
  NEW.child_3_last_name := last_name_to_use;
  NEW.child_4_last_name := last_name_to_use;
  NEW.child_5_last_name := last_name_to_use;
  NEW.child_6_last_name := last_name_to_use;
  NEW.child_7_last_name := last_name_to_use;
  NEW.child_8_last_name := last_name_to_use;
  NEW.child_9_last_name := last_name_to_use;
  NEW.child_10_last_name := last_name_to_use;

  RETURN NEW;
END;
$function$;