-- Add 'lead' status to case_status enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'case_status' AND e.enumlabel = 'lead'
  ) THEN
    ALTER TYPE case_status ADD VALUE 'lead';
  END IF;
END $$;

-- Create backup_logs table if not exists
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_date TIMESTAMP WITH TIME ZONE NOT NULL,
  backup_path TEXT NOT NULL,
  total_cases INTEGER NOT NULL DEFAULT 0,
  total_files INTEGER NOT NULL DEFAULT 0,
  total_size_mb NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on backup_logs
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view backup logs
CREATE POLICY "Admins can view backup logs"
ON public.backup_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create index on backup_date for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_backup_logs_date ON public.backup_logs(backup_date);

-- Add source column to intake_data if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'intake_data' 
    AND column_name = 'source'
  ) THEN
    ALTER TABLE public.intake_data
    ADD COLUMN source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'typeform', 'partner_api', 'wizard'));
  END IF;
END $$;

COMMENT ON TABLE public.backup_logs IS 'Logs of nightly backup operations';
COMMENT ON COLUMN public.intake_data.source IS 'Source of the intake data: manual, typeform, partner_api, or wizard';