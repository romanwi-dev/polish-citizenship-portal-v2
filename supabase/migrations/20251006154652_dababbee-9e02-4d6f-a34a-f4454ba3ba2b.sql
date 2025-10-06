-- Temporarily allow public read access to cases for development
-- WARNING: In production, this should be restricted with proper authentication

DROP POLICY IF EXISTS "Authenticated users can view all cases" ON cases;

CREATE POLICY "Public read access to cases"
ON cases FOR SELECT
USING (true);

-- Keep write operations restricted
DROP POLICY IF EXISTS "Authenticated users can create cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can update cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can delete cases" ON cases;

CREATE POLICY "Only authenticated users can create cases"
ON cases FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update cases"
ON cases FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete cases"
ON cases FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Also allow public read access to documents so the case cards can show document counts
DROP POLICY IF EXISTS "Authenticated users can view all documents" ON documents;

CREATE POLICY "Public read access to documents"
ON documents FOR SELECT
USING (true);