-- ============================================
-- PHASE 2: CORE WORKFLOW ENGINE
-- ============================================

-- 1. Create workflow_definitions table
-- ============================================

CREATE TABLE IF NOT EXISTS public.workflow_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_sla_days integer DEFAULT 7,
  auto_assign boolean DEFAULT false,
  assignment_rules jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff can view workflow definitions"
  ON public.workflow_definitions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Admins can manage workflow definitions"
  ON public.workflow_definitions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default workflow definitions
INSERT INTO public.workflow_definitions (workflow_type, display_name, description, stages, default_sla_days) VALUES
('translations', 'Translation Workflow', 'Document translation process', 
 '[
   {"stage": "upload_pending", "name": "Upload Documents", "order": 1},
   {"stage": "uploaded", "name": "Uploaded", "order": 2},
   {"stage": "ocr_processing", "name": "OCR Processing", "order": 3},
   {"stage": "ocr_complete", "name": "OCR Complete", "order": 4},
   {"stage": "ai_translating", "name": "AI Translation", "order": 5},
   {"stage": "ai_complete", "name": "AI Complete", "order": 6},
   {"stage": "hac_review", "name": "HAC Review", "order": 7},
   {"stage": "hac_approved", "name": "HAC Approved", "order": 8},
   {"stage": "sent_to_translator", "name": "Sworn Translator", "order": 9},
   {"stage": "translator_certified", "name": "Certified", "order": 10},
   {"stage": "ready_for_submission", "name": "Ready", "order": 11},
   {"stage": "submitted_wsc", "name": "Submit to WSC", "order": 12},
   {"stage": "submitted_usc", "name": "Submit to USC", "order": 13},
   {"stage": "completed", "name": "Completed", "order": 14}
 ]'::jsonb, 14),
('archives', 'Archive Search Workflow', 'Polish archive document search',
 '[
   {"stage": "pending", "name": "Request Created", "order": 1},
   {"stage": "letter_generated", "name": "Letter Generated", "order": 2},
   {"stage": "letter_sent", "name": "Letter Sent", "order": 3},
   {"stage": "response_received", "name": "Response Received", "order": 4},
   {"stage": "documents_received", "name": "Documents Received", "order": 5},
   {"stage": "completed", "name": "Completed", "order": 6}
 ]'::jsonb, 90),
('usc', 'USC Civil Registry Workflow', 'Polish Civil Registry requests',
 '[
   {"stage": "draft", "name": "Draft", "order": 1},
   {"stage": "letter_generated", "name": "Letter Generated", "order": 2},
   {"stage": "letter_sent", "name": "Letter Sent", "order": 3},
   {"stage": "response_received", "name": "Response Received", "order": 4},
   {"stage": "completed", "name": "Completed", "order": 5}
 ]'::jsonb, 60),
('passport', 'Passport Application Workflow', 'Polish passport application process',
 '[
   {"stage": "preparing", "name": "Preparing Documents", "order": 1},
   {"stage": "checklist_generated", "name": "Checklist Ready", "order": 2},
   {"stage": "appointment_scheduled", "name": "Appointment Scheduled", "order": 3},
   {"stage": "submitted", "name": "Submitted", "order": 4},
   {"stage": "approved", "name": "Approved", "order": 5},
   {"stage": "issued", "name": "Issued", "order": 6},
   {"stage": "received", "name": "Received", "order": 7}
 ]'::jsonb, 30);

