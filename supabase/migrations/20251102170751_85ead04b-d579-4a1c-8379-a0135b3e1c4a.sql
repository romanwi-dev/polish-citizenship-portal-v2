-- Phase 1: Agent Activity Tracking
CREATE TABLE public.ai_agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  tools_executed INTEGER DEFAULT 0,
  tools_failed INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_activity_case ON public.ai_agent_activity(case_id, created_at);
CREATE INDEX idx_agent_activity_type ON public.ai_agent_activity(agent_type, created_at);
CREATE INDEX idx_agent_activity_user ON public.ai_agent_activity(user_id, created_at);
CREATE INDEX idx_agent_activity_conversation ON public.ai_agent_activity(conversation_id);

ALTER TABLE public.ai_agent_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all agent activity"
ON public.ai_agent_activity FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own agent activity"
ON public.ai_agent_activity FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert agent activity"
ON public.ai_agent_activity FOR INSERT
WITH CHECK (true);

-- Agent Metrics
CREATE TABLE public.ai_agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_tools_executed INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_type, period_start, period_end)
);

CREATE INDEX idx_agent_metrics_type_period ON public.ai_agent_metrics(agent_type, period_start);

ALTER TABLE public.ai_agent_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage agent metrics"
ON public.ai_agent_metrics FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Phase 1.3: Add status tracking to conversations
ALTER TABLE public.ai_conversations 
ADD COLUMN status TEXT CHECK (status IN ('queued', 'processing', 'tools_executing', 'completed', 'failed', 'cancelled')) DEFAULT 'queued',
ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN completed_at TIMESTAMPTZ,
ADD COLUMN tools_pending TEXT[] DEFAULT '{}',
ADD COLUMN tools_completed TEXT[] DEFAULT '{}',
ADD COLUMN tools_failed TEXT[] DEFAULT '{}';

CREATE INDEX idx_conversation_status ON public.ai_conversations(status, created_at);

-- Phase 2.1: Multi-Agent Orchestration
CREATE TABLE public.agent_orchestration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  child_conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  delegation_prompt TEXT NOT NULL,
  child_agent_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
  result_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_orchestration_parent ON public.agent_orchestration(parent_conversation_id);
CREATE INDEX idx_orchestration_child ON public.agent_orchestration(child_conversation_id);

ALTER TABLE public.agent_orchestration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage orchestration"
ON public.agent_orchestration FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

-- Phase 2.2: Agent Approval Workflow
CREATE TABLE public.agent_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_arguments JSONB NOT NULL,
  ai_explanation TEXT NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'auto_approved')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  auto_approve_after TIMESTAMPTZ
);

CREATE INDEX idx_approvals_pending ON public.agent_approvals(status, requested_at) WHERE status = 'pending';
CREATE INDEX idx_approvals_conversation ON public.agent_approvals(conversation_id);

ALTER TABLE public.agent_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all approvals"
ON public.agent_approvals FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Staff can manage approvals"
ON public.agent_approvals FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "System can create approvals"
ON public.agent_approvals FOR INSERT
WITH CHECK (true);

-- Phase 2.3: Agent Notifications
CREATE TABLE public.agent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT CHECK (notification_type IN (
    'approval_pending',
    'approval_timeout',
    'tool_failed',
    'long_running_agent',
    'high_token_usage'
  )),
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error')) DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_notif_recipient ON public.agent_notifications(recipient_user_id, read, created_at);
CREATE INDEX idx_agent_notif_conversation ON public.agent_notifications(conversation_id);

ALTER TABLE public.agent_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
ON public.agent_notifications FOR SELECT
USING (recipient_user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
ON public.agent_notifications FOR UPDATE
USING (recipient_user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON public.agent_notifications FOR INSERT
WITH CHECK (true);

-- Phase 3.1: Agent Feedback Loop
ALTER TABLE public.ai_conversation_messages 
ADD COLUMN user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
ADD COLUMN user_feedback TEXT,
ADD COLUMN feedback_at TIMESTAMPTZ;

CREATE INDEX idx_messages_rating ON public.ai_conversation_messages(user_rating) WHERE user_rating IS NOT NULL;

-- Phase 3.2: Agent Knowledge Base
CREATE TABLE public.agent_knowledge_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  snippet TEXT NOT NULL,
  source_conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  usefulness_score INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_agent_topic ON public.agent_knowledge_snippets(agent_type, topic);
CREATE INDEX idx_knowledge_verified ON public.agent_knowledge_snippets(verified, usefulness_score);

ALTER TABLE public.agent_knowledge_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage knowledge snippets"
ON public.agent_knowledge_snippets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "System can read knowledge snippets"
ON public.agent_knowledge_snippets FOR SELECT
USING (true);

-- Phase 4.1: Agent Testing Framework
CREATE TABLE public.agent_test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  test_prompt TEXT NOT NULL,
  expected_tools TEXT[],
  expected_outcome TEXT,
  status TEXT CHECK (status IN ('passing', 'failing', 'skipped')) DEFAULT 'skipped',
  last_run_at TIMESTAMPTZ,
  last_run_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_test_cases_agent ON public.agent_test_cases(agent_type, status);

ALTER TABLE public.agent_test_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage test cases"
ON public.agent_test_cases FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update timestamp trigger for test cases
CREATE TRIGGER update_test_cases_updated_at
  BEFORE UPDATE ON public.agent_test_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();