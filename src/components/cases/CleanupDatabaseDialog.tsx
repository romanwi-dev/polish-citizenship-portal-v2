import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CleanupDatabaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrphanCase {
  id: string;
  name: string;
  code: string;
  dropbox_path: string | null;
  status: string;
  created_at: string;
}

export function CleanupDatabaseDialog({ open, onOpenChange }: CleanupDatabaseDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'preview' | 'confirm'>('preview');
  const [loading, setLoading] = useState(false);
  const [orphanCases, setOrphanCases] = useState<OrphanCase[]>([]);
  const [confirmText, setConfirmText] = useState("");

  const loadPreview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-orphan-cases', {
        body: { dryRun: true }
      });

      if (error) throw error;

      if (data.success) {
        setOrphanCases(data.cases_to_delete || []);
        toast({
          title: "Preview Loaded",
          description: `Found ${data.orphan_count} cases to delete`,
        });
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast({
        title: "Error",
        description: "Failed to load preview",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const executeCleanup = async () => {
    if (confirmText !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE' to confirm",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-orphan-cases', {
        body: { dryRun: false }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Database Cleaned",
          description: `Successfully deleted ${data.deleted_count} cases`,
        });
        onOpenChange(false);
        setStep('preview');
        setConfirmText("");
        // Refresh the page to show updated case list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error executing cleanup:', error);
      toast({
        title: "Error",
        description: "Failed to execute cleanup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setStep('preview');
      setConfirmText("");
      loadPreview();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Clean Database
          </DialogTitle>
          <DialogDescription>
            {step === 'preview' 
              ? "Remove cases that don't have folders in the 7 Dropbox categories"
              : "This action cannot be undone. All related data will be permanently deleted."}
          </DialogDescription>
        </DialogHeader>

        {step === 'preview' && (
          <>
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium">
                  {orphanCases.length} cases will be permanently deleted
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  These cases don't have valid Dropbox folders in: POTENTIAL, VIP+, VIP, CITIZENS-X, GLOBAL-P, FOURTH, or FIFTH
                </p>
              </div>

              <ScrollArea className="h-[300px] border rounded-lg p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : orphanCases.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    No orphan cases found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orphanCases.map((case_) => (
                      <div key={case_.id} className="p-2 border rounded text-sm">
                        <div className="font-medium">{case_.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Code: {case_.code || 'N/A'} | Path: {case_.dropbox_path || 'None'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setStep('confirm')}
                disabled={orphanCases.length === 0 || loading}
              >
                Continue to Confirm
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="font-medium text-destructive mb-2">⚠️ Final Confirmation</p>
                <p className="text-sm">
                  You are about to delete <strong>{orphanCases.length} cases</strong> and all their related data:
                </p>
                <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>Documents</li>
                  <li>Tasks</li>
                  <li>Forms (Intake, POA, OBY)</li>
                  <li>Messages</li>
                  <li>Archive searches</li>
                  <li>All other related data</li>
                </ul>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type <code className="bg-muted px-2 py-1 rounded">DELETE</code> to confirm:
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="font-mono"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('preview')}>
                Back
              </Button>
              <Button 
                variant="destructive" 
                onClick={executeCleanup}
                disabled={confirmText !== 'DELETE' || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {orphanCases.length} Cases
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
