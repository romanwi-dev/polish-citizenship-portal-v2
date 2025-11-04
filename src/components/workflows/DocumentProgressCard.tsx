import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, Download, FileText, ScanLine, Sparkles, SkipForward } from "lucide-react";
import { DocumentProgress, DocumentStatus } from "@/hooks/useDocumentProgress";

interface DocumentProgressCardProps {
  document: DocumentProgress;
  onClick?: () => void;
}

const statusConfig: Record<DocumentStatus, { icon: React.ReactNode; label: string; color: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, label: "Pending", color: "text-muted-foreground" },
  downloading: { icon: <Download className="h-4 w-4 animate-pulse" />, label: "Downloading", color: "text-blue-500" },
  encoding: { icon: <FileText className="h-4 w-4 animate-pulse" />, label: "Encoding", color: "text-blue-500" },
  classifying: { icon: <Sparkles className="h-4 w-4 animate-pulse" />, label: "Classifying", color: "text-purple-500" },
  ocr: { icon: <ScanLine className="h-4 w-4 animate-pulse" />, label: "OCR Processing", color: "text-indigo-500" },
  completed: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Completed", color: "text-green-500" },
  failed: { icon: <XCircle className="h-4 w-4" />, label: "Failed", color: "text-destructive" },
  skipped: { icon: <SkipForward className="h-4 w-4" />, label: "Skipped", color: "text-yellow-500" },
};

export function DocumentProgressCard({ document, onClick }: DocumentProgressCardProps) {
  const config = statusConfig[document.status];

  return (
    <Card 
      className={`p-4 space-y-2 ${onClick ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={config.color}>{config.icon}</span>
          <span className="text-sm font-medium truncate">{document.name}</span>
        </div>
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
      
      {document.status !== 'pending' && document.status !== 'completed' && (
        <Progress value={document.progress} className="h-1" />
      )}
      
      {document.error && (
        <p className="text-xs text-destructive">{document.error}</p>
      )}
      
      {document.completedAt && (
        <p className="text-xs text-muted-foreground">
          {new Date(document.completedAt).toLocaleTimeString()}
        </p>
      )}
    </Card>
  );
}
