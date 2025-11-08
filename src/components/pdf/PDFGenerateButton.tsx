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
      <div className="flex gap-2">
        <Button
          onClick={() => setPreviewOpen(true)}
          variant="outline"
          disabled={disabled}
          className="flex-shrink-0"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button
          onClick={onGenerate}
          disabled={disabled}
          className="flex-1"
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
