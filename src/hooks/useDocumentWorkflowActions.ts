import { useState } from "react";
import { toast } from "sonner";
import { detectDevice } from "@/utils/deviceDetection";
import { supabase } from "@/integrations/supabase/client";

interface UseDocumentWorkflowActionsProps {
  caseId?: string;
}

export function useDocumentWorkflowActions({ caseId }: UseDocumentWorkflowActionsProps = {}) {
  const [isPrePrintChecklistOpen, setIsPrePrintChecklistOpen] = useState(false);
  const [formDataForChecklist, setFormDataForChecklist] = useState<any>(null);

  const handlePlatformDownload = (blob: Blob, filename: string, isEditable: boolean) => {
    const device = detectDevice();
    
    if (device.isIOS) {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.info("PDF opened in new tab. Tap Share icon → Save to Files", { duration: 5000 });
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } else {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(
        isEditable 
          ? "Editable PDF downloaded - fill in Adobe Acrobat" 
          : "Final PDF downloaded (locked fields)"
      );
    }
  };

  const downloadEditableDocument = async (
    previewUrl: string, 
    documentName: string,
    documentId?: string
  ) => {
    try {
      const loadingToast = toast.loading(`Downloading ${documentName}...`);
      
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      
      toast.dismiss(loadingToast);
      handlePlatformDownload(blob, documentName, true);
      
      // Update document status if applicable
      if (documentId) {
        await supabase
          .from('documents')
          .update({ 
            pdf_status: 'generated',
            status_updated_at: new Date().toISOString()
          })
          .eq('id', documentId);
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Failed to download: ${error.message}`);
    }
  };

  const downloadFinalDocument = async (
    previewUrl: string,
    documentName: string,
    requiresChecklist: boolean = false,
    documentId?: string
  ) => {
    if (requiresChecklist && caseId) {
      // Fetch form data for AI checklist
      const { data: masterData } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      if (masterData) {
        setFormDataForChecklist({ ...masterData, documentName, previewUrl, documentId });
        setIsPrePrintChecklistOpen(true);
      } else {
        // No form data, just download
        await downloadEditableDocument(previewUrl, documentName, documentId);
      }
    } else {
      // No checklist needed, download final
      try {
        const loadingToast = toast.loading(`Downloading final ${documentName}...`);
        
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        
        toast.dismiss(loadingToast);
        handlePlatformDownload(blob, documentName, false);
        
        // Update document status to final/printed
        if (documentId) {
          await supabase
            .from('documents')
            .update({ 
              pdf_status: 'printed',
              status_updated_at: new Date().toISOString()
            })
            .eq('id', documentId);
        }
      } catch (error: any) {
        console.error('Download error:', error);
        toast.error(`Failed to download: ${error.message}`);
      }
    }
  };

  const handleChecklistProceed = async () => {
    if (formDataForChecklist) {
      await downloadEditableDocument(
        formDataForChecklist.previewUrl,
        formDataForChecklist.documentName,
        formDataForChecklist.documentId
      );
      setIsPrePrintChecklistOpen(false);
      setFormDataForChecklist(null);
    }
  };

  return {
    downloadEditableDocument,
    downloadFinalDocument,
    handlePlatformDownload,
    isPrePrintChecklistOpen,
    setIsPrePrintChecklistOpen,
    formDataForChecklist,
    handleChecklistProceed,
  };
}
