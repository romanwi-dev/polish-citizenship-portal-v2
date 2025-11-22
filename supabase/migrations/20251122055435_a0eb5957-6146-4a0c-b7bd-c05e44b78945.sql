-- ========================================
-- SECURITY FIX: Implement Case-Level Authorization for Storage Buckets
-- ========================================
-- 
-- ISSUE: Current storage policies allow ANY authenticated user to access
-- ALL documents across ALL cases. This creates data leakage risk.
--
-- FIX: Implement case-specific authorization so:
-- 1. Admins and assistants can access all documents
-- 2. Clients can ONLY access documents from their assigned cases
-- 3. Documents are stored with case-specific paths
--
-- ========================================

-- ========================================
-- BUCKET: documents
-- ========================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- CREATE SECURE POLICIES WITH CASE-LEVEL AUTHORIZATION
-- ========================================

-- SELECT: Users can only view documents from their cases
CREATE POLICY "Case-based document viewing"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (
    -- Admins and assistants can see all documents
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'assistant'::app_role)
    OR
    -- Clients can only see documents from cases they have access to
    EXISTS (
      SELECT 1 
      FROM public.client_portal_access cpa
      JOIN public.cases c ON c.id = cpa.case_id
      WHERE cpa.user_id = auth.uid() 
      AND (storage.foldername(name))[1]::uuid = cpa.case_id
    )
  )
);

-- INSERT: Users can only upload documents to their authorized cases
CREATE POLICY "Case-based document uploading"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (
    -- Admins and assistants can upload to any case
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'assistant'::app_role)
    OR
    -- Clients can only upload to their own cases
    EXISTS (
      SELECT 1 
      FROM public.client_portal_access cpa
      WHERE cpa.user_id = auth.uid() 
      AND (storage.foldername(name))[1]::uuid = cpa.case_id
    )
  )
);

-- UPDATE: Users can only update documents from their authorized cases
CREATE POLICY "Case-based document updating"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (
    -- Admins and assistants can update any document
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'assistant'::app_role)
    OR
    -- Clients can only update documents from their cases
    EXISTS (
      SELECT 1 
      FROM public.client_portal_access cpa
      WHERE cpa.user_id = auth.uid() 
      AND (storage.foldername(name))[1]::uuid = cpa.case_id
    )
  )
);

-- DELETE: Only admins and assistants can delete documents
CREATE POLICY "Staff-only document deletion"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'assistant'::app_role)
  )
);

-- ========================================
-- BUCKET: generated-pdfs
-- ========================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated uploads to generated-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to generated-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from generated-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from generated-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access generated PDFs" ON storage.objects;

-- SELECT: Case-based access to generated PDFs
CREATE POLICY "Case-based PDF viewing"
ON storage.objects
FOR SELECT
TO authenticated, service_role
USING (
  bucket_id = 'generated-pdfs' 
  AND (
    auth.role() = 'service_role'
    OR public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'assistant'::app_role)
    OR
    -- Clients can only see PDFs from their cases
    EXISTS (
      SELECT 1 
      FROM public.client_portal_access cpa
      WHERE cpa.user_id = auth.uid() 
      AND (storage.foldername(name))[1]::uuid = cpa.case_id
    )
  )
);

-- INSERT: Service role and staff can upload PDFs
CREATE POLICY "Staff and service role can upload PDFs"
ON storage.objects
FOR INSERT
TO authenticated, service_role
WITH CHECK (
  bucket_id = 'generated-pdfs' 
  AND (
    auth.role() = 'service_role'
    OR public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'assistant'::app_role)
  )
);

-- UPDATE: Service role and staff can update PDFs
CREATE POLICY "Staff and service role can update PDFs"
ON storage.objects
FOR UPDATE
TO authenticated, service_role
USING (
  bucket_id = 'generated-pdfs' 
  AND (
    auth.role() = 'service_role'
    OR public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'assistant'::app_role)
  )
);

-- DELETE: Only admins can delete PDFs
CREATE POLICY "Admin-only PDF deletion"
ON storage.objects
FOR DELETE
TO authenticated, service_role
USING (
  bucket_id = 'generated-pdfs' 
  AND (
    auth.role() = 'service_role'
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- ========================================
-- NOTE: pdf-templates bucket remains permissive
-- These are public templates, not sensitive client data
-- ========================================

-- Log security fix completion
DO $$
BEGIN
  RAISE NOTICE 'Security Fix Applied: Case-level authorization implemented for storage buckets';
  RAISE NOTICE 'Affected buckets: documents, generated-pdfs';
  RAISE NOTICE 'Protection: Users can only access files from their authorized cases';
END $$;