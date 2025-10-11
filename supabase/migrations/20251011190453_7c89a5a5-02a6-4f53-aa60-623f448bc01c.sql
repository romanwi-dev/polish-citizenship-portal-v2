-- Add SET search_path = 'public' to all database functions for security

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

-- Update get_case_document_count function
CREATE OR REPLACE FUNCTION public.get_case_document_count(case_uuid uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COUNT(*)::integer
  FROM public.documents
  WHERE case_id = case_uuid;
$function$;

-- Update get_cases_with_counts function
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
   document_count bigint,
   task_count bigint,
   completed_task_count bigint
 )
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = 'public'
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

-- Update create_master_table_for_case function
CREATE OR REPLACE FUNCTION public.create_master_table_for_case()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.master_table (case_id, language_preference, completion_percentage)
  VALUES (NEW.id, 'EN', 0);
  
  RETURN NEW;
END;
$function$;

-- Update sync_children_last_names function
CREATE OR REPLACE FUNCTION public.sync_children_last_names()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  last_name_to_use TEXT;
BEGIN
  -- Priority: father_last_name > spouse_last_name (if female) > applicant_last_name
  IF NEW.father_last_name IS NOT NULL AND NEW.father_last_name != '' THEN
    last_name_to_use := NEW.father_last_name;
  ELSIF NEW.applicant_sex = 'Female' AND NEW.spouse_last_name IS NOT NULL AND NEW.spouse_last_name != '' THEN
    last_name_to_use := NEW.spouse_last_name;
  ELSE
    last_name_to_use := NEW.applicant_last_name;
  END IF;

  -- Directly update NEW record's child fields
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

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_cases_client_code ON public.cases(client_code);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_master_table_case_id ON public.master_table(case_id);