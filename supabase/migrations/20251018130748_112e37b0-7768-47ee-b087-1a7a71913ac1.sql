-- Create backup_logs table for tracking nightly backups
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_date TIMESTAMPTZ NOT NULL,
  backup_path TEXT NOT NULL,
  total_cases INTEGER,
  total_files INTEGER,
  total_size_mb DECIMAL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'in_progress')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage backup logs
CREATE POLICY "Admins can manage backup logs"
ON public.backup_logs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for performance
CREATE INDEX idx_backup_logs_date ON public.backup_logs(backup_date DESC);
CREATE INDEX idx_backup_logs_status ON public.backup_logs(status);