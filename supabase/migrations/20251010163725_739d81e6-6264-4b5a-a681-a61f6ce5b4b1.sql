-- Create migration_logs table for tracking Dropbox folder migrations
CREATE TABLE IF NOT EXISTS public.migration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_type TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  changes_made JSONB DEFAULT '[]'::jsonb,
  can_undo BOOLEAN DEFAULT true,
  undone_at TIMESTAMP WITH TIME ZONE,
  undone_by UUID REFERENCES auth.users(id),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.migration_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view migration logs"
  ON public.migration_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can create migration logs"
  ON public.migration_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update migration logs"
  ON public.migration_logs FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_migration_logs_executed_at ON public.migration_logs(executed_at DESC);
CREATE INDEX idx_migration_logs_status ON public.migration_logs(status);