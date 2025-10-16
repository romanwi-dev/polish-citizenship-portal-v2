interface CaseWorkflowData {
  workflow_type?: string;
  current_stage?: string;
  status: string;
  decision_received?: boolean;
  oby_filed?: boolean;
}

export const getWorkflowForCase = (caseData: CaseWorkflowData): string => {
  // If explicitly set, use that
  if (caseData.workflow_type) {
    return caseData.workflow_type;
  }
  
  // Otherwise, derive from current_stage and status
  const stage = caseData.current_stage?.toLowerCase() || '';
  
  // Check for specific workflow indicators
  if (stage.includes('translation') || stage.includes('translate')) {
    return 'translations';
  }
  
  if (stage.includes('archive') || stage.includes('polish doc')) {
    return 'archives';
  }
  
  if (stage.includes('civil act') || stage.includes('civil registry')) {
    return 'civil-acts';
  }
  
  if (stage.includes('passport') || caseData.decision_received) {
    return 'passport';
  }
  
  // Default to citizenship workflow (main process)
  return 'citizenship';
};

export const getWorkflowPath = (workflowType: string): string => {
  const paths: Record<string, string> = {
    'translations': '/admin/translations',
    'archives': '/admin/archives-search',
    'citizenship': '/admin/citizenship',
    'civil-acts': '/admin/civil-acts',
    'passport': '/admin/passport'
  };
  
  return paths[workflowType] || '/admin/citizenship';
};

export const getWorkflowLabel = (workflowType: string): string => {
  const labels: Record<string, string> = {
    'translations': 'Translations',
    'archives': 'Archives Search',
    'citizenship': 'Citizenship',
    'civil-acts': 'Civil Acts',
    'passport': 'Passport'
  };
  
  return labels[workflowType] || 'Citizenship';
};

