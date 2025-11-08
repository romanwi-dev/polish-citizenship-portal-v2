import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { PDFPreviewDialog } from "@/components/pdf/PDFPreviewDialog";

interface PDFGenerateButtonProps {
  caseId: string;
  templateType: string;
  onGenerate: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function PDFGenerateButton({ 
  caseId, 
  templateType, 
  onGenerate,
  disabled,
  children
}: PDFGenerateButtonProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2 w-full">
        <Button
          onClick={() => setPreviewOpen(true)}
          variant="outline"
          disabled={disabled}
          className="flex-shrink-0 bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/40"
        >
          <Eye className="h-4 w-4 mr-2" />
          <span className="text-purple-100">Preview</span>
        </Button>
        <Button
          onClick={onGenerate}
          disabled={disabled}
          className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
        >
          {children}
        </Button>
      </div>

      <PDFPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        caseId={caseId}
        templateType={templateType}
        onGenerate={onGenerate}
      />
    </>
  );
}
