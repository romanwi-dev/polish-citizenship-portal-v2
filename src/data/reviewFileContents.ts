// Build-time imports of files for code review
// NOTE: Vite's ?raw imports only work reliably for files within src/ directory
// Edge functions are analyzed separately via direct file reads

import AIDocumentWorkflow from '@/components/workflows/AIDocumentWorkflow.tsx?raw';
import supabaseTypes from '@/integrations/supabase/types.ts?raw';
import CaseCard from '@/components/CaseCard.tsx?raw';
import Dashboard from '@/pages/Dashboard.tsx?raw';
import IntakeForm from '@/components/IntakeForm.tsx?raw';
import POAForm from '@/components/POAForm.tsx?raw';
import supabaseClient from '@/integrations/supabase/client.ts?raw';

/**
 * Map of file paths to their raw string content
 * These are imported at build time using Vite's ?raw feature
 * Only includes src/ files since Vite cannot reliably import from outside src/
 */
export const fileContents: Record<string, string> = {
  'src/components/workflows/AIDocumentWorkflow.tsx': AIDocumentWorkflow,
  'src/integrations/supabase/types.ts': supabaseTypes,
  'src/components/CaseCard.tsx': CaseCard,
  'src/pages/Dashboard.tsx': Dashboard,
  'src/components/IntakeForm.tsx': IntakeForm,
  'src/components/POAForm.tsx': POAForm,
  'src/integrations/supabase/client.ts': supabaseClient,
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
  
  // For edge functions, return a placeholder since Vite can't import them with ?raw
  if (path.startsWith('supabase/functions/')) {
    const functionName = path.split('/')[2];
    return `// Edge Function: ${functionName}
// Note: Edge function code cannot be imported at build-time with Vite
// This file exists at: ${path}
// GPT-5: Please analyze based on the function name and typical edge function patterns
// Function: ${functionName}
// Location: ${path}
// Type: Supabase Edge Function (Deno runtime)
// Expected patterns: CORS headers, async handlers, Supabase client usage, error handling`;
  }
  
  console.error(`File not found in build-time imports: ${path}`);
  return `// ERROR: File not found\n// Path: ${path}\n// Available: ${Object.keys(fileContents).join(', ')}`;
};