-- 2. Create workflow_instances table (unified tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS public.workflow_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type text NOT NULL REFERENCES public.workflow_definitions(workflow_type) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  
  -- Polymorphic reference to actual workflow record
  source_table text NOT NULL,
  source_id uuid NOT NULL,
  
  -- Current state
  current_stage text NOT NULL,
  status workflow_status DEFAULT 'pending'::workflow_status,
  
  -- Assignment
  assigned_to uuid,
  assigned_at timestamp with time zone,
  
  -- SLA tracking
  deadline timestamp with time zone,
  sla_violated boolean DEFAULT false,
  
  -- Metadata
  priority text DEFAULT 'medium',
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff can view workflow instances"
  ON public.workflow_instances FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Staff can manage workflow instances"
  ON public.workflow_instances FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Clients can view their workflow instances"
  ON public.workflow_instances FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = workflow_instances.case_id
    AND client_portal_access.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_workflow_instances_case ON public.workflow_instances(case_id);
CREATE INDEX idx_workflow_instances_type ON public.workflow_instances(workflow_type);
CREATE INDEX idx_workflow_instances_stage ON public.workflow_instances(current_stage);
CREATE INDEX idx_workflow_instances_status ON public.workflow_instances(status);
CREATE INDEX idx_workflow_instances_assigned ON public.workflow_instances(assigned_to);
CREATE INDEX idx_workflow_instances_deadline ON public.workflow_instances(deadline);
CREATE UNIQUE INDEX idx_workflow_instances_source ON public.workflow_instances(source_table, source_id);

-- 3. Create workflow_stage_transitions table (audit trail)
-- ============================================

CREATE TABLE IF NOT EXISTS public.workflow_stage_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id uuid NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  
  from_stage text,
  to_stage text NOT NULL,
  
  transitioned_by uuid,
  transition_reason text,
  
  duration_seconds integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_stage_transitions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff can view stage transitions"
  ON public.workflow_stage_transitions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Staff can create stage transitions"
  ON public.workflow_stage_transitions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- Indexes
CREATE INDEX idx_stage_transitions_workflow ON public.workflow_stage_transitions(workflow_instance_id);
CREATE INDEX idx_stage_transitions_created ON public.workflow_stage_transitions(created_at);

-- 4. Create workflow_sla_rules table
-- ============================================

CREATE TABLE IF NOT EXISTS public.workflow_sla_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type text NOT NULL REFERENCES public.workflow_definitions(workflow_type) ON DELETE CASCADE,
  stage text NOT NULL,
  
  -- SLA settings
  max_duration_hours integer NOT NULL,
  warning_threshold_hours integer,
  
  -- Actions on violation
  escalate_to_role text,
  send_notification boolean DEFAULT true,
  
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(workflow_type, stage)
);

-- Enable RLS
ALTER TABLE public.workflow_sla_rules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff can view SLA rules"
  ON public.workflow_sla_rules FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Admins can manage SLA rules"
  ON public.workflow_sla_rules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default SLA rules
INSERT INTO public.workflow_sla_rules (workflow_type, stage, max_duration_hours, warning_threshold_hours) VALUES
('translations', 'hac_review', 48, 36),
('translations', 'sent_to_translator', 168, 120), -- 7 days, warn at 5
('archives', 'letter_sent', 2160, 1680), -- 90 days, warn at 70
('usc', 'letter_sent', 1440, 1080), -- 60 days, warn at 45
('passport', 'appointment_scheduled', 336, 240); -- 14 days, warn at 10

-- 5. Create transition_workflow_stage function
-- ============================================

