import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Check, X, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CheckItem {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'pass' | 'fail' | 'warning';
  message?: string;
  critical: boolean;
}

// Fallback client-side validation rules
const validateDateFormat = (date: string): boolean => {
  if (!date) return false;
  const regex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19|20)\d{2}$/;
  if (!regex.test(date)) return false;
  const [, , year] = date.split('.').map(Number);
  if (year > 2030) return false;
  return true;
};

const validatePolishPassport = (passport: string): boolean => {
  if (!passport) return false;
  const regex = /^[A-Z]{2}[0-9]{7}$/;
  return regex.test(passport);
};

const runFallbackValidation = (formData: any): Partial<Record<string, { passed: boolean; message: string; critical: boolean }>> => {
  const checks: any = {};
  
  // Check dates
  const dateFields = ['applicant_birth_date', 'father_birth_date', 'mother_birth_date', 'spouse_birth_date'];
  const invalidDates = dateFields.filter(field => formData[field] && !validateDateFormat(formData[field]));
  checks.dates = {
    passed: invalidDates.length === 0,
    message: invalidDates.length > 0 ? `Invalid dates: ${invalidDates.join(', ')}` : 'All dates valid',
    critical: true
  };
  
  // Check passport
  if (formData.applicant_passport_number) {
    const isValid = validatePolishPassport(formData.applicant_passport_number);
    checks.passport = {
      passed: isValid,
      message: isValid ? 'Passport format valid' : 'Invalid passport format (expected: AA1234567)',
      critical: true
    };
  }
  
  // Check mandatory fields
  const mandatoryFields = ['applicant_first_name', 'applicant_last_name', 'applicant_birth_date'];
  const missingFields = mandatoryFields.filter(field => !formData[field]);
  checks.mandatory_fields = {
    passed: missingFields.length === 0,
    message: missingFields.length > 0 ? `Missing: ${missingFields.join(', ')}` : 'All mandatory fields present',
    critical: true
  };
  
  return checks;
};

interface PrePrintChecklistProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
  formData: Record<string, any>;
  templateType: string;
}

/**
 * Phase 4.1: Pre-Print Checklist (Mandatory)
 * AI-verifies critical fields before printing
 */
export function PrePrintChecklist({
  open,
  onClose,
  onProceed,
  formData,
  templateType,
}: PrePrintChecklistProps) {
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [allCriticalPassed, setAllCriticalPassed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (open) {
      runChecks();
    }
  }, [open, formData, templateType]);

  const runChecks = async () => {
    setIsRunning(true);
    setProgress(0);
    setUsingFallback(false);

    // Initialize checks
    const initialChecks: CheckItem[] = [
      { id: 'polish_chars', label: 'Polish characters validation', status: 'checking', critical: true },
      { id: 'dates', label: 'Date format verification (DD.MM.YYYY)', status: 'checking', critical: true },
      { id: 'passport', label: 'Passport number match', status: 'checking', critical: true },
      { id: 'mandatory_fields', label: 'All mandatory fields filled', status: 'checking', critical: true },
      { id: 'name_consistency', label: 'Name consistency across forms', status: 'checking', critical: false },
      { id: 'address_format', label: 'Address format validation', status: 'checking', critical: false },
      { id: 'cross_field_relationships', label: 'Cross-field relationships', status: 'checking', critical: false },
    ];

    setChecks(initialChecks);
    toast.info('Running AI validation... (~3 seconds)', { duration: 3000 });

    try {
      setProgress(25);
      
      // Call AI validation edge function
      const { data, error } = await supabase.functions.invoke('ai-validate-form', {
        body: { formData, templateType, checkType: 'pre-print' },
      });

      setProgress(75);

      if (error) throw error;

      // Update checks based on AI response
      const updatedChecks: CheckItem[] = initialChecks.map(check => {
        const aiResult = data.checks?.[check.id];
        if (aiResult) {
          const status: CheckItem['status'] = aiResult.passed ? 'pass' : aiResult.critical ? 'fail' : 'warning';
          return {
            ...check,
            status,
            message: aiResult.message,
          };
        }
        return { ...check, status: 'pass' as const };
      });

      setChecks(updatedChecks);

      // Check if all critical checks passed
      const criticalPassed = updatedChecks
        .filter(c => c.critical)
        .every(c => c.status === 'pass');
      
      setAllCriticalPassed(criticalPassed);
      setProgress(100);

    } catch (error) {
      console.error('Pre-print check failed:', error);
      toast.warning('AI validation unavailable. Using basic checks only.');
      setUsingFallback(true);
      
      // Run fallback client-side validation
      const fallbackChecks = runFallbackValidation(formData);
      
      const updatedChecks: CheckItem[] = initialChecks.map(check => {
        const fallbackResult = fallbackChecks[check.id];
        if (!fallbackResult) {
          return { ...check, status: 'warning' as const, message: 'Not checked (AI unavailable)' };
        }
        
        const status: CheckItem['status'] = fallbackResult.passed ? 'pass' : (check.critical ? 'fail' : 'warning');
        return {
          ...check,
          status,
          message: fallbackResult.message
        };
      });
      
      setChecks(updatedChecks);
      
      const criticalChecksFailed = Object.values(fallbackChecks)
        .filter((check: any) => check.critical && !check.passed).length > 0;
      
      setAllCriticalPassed(!criticalChecksFailed);
      setProgress(100);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: CheckItem['status']) => {
    switch (status) {
      case 'checking':
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'pass':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <X className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const criticalFailed = checks.some(c => c.critical && c.status === 'fail');

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Pre-Print Verification
            {usingFallback && (
              <span className="text-xs font-normal text-yellow-600">(Limited validation only)</span>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {usingFallback 
              ? 'Running basic client-side validation checks.'
              : 'AI-powered validation to ensure zero mistakes before printing.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {isRunning && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Validation progress...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3 py-4">
          {checks.map(check => (
            <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="mt-0.5">{getStatusIcon(check.status)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{check.label}</span>
                  {check.critical && (
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  )}
                </div>
                {check.message && (
                  <p className="text-sm text-muted-foreground mt-1">{check.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {criticalFailed ? (
            <Button variant="destructive" disabled>
              <X className="h-4 w-4 mr-2" />
              Cannot Proceed - Fix Errors
            </Button>
          ) : (
            <Button onClick={onProceed} disabled={isRunning || !allCriticalPassed}>
              <Check className="h-4 w-4 mr-2" />
              Proceed to Print
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
