import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ValidationError {
  field: string;
  error: string;
  suggestion?: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface AIValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  corrections: Array<{ field: string; original: string; corrected: string }>;
  isValidating: boolean;
}

/**
 * Phase 1.1: AI-Powered Pre-Validation
 * Validates form data using AI before PDF generation
 */
export function useAIPreValidation(
  formData: Record<string, any>,
  templateType: string,
  enabled: boolean = true
) {
  const [result, setResult] = useState<AIValidationResult>({
    isValid: true,
    errors: [],
    corrections: [],
    isValidating: false,
  });

  useEffect(() => {
    if (!enabled || !formData || Object.keys(formData).length === 0) {
      return;
    }

    const validate = async () => {
      setResult(prev => ({ ...prev, isValidating: true }));

      try {
        const { data, error } = await supabase.functions.invoke('ai-validate-form', {
          body: { formData, templateType },
        });

        if (error) throw error;

        setResult({
          isValid: data.isValid,
          errors: data.errors || [],
          corrections: data.corrections || [],
          isValidating: false,
        });
      } catch (error) {
        console.error('AI validation error:', error);
        setResult({
          isValid: true, // Fail open - don't block if AI validation fails
          errors: [],
          corrections: [],
          isValidating: false,
        });
      }
    };

    // Debounce validation (run 2 seconds after last change)
    const timer = setTimeout(validate, 2000);
    return () => clearTimeout(timer);
  }, [formData, templateType, enabled]);

  return result;
}
