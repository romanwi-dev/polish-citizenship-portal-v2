-- Create crash_states table for server-side crash recovery storage
CREATE TABLE IF NOT EXISTS public.crash_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  crash_data JSONB NOT NULL,
  error_message TEXT,
  component_stack TEXT,
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  recovered_at TIMESTAMPTZ,
  
  -- Prevent duplicate active crash states per session
  CONSTRAINT unique_active_session UNIQUE (session_id, user_id)
);

-- Enable RLS
ALTER TABLE public.crash_states ENABLE ROW LEVEL SECURITY;

-- Users can only access their own crash states
CREATE POLICY "Users can view their own crash states"
  ON public.crash_states
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    (user_id IS NULL AND session_id = current_setting('request.jwt.claims', true)::json->>'session_id')
  );

CREATE POLICY "Users can create their own crash states"
  ON public.crash_states
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL
  );

CREATE POLICY "Users can update their own crash states"
  ON public.crash_states
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    (user_id IS NULL AND session_id = current_setting('request.jwt.claims', true)::json->>'session_id')
  );

CREATE POLICY "Users can delete their own crash states"
  ON public.crash_states
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    (user_id IS NULL AND session_id = current_setting('request.jwt.claims', true)::json->>'session_id')
  );

-- Index for efficient cleanup of expired states
CREATE INDEX idx_crash_states_expires_at ON public.crash_states(expires_at);

-- Index for session lookups
CREATE INDEX idx_crash_states_session ON public.crash_states(session_id, user_id);

-- Function to cleanup expired crash states
CREATE OR REPLACE FUNCTION public.cleanup_expired_crash_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.crash_states
  WHERE expires_at < now()
    OR recovered_at < (now() - INTERVAL '7 days');
END;
$$;