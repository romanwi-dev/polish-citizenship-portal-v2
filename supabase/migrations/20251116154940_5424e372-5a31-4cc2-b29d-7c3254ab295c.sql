-- Drop existing policies if they exist to recreate them
DROP POLICY IF EXISTS "Anonymous users can insert crash states" ON crash_states;
DROP POLICY IF EXISTS "Anonymous users can read crash states by session" ON crash_states;
DROP POLICY IF EXISTS "Anonymous users can delete their crash states" ON crash_states;

-- Allow anonymous users to insert crash states with NULL user_id
CREATE POLICY "Anonymous users can insert crash states"
ON crash_states
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Allow anonymous users to read crash states by session_id (for recovery)
CREATE POLICY "Anonymous users can read crash states by session"
ON crash_states
FOR SELECT
TO anon
USING (user_id IS NULL);

-- Allow anonymous users to delete their crash states
CREATE POLICY "Anonymous users can delete their crash states"
ON crash_states
FOR DELETE
TO anon
USING (user_id IS NULL);