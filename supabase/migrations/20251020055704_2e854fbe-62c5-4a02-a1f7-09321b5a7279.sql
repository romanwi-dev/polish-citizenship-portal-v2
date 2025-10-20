-- Fix master_table RLS policies to be more granular and secure
-- This addresses the security issue of overly permissive access

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Admins and assistants can manage master table" ON master_table;

-- Create separate granular policies for different roles and operations

-- Policy 1: Admins have full access to all master data
CREATE POLICY "Admins have full access to master table"
  ON master_table FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy 2: Assistants can view all master data
CREATE POLICY "Assistants can view all master data"
  ON master_table FOR SELECT
  USING (has_role(auth.uid(), 'assistant'::app_role));

-- Policy 3: Assistants can update master data (kept for now, but more restrictive than before)
-- Note: For future enhancement, consider adding assigned_to column to cases table
-- to restrict assistants to only cases assigned to them
CREATE POLICY "Assistants can update master data"
  ON master_table FOR UPDATE
  USING (has_role(auth.uid(), 'assistant'::app_role))
  WITH CHECK (has_role(auth.uid(), 'assistant'::app_role));

-- Policy 4: Clients can view their own master data (already exists, keeping it)
-- This policy already exists as "Clients can view their own master data"

-- Add comment to document the security improvement
COMMENT ON TABLE master_table IS 'Contains sensitive PII with granular RLS policies. Admins have full access, assistants can view/update all data, clients can only view their own data via client_portal_access.';

-- Create audit log table for tracking master_table changes (for future use)
CREATE TABLE IF NOT EXISTS master_table_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT
);

-- Enable RLS on audit log
ALTER TABLE master_table_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON master_table_audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs (via triggers or edge functions with service role)
CREATE POLICY "System can insert audit logs"
  ON master_table_audit_log FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE master_table_audit_log IS 'Audit trail for master_table changes. Only admins can view, system can insert.';