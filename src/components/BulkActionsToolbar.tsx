import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckSquare, X, Archive, Trash2, Download, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: string) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onBulkExport: () => void;
}

export const BulkActionsToolbar = ({
  selectedCount,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkDelete,
  onBulkExport,
}: BulkActionsToolbarProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = async (action: () => Promise<void>, successMessage: string) => {
    setIsProcessing(true);
    try {
      await action();
      toast.success(successMessage);
      onClearSelection();
    } catch (error) {
      toast.error("Action failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
        <div className="bg-card border-2 border-primary/20 rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="font-mono">
              {selectedCount} selected
            </Badge>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    className="h-8"
                  >
                    <Send className="mr-2 h-3.5 w-3.5" />
                    Change Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleBulkAction(
                    () => onBulkStatusUpdate("active"),
                    "Cases updated to active"
                  )}>
                    Set as Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction(
                    () => onBulkStatusUpdate("on_hold"),
                    "Cases put on hold"
                  )}>
                    Put On Hold
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction(
                    () => onBulkStatusUpdate("lead"),
                    "Cases moved to lead"
                  )}>
                    Move to Lead
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction(
                    () => onBulkStatusUpdate("suspended"),
                    "Cases suspended"
                  )}>
                    Suspend Cases
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction(
                    () => onBulkStatusUpdate("finished"),
                    "Cases marked as finished"
                  )}>
                    <Archive className="mr-2 h-4 w-4" />
                    Mark as Finished
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={onBulkExport}
                disabled={isProcessing}
                className="h-8"
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isProcessing}
                className="h-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={isProcessing}
                className="h-8"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} cases?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected cases
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                handleBulkAction(onBulkDelete, `${selectedCount} cases deleted`);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
