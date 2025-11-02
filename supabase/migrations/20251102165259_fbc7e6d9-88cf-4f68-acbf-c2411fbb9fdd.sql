-- ============================================
-- PHASE 4: NOTIFICATIONS & SLA TRACKING
-- ============================================

-- 1. Create workflow_notifications table
-- ============================================

CREATE TABLE IF NOT EXISTS public.workflow_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id uuid NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  
  notification_type text NOT NULL, -- 'sla_warning', 'sla_violated', 'stage_transition', 'assignment', 'completion'
  severity text NOT NULL, -- 'info', 'warning', 'critical'
  
  recipient_user_id uuid,
  recipient_email text,
  
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Delivery tracking
  sent_at timestamp with time zone,
  read_at timestamp with time zone,
  
  -- Channel tracking
  sent_via_email boolean DEFAULT false,
  sent_via_in_app boolean DEFAULT true,
  sent_via_sms boolean DEFAULT false,
  
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
  ON public.workflow_notifications FOR SELECT
  USING (auth.uid() = recipient_user_id);

CREATE POLICY "Staff can view all notifications"
  ON public.workflow_notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "System can create notifications"
  ON public.workflow_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can mark their notifications as read"
  ON public.workflow_notifications FOR UPDATE
  USING (auth.uid() = recipient_user_id)
  WITH CHECK (auth.uid() = recipient_user_id);

-- Indexes
CREATE INDEX idx_workflow_notifications_workflow ON public.workflow_notifications(workflow_instance_id);
CREATE INDEX idx_workflow_notifications_recipient ON public.workflow_notifications(recipient_user_id);
CREATE INDEX idx_workflow_notifications_sent ON public.workflow_notifications(sent_at);
CREATE INDEX idx_workflow_notifications_read ON public.workflow_notifications(read_at);
CREATE INDEX idx_workflow_notifications_type ON public.workflow_notifications(notification_type);

-- 2. Create workflow_sla_violations table
-- ============================================

CREATE TABLE IF NOT EXISTS public.workflow_sla_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id uuid NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  
  violation_type text NOT NULL, -- 'deadline_missed', 'stage_timeout', 'total_duration_exceeded'
  stage text,
  
  expected_completion timestamp with time zone,
  actual_completion timestamp with time zone,
  delay_hours integer,
  
  escalated boolean DEFAULT false,
  escalated_to uuid,
  escalated_at timestamp with time zone,
  
  resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolution_notes text,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_sla_violations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff can view SLA violations"
  ON public.workflow_sla_violations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Staff can manage SLA violations"
  ON public.workflow_sla_violations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- Indexes
CREATE INDEX idx_sla_violations_workflow ON public.workflow_sla_violations(workflow_instance_id);
CREATE INDEX idx_sla_violations_escalated ON public.workflow_sla_violations(escalated);
CREATE INDEX idx_sla_violations_resolved ON public.workflow_sla_violations(resolved);
CREATE INDEX idx_sla_violations_created ON public.workflow_sla_violations(created_at);

-- 3. Create function to send workflow notification
-- ============================================

