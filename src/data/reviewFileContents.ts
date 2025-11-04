// Build-time imports of all files for code review
// Vite's ?raw suffix imports files as string literals at compile time

import AIDocumentWorkflow from '@/components/workflows/AIDocumentWorkflow.tsx?raw';
import aiClassifyDocument from '../../supabase/functions/ai-classify-document/index.ts?raw';
import aiVerifyForms from '../../supabase/functions/ai-verify-forms/index.ts?raw';
import aiOcrPassport from '../../supabase/functions/ai-ocr-passport/index.ts?raw';
import aiSuggestTasks from '../../supabase/functions/ai-suggest-tasks/index.ts?raw';
import supabaseTypes from '@/integrations/supabase/types.ts?raw';
import CaseCard from '@/components/CaseCard.tsx?raw';
import Dashboard from '@/pages/Dashboard.tsx?raw';
import IntakeForm from '@/components/IntakeForm.tsx?raw';
import POAForm from '@/components/POAForm.tsx?raw';
import generatePoaPdf from '../../supabase/functions/generate-poa-pdf/index.ts?raw';
import generateObyPdf from '../../supabase/functions/generate-oby-pdf/index.ts?raw';
import supabaseClient from '@/integrations/supabase/client.ts?raw';

/**
 * Map of file paths to their raw string content
 * These are imported at build time using Vite's ?raw feature
 * No runtime file reading or network requests needed
 */
export const fileContents: Record<string, string> = {
  'src/components/workflows/AIDocumentWorkflow.tsx': AIDocumentWorkflow,
  'supabase/functions/ai-classify-document/index.ts': aiClassifyDocument,
  'supabase/functions/ai-verify-forms/index.ts': aiVerifyForms,
  'supabase/functions/ai-ocr-passport/index.ts': aiOcrPassport,
  'supabase/functions/ai-suggest-tasks/index.ts': aiSuggestTasks,
  'src/integrations/supabase/types.ts': supabaseTypes,
  'src/components/CaseCard.tsx': CaseCard,
  'src/pages/Dashboard.tsx': Dashboard,
  'src/components/IntakeForm.tsx': IntakeForm,
  'src/components/POAForm.tsx': POAForm,
  'supabase/functions/generate-poa-pdf/index.ts': generatePoaPdf,
  'supabase/functions/generate-oby-pdf/index.ts': generateObyPdf,
  'src/integrations/supabase/client.ts': supabaseClient,
};

/**
 * Get file content by path
 * @param path - The file path to lookup
 * @returns The file content as a string, or an error message if not found
 */
export const getFileContent = (path: string): string => {
  const content = fileContents[path];
  if (!content) {
    console.error(`File not found in build-time imports: ${path}`);
    return `// ERROR: File not found in reviewFileContents.ts\n// Path: ${path}\n// Available paths: ${Object.keys(fileContents).join(', ')}`;
  }
  return content;
};
