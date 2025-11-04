import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResyncConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceedToCleanup: () => void;
}

interface ResyncResult {
  success: boolean;
  casesUpdated: number;
  documentsUpdated: number;
  casesNotFound: string[];
  message: string;
}

export function ResyncConfirmationDialog({ 
  open, 
  onOpenChange,
  onProceedToCleanup 
}: ResyncConfirmationDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      runResync();
    } else {
      // Reset state when dialog closes
      setResult(null);
      setError(null);
    }
  }, [open]);

  const runResync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('dropbox-resync', {
        body: {}
      });

      if (error) throw error;

      if (data.success) {
        setResult(data);
        toast({
          title: "Resync Complete",
          description: `Matched ${data.casesUpdated} cases to Dropbox folders`,
        });
      } else {
        throw new Error(data.message || 'Resync failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resync with Dropbox';
      setError(errorMessage);
      toast({
        title: "Resync Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCleanup = () => {
    onOpenChange(false);
    // Small delay to allow dialog to close before opening cleanup dialog
    setTimeout(() => {
      onProceedToCleanup();
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Dropbox Resync
          </DialogTitle>
          <DialogDescription>
            Matching database cases with Dropbox folders before cleanup
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Scanning Dropbox and matching cases...
              </p>
              <p className="text-xs text-muted-foreground">
                This may take 1-2 minutes
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Resync Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-500">Resync Successful</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Database is now synced with Dropbox folders
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary">{result.casesUpdated}</p>
                  <p className="text-sm text-muted-foreground">Cases Matched</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-secondary">{result.documentsUpdated}</p>
                  <p className="text-sm text-muted-foreground">Documents Updated</p>
                </div>
              </div>

              {result.casesNotFound && result.casesNotFound.length > 0 && (
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-500">
                          {result.casesNotFound.length} Unmatched Dropbox Folders
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          These folders exist in Dropbox but don't have matching cases in the database
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[140px] border rounded-lg p-4 bg-background/50">
                    <div className="space-y-2">
                      {result.casesNotFound.map((folderName, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded border text-sm font-mono"
                        >
                          <span className="text-muted-foreground">{index + 1}.</span>
                          <span className="font-medium">{folderName}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>💡 <strong>Why weren't they matched?</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-0.5">
                      <li>Surname doesn't match any client_code or client_name in database</li>
                      <li>Case might need to be created manually first</li>
                      <li>Or folder name format doesn't match expected pattern</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-sm font-medium mb-2">What's Next?</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{result.casesUpdated} cases now have valid Dropbox paths</li>
                  <li>Cases without Dropbox folders will be identified for cleanup</li>
                  <li>You can safely proceed to remove orphan cases</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {result ? 'Done' : 'Cancel'}
          </Button>
          
          {error && (
            <Button 
              onClick={runResync}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Resync
            </Button>
          )}

          {result && (
            <Button 
              onClick={handleProceedToCleanup}
              variant="destructive"
            >
              Proceed to Cleanup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
