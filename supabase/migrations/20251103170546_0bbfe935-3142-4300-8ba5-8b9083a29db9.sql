-- Fix critical schema mismatch: generated_documents.case_id should be UUID not TEXT
-- ZERO-FAIL approach: Handle dependencies properly

-- Step 1: Drop dependent RLS policy temporarily
DROP POLICY IF EXISTS "Users can view their generated documents" ON public.generated_documents;

-- Step 2: Add new UUID column
ALTER TABLE public.generated_documents ADD COLUMN case_id_new UUID;

-- Step 3: Migrate existing data (convert TEXT UUID to actual UUID)
UPDATE public.generated_documents 
SET case_id_new = case_id::UUID
WHERE case_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 4: Drop old column and rename
ALTER TABLE public.generated_documents DROP COLUMN case_id;
ALTER TABLE public.generated_documents RENAME COLUMN case_id_new TO case_id;
ALTER TABLE public.generated_documents ALTER COLUMN case_id SET NOT NULL;

-- Step 5: Recreate index
DROP INDEX IF EXISTS gen_docs_case_tpl_idx;
CREATE INDEX gen_docs_case_tpl_idx 
  ON public.generated_documents (case_id, template_type, created_at DESC);

-- Step 6: Add foreign key for referential integrity
ALTER TABLE public.generated_documents 
ADD CONSTRAINT fk_generated_documents_case 
FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

-- Step 7: Recreate RLS policy with correct types
CREATE POLICY "Users can view their generated documents" 
  ON public.generated_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = generated_documents.case_id
    )
  );