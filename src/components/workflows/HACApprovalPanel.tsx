import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface HACApprovalItem {
  id: string;
  label: string;
  aiSuggestion?: string;
  confidence?: number;
  status?: 'pending' | 'approved' | 'rejected';
  details?: string;
}

interface HACApprovalPanelProps {
  title: string;
  description: string;
  items: HACApprovalItem[];
  onApprove: (itemIds: string[], notes?: string) => Promise<void>;
  onReject: (itemIds: string[], reason: string) => Promise<void>;
  allowBatchApprove?: boolean;
  confidenceThreshold?: number;
}

export function HACApprovalPanel({
  title,
  description,
  items,
  onApprove,
  onReject,
  allowBatchApprove = true,
  confidenceThreshold = 90
}: HACApprovalPanelProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(items.map(i => i.id)));
  };

  const selectHighConfidence = () => {
    const highConfidenceItems = items.filter(i => 
      i.confidence !== undefined && i.confidence >= confidenceThreshold
    );
    setSelectedItems(new Set(highConfidenceItems.map(i => i.id)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleApprove = async () => {
    if (selectedItems.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onApprove(Array.from(selectedItems), notes);
      setSelectedItems(new Set());
      setNotes("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (selectedItems.size === 0) return;
    if (!notes.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    
    setIsProcessing(true);
    try {
      await onReject(Array.from(selectedItems), notes);
      setSelectedItems(new Set());
      setNotes("");
    } finally {
      setIsProcessing(false);
    }
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (confidence === undefined) return null;
    
    let variant: "default" | "secondary" | "destructive" = "default";
    let color = "text-success";
    
    if (confidence < 70) {
      variant = "destructive";
      color = "text-destructive";
    } else if (confidence < 90) {
      variant = "secondary";
      color = "text-warning";
    }
    
    return (
      <Badge variant={variant} className={cn("font-mono", color)}>
        {confidence}% confidence
      </Badge>
    );
  };

  const pendingItems = items.filter(i => !i.status || i.status === 'pending');
  const approvedItems = items.filter(i => i.status === 'approved');
  const rejectedItems = items.filter(i => i.status === 'rejected');

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">
              {pendingItems.length} pending
            </Badge>
            <Badge variant="default" className="bg-success">
              {approvedItems.length} approved
            </Badge>
            {rejectedItems.length > 0 && (
              <Badge variant="destructive">
                {rejectedItems.length} rejected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Batch Actions */}
        {allowBatchApprove && pendingItems.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={selectHighConfidence}
            >
              Select High Confidence (&gt;{confidenceThreshold}%)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={selectedItems.size === 0}
            >
              Clear ({selectedItems.size})
            </Button>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3">
          {pendingItems.map((item) => {
            const isSelected = selectedItems.has(item.id);
            
            return (
              <div
                key={item.id}
                className={cn(
                  "border rounded-lg p-4 transition-all cursor-pointer",
                  isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                )}
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItem(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{item.label}</span>
                      {getConfidenceBadge(item.confidence)}
                    </div>
                    {item.aiSuggestion && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">AI Suggestion:</span>{" "}
                        <span className="font-mono text-primary">{item.aiSuggestion}</span>
                      </div>
                    )}
                    {item.details && (
                      <p className="text-sm text-muted-foreground">{item.details}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {pendingItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
            <p>All items have been reviewed</p>
          </div>
        )}

        {/* Notes/Reason Input */}
        {selectedItems.size > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium">
              Notes {selectedItems.size > 0 && "(optional)"}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes or reason for changes..."
              rows={3}
            />
          </div>
        )}

        {/* Action Buttons */}
        {selectedItems.size > 0 && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve ({selectedItems.size})
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject ({selectedItems.size})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
