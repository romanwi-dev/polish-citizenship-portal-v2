import { useState } from "react";
import { Button } from "@/components/ui/button";
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

  const handlePreviewClick = () => {
    console.log('[PDFGenerateButton] Preview clicked:', { caseId, templateType, disabled });
    setPreviewOpen(true);
  };

  return (
    <>
      <Button
        onClick={handlePreviewClick}
        variant="outline"
        disabled={disabled}
        className="px-6 py-6 md:py-2 text-sm md:text-base font-bold flex-1 bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/40"
      >
        <span className="text-purple-100 font-bold whitespace-nowrap">Preview</span>
      </Button>
      <Button
        onClick={onGenerate}
        disabled={disabled}
        className="px-6 py-6 md:py-2 text-sm md:text-base font-bold flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
      >
        {children}
      </Button>

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
