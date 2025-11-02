import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface CheckItem {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'pass' | 'fail' | 'warning';
  message?: string;
  critical: boolean;
}

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

  useEffect(() => {
    if (open) {
      runChecks();
    }
  }, [open, formData, templateType]);

  const runChecks = async () => {
    setIsRunning(true);

    // Initialize checks
    const initialChecks: CheckItem[] = [
      { id: 'polish_chars', label: 'Polish characters validation', status: 'pending', critical: true },
      { id: 'dates', label: 'Date format verification (DD.MM.YYYY)', status: 'pending', critical: true },
      { id: 'passport', label: 'Passport number match', status: 'pending', critical: true },
      { id: 'mandatory_fields', label: 'All mandatory fields filled', status: 'pending', critical: true },
      { id: 'name_consistency', label: 'Name consistency across forms', status: 'pending', critical: false },
      { id: 'address_format', label: 'Address format validation', status: 'pending', critical: false },
    ];

    setChecks(initialChecks);

    try {
      // Call AI validation edge function
      const { data, error } = await supabase.functions.invoke('ai-validate-form', {
        body: { formData, templateType, checkType: 'pre-print' },
      });

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

    } catch (error) {
      console.error('Pre-print check failed:', error);
      // On error, mark all as warning (fail open)
      setChecks(prev => prev.map(c => ({ ...c, status: 'warning', message: 'Check unavailable' })));
      setAllCriticalPassed(true);
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
            Pre-Print Verification
            {isRunning && <Loader2 className="h-5 w-5 animate-spin" />}
          </AlertDialogTitle>
          <AlertDialogDescription>
            AI is verifying your document to ensure zero mistakes before printing.
          </AlertDialogDescription>
        </AlertDialogHeader>

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
