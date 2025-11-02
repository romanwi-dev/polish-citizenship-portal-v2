-- ============================================
-- PHASE 1: EMERGENCY WORKFLOW FIXES
-- ============================================

-- 1. Add ON DELETE CASCADE to workflow foreign keys
-- ============================================

-- Translation requests
ALTER TABLE public.translation_requests
  DROP CONSTRAINT IF EXISTS translation_requests_case_id_fkey,
  ADD CONSTRAINT translation_requests_case_id_fkey 
    FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

ALTER TABLE public.translation_requests
  DROP CONSTRAINT IF EXISTS translation_requests_document_id_fkey,
  ADD CONSTRAINT translation_requests_document_id_fkey 
    FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;

-- Archive searches
ALTER TABLE public.archive_searches
  DROP CONSTRAINT IF EXISTS archive_searches_case_id_fkey,
  ADD CONSTRAINT archive_searches_case_id_fkey 
    FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

-- USC requests
ALTER TABLE public.usc_requests
  DROP CONSTRAINT IF EXISTS usc_requests_case_id_fkey,
  ADD CONSTRAINT usc_requests_case_id_fkey 
    FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

-- Passport applications
ALTER TABLE public.passport_applications
  DROP CONSTRAINT IF EXISTS passport_applications_case_id_fkey,
  ADD CONSTRAINT passport_applications_case_id_fkey 
    FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

-- 2. Create unified workflow_status enum
-- ============================================

CREATE TYPE public.workflow_status AS ENUM (
  'pending',
  'assigned',
  'in_progress',
  'review',
  'approved',
  'completed',
  'blocked',
  'cancelled'
);

-- 3. Add workflow_stage tracking column to workflow tables
-- ============================================

-- Translation requests - add workflow_stage column
ALTER TABLE public.translation_requests
  ADD COLUMN IF NOT EXISTS workflow_stage text,
  ADD COLUMN IF NOT EXISTS stage_entered_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS stage_history jsonb DEFAULT '[]'::jsonb;

-- Create index for workflow stage queries
CREATE INDEX IF NOT EXISTS idx_translation_requests_workflow_stage 
  ON public.translation_requests(workflow_stage);

-- Archive searches - add workflow_stage column
ALTER TABLE public.archive_searches
  ADD COLUMN IF NOT EXISTS workflow_stage text,
  ADD COLUMN IF NOT EXISTS stage_entered_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS stage_history jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_archive_searches_workflow_stage 
  ON public.archive_searches(workflow_stage);

-- USC requests - add workflow_stage column
ALTER TABLE public.usc_requests
  ADD COLUMN IF NOT EXISTS workflow_stage text,
  ADD COLUMN IF NOT EXISTS stage_entered_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS stage_history jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_usc_requests_workflow_stage 
  ON public.usc_requests(workflow_stage);

-- Passport applications - add workflow_stage column
ALTER TABLE public.passport_applications
  ADD COLUMN IF NOT EXISTS workflow_stage text,
  ADD COLUMN IF NOT EXISTS stage_entered_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS stage_history jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_passport_applications_workflow_stage 
  ON public.passport_applications(workflow_stage);

-- 4. Add active_workflows tracking to cases table
-- ============================================

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS active_workflows jsonb DEFAULT '{
    "translations": 0,
    "archives": 0,
    "usc": 0,
    "passport": 0,
    "civil_acts": 0
  }'::jsonb;

-- Create index for workflow tracking queries
CREATE INDEX IF NOT EXISTS idx_cases_active_workflows 
  ON public.cases USING gin(active_workflows);

-- 5. Create function to update active workflow counts
-- ============================================

CREATE OR REPLACE FUNCTION public.update_active_workflows()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the cases table with current active workflow counts
  UPDATE public.cases
  SET active_workflows = jsonb_build_object(
    'translations', (
      SELECT COUNT(*) FROM public.translation_requests 
      WHERE case_id = COALESCE(NEW.case_id, OLD.case_id) 
      AND status NOT IN ('completed', 'cancelled')
    ),
    'archives', (
      SELECT COUNT(*) FROM public.archive_searches 
      WHERE case_id = COALESCE(NEW.case_id, OLD.case_id) 
      AND status NOT IN ('completed', 'cancelled')
    ),
    'usc', (
      SELECT COUNT(*) FROM public.usc_requests 
      WHERE case_id = COALESCE(NEW.case_id, OLD.case_id) 
      AND status NOT IN ('completed', 'cancelled')
    ),
    'passport', (
      SELECT COUNT(*) FROM public.passport_applications 
      WHERE case_id = COALESCE(NEW.case_id, OLD.case_id) 
      AND status NOT IN ('issued', 'received', 'cancelled')
    )
  )
  WHERE id = COALESCE(NEW.case_id, OLD.case_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Create triggers to auto-update workflow counts
-- ============================================

-- Translation requests triggers
DROP TRIGGER IF EXISTS update_workflows_on_translation_insert ON public.translation_requests;
CREATE TRIGGER update_workflows_on_translation_insert
  AFTER INSERT ON public.translation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

DROP TRIGGER IF EXISTS update_workflows_on_translation_update ON public.translation_requests;
CREATE TRIGGER update_workflows_on_translation_update
  AFTER UPDATE OF status ON public.translation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

DROP TRIGGER IF EXISTS update_workflows_on_translation_delete ON public.translation_requests;
CREATE TRIGGER update_workflows_on_translation_delete
  AFTER DELETE ON public.translation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

-- Archive searches triggers
DROP TRIGGER IF EXISTS update_workflows_on_archive_insert ON public.archive_searches;
CREATE TRIGGER update_workflows_on_archive_insert
  AFTER INSERT ON public.archive_searches
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

DROP TRIGGER IF EXISTS update_workflows_on_archive_update ON public.archive_searches;
CREATE TRIGGER update_workflows_on_archive_update
  AFTER UPDATE OF status ON public.archive_searches
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

DROP TRIGGER IF EXISTS update_workflows_on_archive_delete ON public.archive_searches;
CREATE TRIGGER update_workflows_on_archive_delete
  AFTER DELETE ON public.archive_searches
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

-- USC requests triggers
DROP TRIGGER IF EXISTS update_workflows_on_usc_insert ON public.usc_requests;
CREATE TRIGGER update_workflows_on_usc_insert
  AFTER INSERT ON public.usc_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

DROP TRIGGER IF EXISTS update_workflows_on_usc_update ON public.usc_requests;
CREATE TRIGGER update_workflows_on_usc_update
  AFTER UPDATE OF status ON public.usc_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

DROP TRIGGER IF EXISTS update_workflows_on_usc_delete ON public.usc_requests;
CREATE TRIGGER update_workflows_on_usc_delete
  AFTER DELETE ON public.usc_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

-- Passport applications triggers
DROP TRIGGER IF EXISTS update_workflows_on_passport_insert ON public.passport_applications;
CREATE TRIGGER update_workflows_on_passport_insert
  AFTER INSERT ON public.passport_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

DROP TRIGGER IF EXISTS update_workflows_on_passport_update ON public.passport_applications;
CREATE TRIGGER update_workflows_on_passport_update
  AFTER UPDATE OF status ON public.passport_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();

DROP TRIGGER IF EXISTS update_workflows_on_passport_delete ON public.passport_applications;
CREATE TRIGGER update_workflows_on_passport_delete
  AFTER DELETE ON public.passport_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_active_workflows();