-- PDF Stability Pack v1: Deterministic generation with artifact caching and job queue

-- Artifacts: one row per unique PDF bytes (content-addressed)
CREATE TABLE IF NOT EXISTS public.pdf_artifacts (
  id BIGSERIAL PRIMARY KEY,
  artifact_key TEXT UNIQUE NOT NULL,   -- sha256(caseId|template|TEMPLATE_VERSION|dataHash)
  path TEXT NOT NULL,                  -- storage path
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pdf_artifacts_key_idx ON public.pdf_artifacts (artifact_key);
CREATE INDEX IF NOT EXISTS pdf_artifacts_created_idx ON public.pdf_artifacts (created_at);

-- Jobs: queue for generation
CREATE TABLE IF NOT EXISTS public.pdf_jobs (
  id BIGSERIAL PRIMARY KEY,
  artifact_key TEXT NOT NULL,
  case_id TEXT NOT NULL,
  template_type TEXT NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued', -- queued|running|succeeded|failed
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pdf_jobs_status_idx ON public.pdf_jobs (status, created_at);
CREATE INDEX IF NOT EXISTS pdf_jobs_artifact_idx ON public.pdf_jobs (artifact_key);
CREATE INDEX IF NOT EXISTS pdf_jobs_user_idx ON public.pdf_jobs (user_id, created_at);

-- Dead letter for postmortems
CREATE TABLE IF NOT EXISTS public.pdf_dead_letters (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT,
  artifact_key TEXT,
  last_error TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pdf_dead_letters_created_idx ON public.pdf_dead_letters (created_at);

-- Update generated_documents to add size tracking
ALTER TABLE public.generated_documents 
  ADD COLUMN IF NOT EXISTS size_bytes INTEGER,
  ADD COLUMN IF NOT EXISTS artifact_key TEXT;

CREATE INDEX IF NOT EXISTS generated_documents_artifact_idx ON public.generated_documents (artifact_key);

-- RLS: Keep these tables server-only (service role access)
ALTER TABLE public.pdf_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_dead_letters ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view artifacts" ON public.pdf_artifacts
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view jobs" ON public.pdf_jobs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view dead letters" ON public.pdf_dead_letters
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));