CREATE OR REPLACE FUNCTION public.send_workflow_notification(
  p_workflow_instance_id uuid,
  p_notification_type text,
  p_severity text,
  p_recipient_user_id uuid,
  p_title text,
  p_message text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id uuid;
  v_recipient_email text;
BEGIN
  -- Get recipient email
  SELECT email INTO v_recipient_email
  FROM auth.users
  WHERE id = p_recipient_user_id;
  
  -- Create notification
  INSERT INTO workflow_notifications (
    workflow_instance_id,
    notification_type,
    severity,
    recipient_user_id,
    recipient_email,
    title,
    message,
    metadata,
    sent_at
  ) VALUES (
    p_workflow_instance_id,
    p_notification_type,
    p_severity,
    p_recipient_user_id,
    v_recipient_email,
    p_title,
    p_message,
    p_metadata,
    now()
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- 4. Create function to check and record SLA violations
-- ============================================

CREATE OR REPLACE FUNCTION public.check_workflow_sla_violations()
RETURNS TABLE(
  workflow_id uuid,
  violation_type text,
  delay_hours integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH violations AS (
    SELECT
      wi.id as workflow_id,
      'deadline_missed'::text as violation_type,
      EXTRACT(EPOCH FROM (now() - wi.deadline))::integer / 3600 as delay_hours,
      wi.case_id,
      wi.workflow_type,
      wi.current_stage,
      wi.assigned_to
    FROM workflow_instances wi
    WHERE wi.deadline < now()
      AND wi.status NOT IN ('completed', 'cancelled')
      AND wi.sla_violated = false
  )
  SELECT 
    v.workflow_id,
    v.violation_type,
    v.delay_hours
  FROM violations v;
  
  -- Update workflow instances to mark SLA as violated
  UPDATE workflow_instances wi
  SET sla_violated = true
  WHERE wi.id IN (
    SELECT workflow_id FROM violations
  );
  
  -- Insert violation records
  INSERT INTO workflow_sla_violations (
    workflow_instance_id,
    violation_type,
    stage,
    expected_completion,
    delay_hours
  )
  SELECT
    v.workflow_id,
    v.violation_type,
    v.current_stage,
    wi.deadline,
    v.delay_hours
  FROM violations v
  JOIN workflow_instances wi ON wi.id = v.workflow_id
  WHERE NOT EXISTS (
    SELECT 1 FROM workflow_sla_violations wsv
    WHERE wsv.workflow_instance_id = v.workflow_id
      AND wsv.violation_type = 'deadline_missed'
      AND wsv.resolved = false
  );
  
  -- Send notifications for new violations
  INSERT INTO workflow_notifications (
    workflow_instance_id,
    notification_type,
    severity,
    recipient_user_id,
    title,
    message,
    metadata,
    sent_at
  )
  SELECT
    v.workflow_id,
    'sla_violated',
    'critical',
    COALESCE(wi.assigned_to, (
      SELECT user_id FROM user_roles 
      WHERE role = 'admin'::app_role 
      LIMIT 1
    )),
    'SLA Violation: ' || wd.display_name,
    format(
      'Workflow for case %s is %s hours overdue. Current stage: %s',
      (SELECT client_name FROM cases WHERE id = wi.case_id),
      v.delay_hours,
      v.current_stage
    ),
    jsonb_build_object(
      'workflow_type', wi.workflow_type,
      'case_id', wi.case_id,
      'delay_hours', v.delay_hours
    ),
    now()
  FROM violations v
  JOIN workflow_instances wi ON wi.id = v.workflow_id
  JOIN workflow_definitions wd ON wd.workflow_type = wi.workflow_type;
END;
$$;

-- 5. Create function to check for SLA warnings
-- ============================================

CREATE OR REPLACE FUNCTION public.check_workflow_sla_warnings()
RETURNS TABLE(
  workflow_id uuid,
  hours_remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH warnings AS (
    SELECT
      wi.id as workflow_id,
      EXTRACT(EPOCH FROM (wi.deadline - now()))::integer / 3600 as hours_remaining,
      wi.case_id,
      wi.workflow_type,
      wi.current_stage,
      wi.assigned_to
    FROM workflow_instances wi
    WHERE wi.deadline > now()
      AND wi.deadline < now() + interval '48 hours'
      AND wi.status NOT IN ('completed', 'cancelled')
      AND wi.sla_violated = false
      -- Only send warning once
      AND NOT EXISTS (
        SELECT 1 FROM workflow_notifications wn
        WHERE wn.workflow_instance_id = wi.id
          AND wn.notification_type = 'sla_warning'
          AND wn.created_at > now() - interval '24 hours'
      )
  )
  SELECT 
    w.workflow_id,
    w.hours_remaining
  FROM warnings w;
  
  -- Send warning notifications
  INSERT INTO workflow_notifications (
    workflow_instance_id,
    notification_type,
    severity,
    recipient_user_id,
    title,
    message,
    metadata,
    sent_at
  )
  SELECT
    w.workflow_id,
    'sla_warning',
    'warning',
    COALESCE(wi.assigned_to, (
      SELECT user_id FROM user_roles 
      WHERE role = 'admin'::app_role 
      LIMIT 1
    )),
    'SLA Warning: ' || wd.display_name,
    format(
      'Workflow for case %s has %s hours remaining. Current stage: %s',
      (SELECT client_name FROM cases WHERE id = wi.case_id),
      w.hours_remaining,
      w.current_stage
    ),
    jsonb_build_object(
      'workflow_type', wi.workflow_type,
      'case_id', wi.case_id,
      'hours_remaining', w.hours_remaining
    ),
    now()
  FROM warnings w
  JOIN workflow_instances wi ON wi.id = w.workflow_id
  JOIN workflow_definitions wd ON wd.workflow_type = wi.workflow_type;
END;
$$;

-- 6. Create trigger to send notification on stage transition
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_on_stage_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_case_name text;
  v_workflow_name text;
BEGIN
  -- Get case name
  SELECT client_name INTO v_case_name
  FROM cases
  WHERE id = NEW.case_id;
  
  -- Get workflow name
  SELECT display_name INTO v_workflow_name
  FROM workflow_definitions
  WHERE workflow_type = NEW.workflow_type;
  
  -- Send notification to assigned user
  IF NEW.assigned_to IS NOT NULL THEN
    INSERT INTO workflow_notifications (
      workflow_instance_id,
      notification_type,
      severity,
      recipient_user_id,
      title,
      message,
      metadata,
      sent_at
    ) VALUES (
      NEW.id,
      'stage_transition',
      'info',
      NEW.assigned_to,
      v_workflow_name || ' Updated',
      format(
        'Workflow for %s moved to stage: %s',
        v_case_name,
        NEW.current_stage
      ),
      jsonb_build_object(
        'from_stage', OLD.current_stage,
        'to_stage', NEW.current_stage,
        'workflow_type', NEW.workflow_type
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to workflow_instances
DROP TRIGGER IF EXISTS notify_on_workflow_stage_transition ON public.workflow_instances;
CREATE TRIGGER notify_on_workflow_stage_transition
  AFTER UPDATE OF current_stage ON public.workflow_instances
  FOR EACH ROW
  WHEN (OLD.current_stage IS DISTINCT FROM NEW.current_stage)
  EXECUTE FUNCTION public.notify_on_stage_transition();

-- 7. Create trigger to send notification on assignment
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_on_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_case_name text;
  v_workflow_name text;
BEGIN
  -- Only proceed if assigned_to changed
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
    -- Get case name
    SELECT client_name INTO v_case_name
    FROM cases
    WHERE id = NEW.case_id;
    
    -- Get workflow name
    SELECT display_name INTO v_workflow_name
    FROM workflow_definitions
    WHERE workflow_type = NEW.workflow_type;
    
    -- Send notification to newly assigned user
    INSERT INTO workflow_notifications (
      workflow_instance_id,
      notification_type,
      severity,
      recipient_user_id,
      title,
      message,
      metadata,
      sent_at
    ) VALUES (
      NEW.id,
      'assignment',
      'info',
      NEW.assigned_to,
      'New Workflow Assigned',
      format(
        'You have been assigned to %s workflow for %s',
        v_workflow_name,
        v_case_name
      ),
      jsonb_build_object(
        'workflow_type', NEW.workflow_type,
        'case_id', NEW.case_id,
        'current_stage', NEW.current_stage
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to workflow_instances
DROP TRIGGER IF EXISTS notify_on_workflow_assignment ON public.workflow_instances;
CREATE TRIGGER notify_on_workflow_assignment
  AFTER UPDATE OF assigned_to ON public.workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_assignment();

-- 8. Create trigger to send notification on completion
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_case_name text;
  v_workflow_name text;
  v_duration_hours integer;
BEGIN
  -- Only proceed if status changed to completed
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN
    -- Get case name
    SELECT client_name INTO v_case_name
    FROM cases
    WHERE id = NEW.case_id;
    
    -- Get workflow name
    SELECT display_name INTO v_workflow_name
    FROM workflow_definitions
    WHERE workflow_type = NEW.workflow_type;
    
    -- Calculate duration
    v_duration_hours := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::integer / 3600;
    
    -- Send notification to assigned user
    IF NEW.assigned_to IS NOT NULL THEN
      INSERT INTO workflow_notifications (
        workflow_instance_id,
        notification_type,
        severity,
        recipient_user_id,
        title,
        message,
        metadata,
        sent_at
      ) VALUES (
        NEW.id,
        'completion',
        'info',
        NEW.assigned_to,
        'Workflow Completed',
        format(
          '%s workflow for %s completed in %s hours',
          v_workflow_name,
          v_case_name,
          v_duration_hours
        ),
        jsonb_build_object(
          'workflow_type', NEW.workflow_type,
          'case_id', NEW.case_id,
          'duration_hours', v_duration_hours,
          'sla_violated', NEW.sla_violated
        ),
        now()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to workflow_instances
DROP TRIGGER IF EXISTS notify_on_workflow_completion ON public.workflow_instances;
CREATE TRIGGER notify_on_workflow_completion
  AFTER UPDATE OF status ON public.workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_completion();