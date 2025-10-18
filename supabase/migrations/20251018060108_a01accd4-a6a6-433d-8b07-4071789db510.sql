-- Create AI conversations table
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('researcher', 'writer', 'translator', 'designer', 'eligibility', 'document_check', 'task_suggest', 'wsc_strategy', 'form_populate', 'comprehensive', 'security_audit', 'document_intelligence', 'auto_populate_forms', 'generate_archive_request', 'civil_acts_management', 'translation_workflow', 'analytics_report')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI conversation messages table
CREATE TABLE ai_conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tool_calls JSONB DEFAULT NULL,
  tool_call_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX idx_conversation_case ON ai_conversations(case_id, agent_type);
CREATE INDEX idx_conversation_messages ON ai_conversation_messages(conversation_id, created_at);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_conversations
CREATE POLICY "Admins and assistants can manage AI conversations"
ON ai_conversations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Clients can view their own AI conversations"
ON ai_conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_portal_access
    WHERE client_portal_access.case_id = ai_conversations.case_id
    AND client_portal_access.user_id = auth.uid()
  )
);

-- RLS policies for ai_conversation_messages
CREATE POLICY "Admins and assistants can manage AI conversation messages"
ON ai_conversation_messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_conversation_messages.conversation_id
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role))
  )
);

CREATE POLICY "Clients can view their own AI conversation messages"
ON ai_conversation_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations ac
    JOIN client_portal_access cpa ON cpa.case_id = ac.case_id
    WHERE ac.id = ai_conversation_messages.conversation_id
    AND cpa.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON ai_conversations
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();