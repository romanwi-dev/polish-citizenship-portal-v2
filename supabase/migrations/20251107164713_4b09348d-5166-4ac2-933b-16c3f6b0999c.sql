-- Fix remaining security issues

-- Fix search_path for all functions
ALTER FUNCTION update_updated_at_column()
SET search_path = public, pg_temp;

ALTER FUNCTION handle_updated_at()
SET search_path = public, pg_temp;

ALTER FUNCTION cleanup_old_rate_limits()
SET search_path = public, pg_temp;

-- Move pg_stat_statements extension to extensions schema if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
    ALTER EXTENSION pg_stat_statements SET SCHEMA extensions;
  END IF;
END $$;

-- Move uuid-ossp extension to extensions schema if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
END $$;