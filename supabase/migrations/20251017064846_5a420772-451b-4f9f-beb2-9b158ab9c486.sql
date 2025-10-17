-- Create function to check RLS status on all critical tables
CREATE OR REPLACE FUNCTION public.check_rls_status()
RETURNS TABLE (
  table_name text,
  rls_enabled boolean,
  policy_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;