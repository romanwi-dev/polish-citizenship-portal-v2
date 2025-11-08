import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateSimplePDF } from "@/lib/pdf-simple";
import { toast } from "sonner";

interface PDFGenerateButtonProps {
  caseId: string;
  templateType: string;
  onGenerate: (url: string) => void;
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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    console.log('[PDFGenerateButton] Generate clicked:', { caseId, templateType });
    
    const url = await generateSimplePDF({
      caseId,
      templateType,
      toast,
      setIsGenerating
    });

    if (url) {
      // Pass URL to parent component - do NOT open directly
      onGenerate(url);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className="px-6 py-6 md:py-2 text-sm md:text-base font-bold flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
    >
      {children}
    </Button>
  );
}
