-- Fix advisory lock implementation with CASCADE
DROP TRIGGER IF EXISTS increment_document_version_atomic_trigger ON documents;
DROP FUNCTION IF EXISTS increment_document_version_atomic() CASCADE;

-- Create corrected function using digest() for proper UUID hashing
CREATE OR REPLACE FUNCTION increment_document_version_atomic()
RETURNS TRIGGER AS $$
DECLARE
  v_lock_key1 BIGINT;
  v_lock_key2 BIGINT;
BEGIN
  -- Use MD5 digest of UUID to create two 64-bit lock keys (collision-resistant)
  v_lock_key1 := ('x' || substring(md5(NEW.id::text) from 1 for 15))::bit(60)::bigint;
  v_lock_key2 := ('x' || substring(md5(NEW.id::text) from 16 for 15))::bit(60)::bigint;
  
  -- Acquire transaction-scoped advisory lock
  PERFORM pg_advisory_xact_lock(v_lock_key1, v_lock_key2);
  
  -- Increment version atomically
  IF OLD.version IS NOT NULL THEN
    NEW.version = OLD.version + 1;
  ELSE
    NEW.version = 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '';

CREATE TRIGGER increment_document_version_atomic_trigger
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION increment_document_version_atomic();

COMMENT ON FUNCTION increment_document_version_atomic IS 
  'Uses MD5 hash of UUID split into two 60-bit keys for pg_advisory_xact_lock. Provides collision-resistant atomic version increments with transaction-scoped locks.';