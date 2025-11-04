// Build-time imports of files for code review
// NOTE: Vite's ?raw imports only work reliably for files within src/ directory
// Edge functions are analyzed via the edge-function-analyzer edge function

import AIDocumentWorkflow from '@/components/workflows/AIDocumentWorkflow.tsx?raw';
import DocumentProgressCard from '@/components/workflows/DocumentProgressCard.tsx?raw';
import supabaseTypes from '@/integrations/supabase/types.ts?raw';
import CaseCard from '@/components/CaseCard.tsx?raw';
import AdminDashboard from '@/pages/admin/Dashboard.tsx?raw';
import IntakeForm from '@/pages/admin/IntakeForm.tsx?raw';
import POAForm from '@/pages/admin/POAForm.tsx?raw';
import supabaseClient from '@/integrations/supabase/client.ts?raw';
import aiPIILogger from '@/utils/aiPIILogger.ts?raw';
import secureLogger from '@/utils/secureLogger.ts?raw';
import useWorkflowState from '@/hooks/useWorkflowState.ts?raw';
import useDocumentProgress from '@/hooks/useDocumentProgress.ts?raw';
import useRequestBatcher from '@/hooks/useRequestBatcher.ts?raw';
import base64EncoderWorker from '@/workers/base64Encoder.worker.ts?raw';

/**
 * Map of file paths to their raw string content
 * These are imported at build time using Vite's ?raw feature
 * Only includes src/ files since Vite cannot reliably import from outside src/
 */
export const fileContents: Record<string, string> = {
  'src/components/workflows/AIDocumentWorkflow.tsx': AIDocumentWorkflow,
  'src/components/workflows/DocumentProgressCard.tsx': DocumentProgressCard,
  'src/integrations/supabase/types.ts': supabaseTypes,
  'src/components/CaseCard.tsx': CaseCard,
  'src/pages/admin/Dashboard.tsx': AdminDashboard,
  'src/pages/admin/IntakeForm.tsx': IntakeForm,
  'src/pages/admin/POAForm.tsx': POAForm,
  'src/integrations/supabase/client.ts': supabaseClient,
  'src/utils/aiPIILogger.ts': aiPIILogger,
  'src/utils/secureLogger.ts': secureLogger,
  'src/hooks/useWorkflowState.ts': useWorkflowState,
  'src/hooks/useDocumentProgress.ts': useDocumentProgress,
  'src/hooks/useRequestBatcher.ts': useRequestBatcher,
  'src/workers/base64Encoder.worker.ts': base64EncoderWorker,
};

/**
 * Get file content by path
 * @param path - The file path to lookup
 * @returns The file content as a string, or a placeholder for edge functions
 */
export const getFileContent = (path: string): string => {
  const content = fileContents[path];
  
  if (content) {
    return content;
  }
  
  // For edge functions, they will be fetched via edge-function-analyzer
  if (path.startsWith('supabase/functions/')) {
    const functionName = path.split('/')[2];
    return `// Edge Function: ${functionName}
// This file will be fetched at runtime via edge-function-analyzer
// Path: ${path}
// Function: ${functionName}
// Location: supabase/functions/${functionName}/index.ts`;
  }
  
  console.error(`File not found in build-time imports: ${path}`);
  return `// ERROR: File not found\n// Path: ${path}\n// Available: ${Object.keys(fileContents).join(', ')}`;
};