CREATE OR REPLACE FUNCTION public.transition_workflow_stage(
  p_workflow_instance_id uuid,
  p_to_stage text,
  p_transitioned_by uuid DEFAULT auth.uid(),
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_instance record;
  v_from_stage text;
  v_stage_entered_at timestamp with time zone;
  v_duration_seconds integer;
  v_transition_id uuid;
BEGIN
  -- Get current workflow instance
  SELECT * INTO v_instance
  FROM workflow_instances
  WHERE id = p_workflow_instance_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Workflow instance not found');
  END IF;
  
  v_from_stage := v_instance.current_stage;
  v_stage_entered_at := v_instance.updated_at;
  
  -- Calculate duration in current stage
  v_duration_seconds := EXTRACT(EPOCH FROM (now() - v_stage_entered_at))::integer;
  
  -- Update workflow instance
  UPDATE workflow_instances
  SET 
    current_stage = p_to_stage,
    status = CASE 
      WHEN p_to_stage IN ('completed', 'submitted_usc', 'received') THEN 'completed'::workflow_status
      WHEN p_to_stage LIKE '%review%' THEN 'review'::workflow_status
      WHEN p_to_stage LIKE '%approved%' THEN 'approved'::workflow_status
      ELSE 'in_progress'::workflow_status
    END,
    completed_at = CASE WHEN p_to_stage IN ('completed', 'submitted_usc', 'received') THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = p_workflow_instance_id;
  
  -- Update source table workflow_stage
  EXECUTE format(
    'UPDATE %I SET workflow_stage = $1, stage_entered_at = now(), 
     stage_history = COALESCE(stage_history, ''[]''::jsonb) || jsonb_build_object(
       ''from'', $2, 
       ''to'', $3, 
       ''at'', now(), 
       ''by'', $4,
       ''duration_seconds'', $5
     )::jsonb
     WHERE id = $6',
    v_instance.source_table
  ) USING p_to_stage, v_from_stage, p_to_stage, p_transitioned_by, v_duration_seconds, v_instance.source_id;
  
  -- Record transition
  INSERT INTO workflow_stage_transitions (
    workflow_instance_id,
    from_stage,
    to_stage,
    transitioned_by,
    transition_reason,
    duration_seconds
  ) VALUES (
    p_workflow_instance_id,
    v_from_stage,
    p_to_stage,
    p_transitioned_by,
    p_reason,
    v_duration_seconds
  ) RETURNING id INTO v_transition_id;
  
  -- Log to HAC logs
  INSERT INTO hac_logs (
    case_id,
    action_type,
    action_description,
    field_changed,
    old_value,
    new_value
  ) VALUES (
    v_instance.case_id,
    'workflow_transition',
    format('Workflow %s: %s → %s', v_instance.workflow_type, v_from_stage, p_to_stage),
    'workflow_stage',
    v_from_stage,
    p_to_stage
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'transition_id', v_transition_id,
    'from_stage', v_from_stage,
    'to_stage', p_to_stage,
    'duration_seconds', v_duration_seconds
  );
END;
$$;

-- 6. Create trigger to auto-create workflow instances
-- ============================================

CREATE OR REPLACE FUNCTION public.create_workflow_instance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workflow_type text;
  v_default_sla integer;
BEGIN
  -- Determine workflow type from table name
  v_workflow_type := CASE TG_TABLE_NAME
    WHEN 'translation_requests' THEN 'translations'
    WHEN 'archive_searches' THEN 'archives'
    WHEN 'usc_requests' THEN 'usc'
    WHEN 'passport_applications' THEN 'passport'
    ELSE NULL
  END;
  
  IF v_workflow_type IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get default SLA
  SELECT default_sla_days INTO v_default_sla
  FROM workflow_definitions
  WHERE workflow_type = v_workflow_type;
  
  -- Create workflow instance
  INSERT INTO workflow_instances (
    workflow_type,
    case_id,
    source_table,
    source_id,
    current_stage,
    status,
    priority,
    deadline
  ) VALUES (
    v_workflow_type,
    NEW.case_id,
    TG_TABLE_NAME,
    NEW.id,
    COALESCE(NEW.workflow_stage, NEW.status, 'pending'),
    'pending'::workflow_status,
    COALESCE(NEW.priority, 'medium'),
    now() + (COALESCE(v_default_sla, 7) || ' days')::interval
  );
  
  RETURN NEW;
END;
$$;

-- Attach triggers to workflow tables
DROP TRIGGER IF EXISTS create_workflow_instance_translation ON public.translation_requests;
CREATE TRIGGER create_workflow_instance_translation
  AFTER INSERT ON public.translation_requests
  FOR EACH ROW EXECUTE FUNCTION public.create_workflow_instance();

DROP TRIGGER IF EXISTS create_workflow_instance_archive ON public.archive_searches;
CREATE TRIGGER create_workflow_instance_archive
  AFTER INSERT ON public.archive_searches
  FOR EACH ROW EXECUTE FUNCTION public.create_workflow_instance();

DROP TRIGGER IF EXISTS create_workflow_instance_usc ON public.usc_requests;
CREATE TRIGGER create_workflow_instance_usc
  AFTER INSERT ON public.usc_requests
  FOR EACH ROW EXECUTE FUNCTION public.create_workflow_instance();

DROP TRIGGER IF EXISTS create_workflow_instance_passport ON public.passport_applications;
CREATE TRIGGER create_workflow_instance_passport
  AFTER INSERT ON public.passport_applications
  FOR EACH ROW EXECUTE FUNCTION public.create_workflow_instance();

-- 7. Update timestamps trigger for workflow tables
-- ============================================

DROP TRIGGER IF EXISTS update_workflow_definitions_updated_at ON public.workflow_definitions;
CREATE TRIGGER update_workflow_definitions_updated_at
  BEFORE UPDATE ON public.workflow_definitions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_workflow_instances_updated_at ON public.workflow_instances;
CREATE TRIGGER update_workflow_instances_updated_at
  BEFORE UPDATE ON public.workflow_instances
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_workflow_sla_rules_updated_at ON public.workflow_sla_rules;
CREATE TRIGGER update_workflow_sla_rules_updated_at
  BEFORE UPDATE ON public.workflow_sla_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();