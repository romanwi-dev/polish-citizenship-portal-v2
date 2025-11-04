import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteArchivedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: Array<{ category: string; cases: number; documents: number }>;
  totalCases: number;
  totalDocuments: number;
  backupCreated: boolean;
}

export function DeleteArchivedDialog({
  open,
  onOpenChange,
  stats,
  totalCases,
  totalDocuments,
  backupCreated
}: DeleteArchivedDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmation !== "DELETE ARCHIVED") {
      toast.error("Please type the exact confirmation phrase");
      return;
    }

    setIsDeleting(true);
    try {
      const categories = stats.map(s => s.category);
      
      const { data, error } = await supabase.functions.invoke('delete-archived-categories', {
        body: { dryRun: false, categories }
      });

      if (error) throw error;

      toast.success('Archived categories deleted successfully', {
        description: `Removed ${data.deleted.cases} cases and ${data.deleted.documents} documents`
      });

      setConfirmation("");
      onOpenChange(false);
      
      // Reload page to refresh all stats
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete archived categories');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            DELETE {totalCases} CASES FROM ARCHIVED CATEGORIES?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-medium mb-2">This will permanently delete:</p>
              <ul className="space-y-1 text-sm">
                {stats.map(stat => (
                  <li key={stat.category}>
                    • {stat.cases} cases from <span className="font-mono">{stat.category}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-destructive/20 font-medium">
                Total: {totalCases} cases + {totalDocuments} documents
              </div>
            </div>

            {backupCreated ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
                ✅ Backup created and downloaded
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm">
                ⚠️ No backup detected - please export backup first
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <span className="font-mono font-bold">DELETE ARCHIVED</span> to confirm
              </Label>
              <Input
                id="confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="DELETE ARCHIVED"
                disabled={isDeleting}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              ⚠️ This action cannot be undone. All cases, documents, tasks, and related data will be permanently removed from the database.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setConfirmation("");
              onOpenChange(false);
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmation !== "DELETE ARCHIVED" || !backupCreated}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
