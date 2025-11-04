import { supabase } from "@/integrations/supabase/client";

/**
 * Logs AI processing of PII data for audit trail compliance
 */

interface LogPIIProcessingParams {
  caseId: string;
  documentId?: string;
  operationType: 'ocr' | 'classification' | 'verification' | 'form_population';
  piiFieldsSent: string[];
  aiProvider: 'openai' | 'gemini' | 'lovable-ai';
}

/**
 * Log that PII data was sent to an AI provider
 * Creates audit trail for GDPR/CCPA compliance
 */
export async function logPIIProcessing(params: LogPIIProcessingParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('ai_pii_processing_logs')
      .insert({
        case_id: params.caseId,
        document_id: params.documentId,
        operation_type: params.operationType,
        pii_fields_sent: params.piiFieldsSent,
        ai_provider: params.aiProvider,
        user_id: user?.id,
      });

    if (error) {
      console.error('Failed to log PII processing:', error);
      // Don't throw - logging failure shouldn't break the workflow
    }
  } catch (error) {
    console.error('Error in logPIIProcessing:', error);
    // Don't throw - logging failure shouldn't break the workflow
  }
}

/**
 * Check if user has given consent for AI processing
 */
export async function checkAIConsent(caseId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('ai_processing_consent')
      .eq('id', caseId)
      .single();

    if (error) {
      console.error('Error checking AI consent:', error);
      return false;
    }

    return data?.ai_processing_consent === true;
  } catch (error) {
    console.error('Error in checkAIConsent:', error);
    return false;
  }
}

/**
 * Data minimization: extract only required fields for AI
 * Prevents sending unnecessary PII
 */
export function minimizePIIForAI<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): Partial<T> {
  const minimized: Partial<T> = {};
  
  for (const field of requiredFields) {
    if (data[field] !== undefined && data[field] !== null) {
      minimized[field] = data[field];
    }
  }
  
  return minimized;
}
