import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ScanLine, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface BulkScannerProps {
  onComplete?: () => void;
}

export function BulkDropboxScanner({ onComplete }: BulkScannerProps) {
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [scanType, setScanType] = useState<'all' | 'unprocessed_only'>('unprocessed_only');
  const queryClient = useQueryClient();

  // Fetch all cases
  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ['cases-for-bulk-scan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, client_name, client_code')
        .order('client_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Bulk scan mutation
  const bulkScanMutation = useMutation({
    mutationFn: async (caseIds: string[]) => {
      const { data, error } = await supabase.functions.invoke('dropbox-bulk-scan', {
        body: { caseIds, scanType }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Queued ${data.result.queuedForOCR} documents for OCR processing`);
      if (data.result.errors.length > 0) {
        toast.warning(`${data.result.errors.length} cases had errors`, {
          description: 'Check console for details'
        });
        console.error('Bulk scan errors:', data.result.errors);
      }
      setSelectedCases([]);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      onComplete?.();
    },
    onError: (error: Error) => {
      toast.error('Bulk scan failed', { description: error.message });
    }
  });

  const toggleCase = (caseId: string) => {
    setSelectedCases(prev =>
      prev.includes(caseId)
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const toggleAll = () => {
    if (selectedCases.length === cases?.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(cases?.map(c => c.id) || []);
    }
  };

  const handleScan = () => {
    if (selectedCases.length === 0) {
      toast.error('Please select at least one case');
      return;
    }
    bulkScanMutation.mutate(selectedCases);
  };

  if (casesLoading) {
    return (
      <Card className="glass-card p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading cases...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bulk Dropbox Scanner</h3>
          <p className="text-sm text-muted-foreground">
            Queue multiple cases for OCR processing
          </p>
        </div>
        <ScanLine className="h-6 w-6 text-primary" />
      </div>

      {/* Scan Type Selection */}
      <div className="space-y-3">
        <Label>Scan Type</Label>
        <RadioGroup value={scanType} onValueChange={(v) => setScanType(v as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unprocessed_only" id="unprocessed" />
            <Label htmlFor="unprocessed" className="font-normal cursor-pointer">
              Unprocessed only (pending/failed)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="font-normal cursor-pointer">
              All documents (reprocess everything)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Case Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Select Cases ({selectedCases.length} of {cases?.length || 0})</Label>
          <Button variant="outline" size="sm" onClick={toggleAll}>
            {selectedCases.length === cases?.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-4">
          {cases?.map((case_) => (
            <div key={case_.id} className="flex items-center space-x-2">
              <Checkbox
                id={case_.id}
                checked={selectedCases.includes(case_.id)}
                onCheckedChange={() => toggleCase(case_.id)}
              />
              <Label
                htmlFor={case_.id}
                className="font-normal cursor-pointer flex-1"
              >
                {case_.client_name} ({case_.client_code || 'No code'})
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={handleScan}
        disabled={selectedCases.length === 0 || bulkScanMutation.isPending}
        className="w-full"
      >
        {bulkScanMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Queue {selectedCases.length} Case{selectedCases.length !== 1 ? 's' : ''} for OCR
          </>
        )}
      </Button>
    </Card>
  );
}
