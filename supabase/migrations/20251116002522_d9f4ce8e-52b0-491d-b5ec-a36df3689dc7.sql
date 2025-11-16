-- COMPLETE IMAGE CLEANUP: Remove all storage buckets and objects
-- Step 1: Delete all objects first (cascade will handle this)
DELETE FROM storage.objects 
WHERE bucket_id IN ('client-photos', 'pdf-templates', 'generated-pdfs', 'documents', 'document-pdfs', 'pdf-outputs');

-- Step 2: Now delete the buckets
DELETE FROM storage.buckets 
WHERE id IN ('client-photos', 'pdf-templates', 'generated-pdfs', 'documents', 'document-pdfs', 'pdf-outputs');

-- Step 3: Clear any image URLs from cases table  
UPDATE cases 
SET client_photo_url = NULL 
WHERE client_photo_url IS NOT NULL;

-- Add comment for future reference
COMMENT ON COLUMN cases.client_photo_url IS 'Deprecated - system no longer stores images';