import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["Ctrl", "N"], description: "Create new case" },
  { keys: ["Ctrl", "K"], description: "Focus search" },
  { keys: ["Ctrl", "R"], description: "Refresh cases" },
  { keys: ["Ctrl", "X"], description: "Clear all filters" },
  { keys: ["Shift", "?"], description: "Show this dialog" },
  { keys: ["Esc"], description: "Close dialogs" },
];

export const KeyboardShortcutsDialog = ({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Speed up your workflow with these shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex gap-1">
                {shortcut.keys.map((key) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="font-mono text-xs px-2 py-1"
                  >
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground pt-4 border-t border-border">
          Press <Badge variant="outline" className="font-mono text-xs mx-1">Esc</Badge> to close
        </div>
      </DialogContent>
    </Dialog>
  );
};
