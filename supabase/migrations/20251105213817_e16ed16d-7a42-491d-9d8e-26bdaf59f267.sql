-- Make generated-pdfs bucket public for easier preview/download
UPDATE storage.buckets 
SET public = true 
WHERE id = 'generated-pdfs';