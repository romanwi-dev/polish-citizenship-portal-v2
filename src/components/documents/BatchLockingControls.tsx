/**
 * Batch Document Locking Controls
 * PHASE B - TASK 7: Batch locking for multiple documents
 */

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BatchLockingControlsProps {
  documents: Array<{
    id: string;
    name: string;
    locked_by?: string | null;
  }>;
  onLockUpdate: () => void;
}

export function BatchLockingControls({ documents, onLockUpdate }: BatchLockingControlsProps) {
  const { toast } = useToast();
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isLocking, setIsLocking] = useState(false);

  const toggleDocument = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAll = () => {
    setSelectedDocs(documents.map(d => d.id));
  };

  const deselectAll = () => {
    setSelectedDocs([]);
  };

  const lockSelected = async () => {
    if (selectedDocs.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select documents to lock",
        variant: "destructive",
      });
      return;
    }

    setIsLocking(true);
    const workerId = `batch_lock_${Date.now()}`;
    const results = [];

    for (const docId of selectedDocs) {
      try {
        const { data, error } = await supabase.rpc('acquire_document_lock_v7', {
          p_document_id: docId,
          p_worker_id: workerId,
          p_lock_timeout: 300,
        });

        const result = data as any;
        results.push({
          docId,
          success: result?.success || false,
          reason: result?.reason,
        });
      } catch (error) {
        results.push({
          docId,
          success: false,
          reason: String(error),
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    toast({
      title: `Batch Lock Complete`,
      description: `${successCount} locked, ${failCount} failed`,
      variant: failCount === 0 ? "default" : "destructive",
    });

    setIsLocking(false);
    setSelectedDocs([]);
    onLockUpdate();
  };

  const unlockSelected = async () => {
    if (selectedDocs.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select documents to unlock",
        variant: "destructive",
      });
      return;
    }

    setIsLocking(true);
    const results = [];

    for (const docId of selectedDocs) {
      try {
        const { data, error } = await supabase.rpc('release_document_lock_v7', {
          p_document_id: docId,
        });

        const result = data as any;
        results.push({
          docId,
          success: result?.success || false,
          reason: result?.reason,
        });
      } catch (error) {
        results.push({
          docId,
          success: false,
          reason: String(error),
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    toast({
      title: `Batch Unlock Complete`,
      description: `${successCount} unlocked, ${failCount} failed`,
    });

    setIsLocking(false);
    setSelectedDocs([]);
    onLockUpdate();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={selectAll}>
          Select All
        </Button>
        <Button size="sm" variant="outline" onClick={deselectAll}>
          Deselect All
        </Button>
        <Badge variant="secondary">{selectedDocs.length} selected</Badge>
        
        <div className="flex-1" />
        
        <Button
          size="sm"
          onClick={lockSelected}
          disabled={isLocking || selectedDocs.length === 0}
        >
          {isLocking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
          Lock Selected
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={unlockSelected}
          disabled={isLocking || selectedDocs.length === 0}
        >
          {isLocking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
          Unlock Selected
        </Button>
      </div>

      {/* Document List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              selectedDocs.includes(doc.id) ? 'bg-muted border-primary' : 'bg-card'
            }`}
          >
            <Checkbox
              checked={selectedDocs.includes(doc.id)}
              onCheckedChange={() => toggleDocument(doc.id)}
            />
            <div className="flex-1">
              <div className="font-medium text-sm">{doc.name}</div>
              {doc.locked_by && (
                <div className="text-xs text-muted-foreground">
                  Locked by: {doc.locked_by}
                </div>
              )}
            </div>
            {doc.locked_by ? (
              <Badge variant="destructive">Locked</Badge>
            ) : (
              <Badge variant="outline">Available</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
