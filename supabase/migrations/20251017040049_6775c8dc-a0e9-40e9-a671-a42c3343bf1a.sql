-- ============================================
-- PHASE 1: CRITICAL SECURITY FIXES - RLS HARDENING
-- ============================================
-- This migration fixes critical RLS vulnerabilities where any authenticated user
-- could view sensitive PII across all cases. New policies enforce:
-- 1. Clients can only view their own case data (via client_portal_access)
-- 2. Staff (admin/assistant) can view data for their role
-- 3. All operations are properly role-gated

-- ============================================
-- DOCUMENTS TABLE - Critical PII (passports, certificates)
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;

-- Client access: only documents for cases they have portal access to
CREATE POLICY "Clients can view their own case documents" ON documents
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = documents.case_id
    AND client_portal_access.user_id = auth.uid()
  )
);

-- Staff access: admins and assistants can view all documents
CREATE POLICY "Staff can view all documents" ON documents
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- MASTER_TABLE - Critical PII (comprehensive applicant data)
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view master table" ON master_table;

-- Client access: only master data for cases they have portal access to
CREATE POLICY "Clients can view their own master data" ON master_table
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = master_table.case_id
    AND client_portal_access.user_id = auth.uid()
  )
);

-- Staff access: admins and assistants can view all master data
CREATE POLICY "Staff can view all master data" ON master_table
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- INTAKE_DATA - Critical PII (initial applicant information)
-- ============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view intake data" ON intake_data;

-- Client access: only intake data for cases they have portal access to
CREATE POLICY "Clients can view their own intake data" ON intake_data
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = intake_data.case_id
    AND client_portal_access.user_id = auth.uid()
  )
);

-- Staff access: admins and assistants can view all intake data
CREATE POLICY "Staff can view all intake data" ON intake_data
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- POA - Critical Documents (power of attorney)
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view POAs" ON poa;

-- Client access: only POAs for cases they have portal access to
CREATE POLICY "Clients can view their own POAs" ON poa
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = poa.case_id
    AND client_portal_access.user_id = auth.uid()
  )
);

-- Staff access: admins and assistants can view all POAs
CREATE POLICY "Staff can view all POAs" ON poa
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- CASES - Strengthen existing policies
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view cases" ON cases;

-- Client access: only cases they have portal access to
CREATE POLICY "Clients can view their own cases" ON cases
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = cases.id
    AND client_portal_access.user_id = auth.uid()
  )
);

-- Staff access: admins and assistants can view all cases
CREATE POLICY "Staff can view all cases" ON cases
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- OBY_FORMS - Citizenship application forms
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view OBY forms" ON oby_forms;

-- Client access: only OBY forms for cases they have portal access to
CREATE POLICY "Clients can view their own OBY forms" ON oby_forms
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = oby_forms.case_id
    AND client_portal_access.user_id = auth.uid()
  )
);

-- Staff access: admins and assistants can view all OBY forms
CREATE POLICY "Staff can view all OBY forms" ON oby_forms
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- TASKS - Strengthen task visibility
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON tasks;

-- Client access: only tasks for cases they have portal access to
CREATE POLICY "Clients can view their own case tasks" ON tasks
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = tasks.case_id
    AND client_portal_access.user_id = auth.uid()
  )
);

-- Staff access: admins and assistants can view all tasks
CREATE POLICY "Staff can view all tasks" ON tasks
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- HAC_LOGS - Admin-only audit logs
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view HAC logs" ON hac_logs;

-- Only staff can view HAC logs (internal audit trail)
CREATE POLICY "Only staff can view HAC logs" ON hac_logs
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- ARCHIVE_SEARCHES - Strengthen policies
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view archive searches" ON archive_searches;

-- Client access: only archive searches for cases they have portal access to
CREATE POLICY "Clients can view their own archive searches" ON archive_searches
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = archive_searches.case_id
    AND client_portal_access.user_id = auth.uid()
  )
);

-- Staff access: admins and assistants can view all archive searches
CREATE POLICY "Staff can view all archive searches" ON archive_searches
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- ARCHIVE_DOCUMENT_REQUESTS - Strengthen policies
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view archive document requests" ON archive_document_requests;

-- Only staff can view archive document requests
CREATE POLICY "Only staff can view archive document requests" ON archive_document_requests
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- LOCAL_DOCUMENT_REQUESTS - Strengthen policies
-- ============================================

-- Drop overly permissive policy if exists
DROP POLICY IF EXISTS "Authenticated users can view local document requests" ON local_document_requests;

-- Client access: only local document requests for cases they have portal access to
CREATE POLICY "Clients can view their own local document requests" ON local_document_requests
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = local_document_requests.case_id
    AND client_portal_access.user_id = auth.uid()
  )
);

-- Staff access: admins and assistants can view all local document requests
CREATE POLICY "Staff can view all local document requests" ON local_document_requests
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

-- ============================================
-- MIGRATION_LOGS - Admin-only
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view migration logs" ON migration_logs;

-- Only admins can view migration logs
CREATE POLICY "Only admins can view migration logs" ON migration_logs
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- SYNC_LOGS - Admin-only
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view sync logs" ON sync_logs;

-- Only admins can view sync logs
CREATE POLICY "Only admins can view sync logs" ON sync_logs
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- LOCAL_AUTHORITIES - Read-only reference data
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view local authorities" ON local_authorities;

-- All authenticated users can view local authorities (reference data)
CREATE POLICY "Authenticated users can view local authorities" ON local_authorities
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);