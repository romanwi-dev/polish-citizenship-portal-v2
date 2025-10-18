-- Remove old agent_type constraint
ALTER TABLE ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_agent_type_check;

-- Add aligned constraint with all valid agent types
ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_agent_type_check 
CHECK (agent_type IN (
  'comprehensive', 'security_audit',
  'eligibility_analysis', 'document_check', 'document_intelligence',
  'task_suggest',
  'form_populate', 'auto_populate_forms',
  'wsc_strategy', 'wsc_response_drafting',
  'archive_request_management', 'civil_acts_management',
  'researcher', 'translator', 'writer', 'designer',
  'translation_workflow', 'analytics_report'
));