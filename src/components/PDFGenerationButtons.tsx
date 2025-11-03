import { Button } from "@/components/ui/button";
import { Download, Eye, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { PDFPreviewDialog } from "./PDFPreviewDialog";
import { validatePDFGeneration } from "@/utils/pdfValidation";
import { detectDevice } from "@/utils/deviceDetection";
import { PrePrintChecklist } from "./PrePrintChecklist";
import { usePDFStatus } from "@/hooks/usePDFStatus";
import { PDFVerificationToggle } from "./PDFVerificationToggle";
import { generatePDFProposal } from "@/utils/pdfProposalGenerator";
import { generateInspectionReport } from "@/utils/pdfInspectionReport";

interface PDFGenerationButtonsProps {
  caseId: string;
  documentId?: string;
}

export function PDFGenerationButtons({ caseId, documentId }: PDFGenerationButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentTemplate, setCurrentTemplate] = useState({ type: "", label: "" });
  const [currentTemplateType, setCurrentTemplateType] = useState<string>('');
  const [formData, setFormData] = useState<any>(null);
  const [prePrintChecklistOpen, setPrePrintChecklistOpen] = useState(false);
  const [verificationEnabled, setVerificationEnabled] = useState(() => {
    const saved = localStorage.getItem('pdf_verification_enabled');
    return saved !== null ? JSON.parse(saved) : true; // Default: enabled
  });
  
  const { updateStatus } = usePDFStatus(documentId);

  const toggleVerification = (enabled: boolean) => {
    setVerificationEnabled(enabled);
    localStorage.setItem('pdf_verification_enabled', JSON.stringify(enabled));
  };

  const cleanupPreviewUrl = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      window.URL.revokeObjectURL(previewUrl);
    }
  };

  const handleGeneratePDF = async (templateType: string, label: string, flatten: boolean = false) => {
    try {
      setIsGenerating(true);
      const loadingToast = toast.loading(`Generating ${label}...`);

      // Fetch current form data
      const { data: masterData, error: fetchError } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Failed to fetch form data:', fetchError);
        toast.error('Failed to fetch form data');
        throw new Error('Failed to fetch form data');
      }

      // Warn if no data exists
      if (!masterData || Object.keys(masterData).length <= 2) {
        toast.warning(
          'No form data found. Save the form first, then generate PDFs.',
          { duration: 6000 }
        );
        return;
      }

      // Show informational toast if not 100% complete (never block generation)
      if (masterData) {
        const validation = validatePDFGeneration(masterData, templateType);
        
        if (validation.coverage < 100) {
          toast.info(
            `PDF generated (${validation.coverage}% complete). Remaining fields can be filled manually.`,
            { duration: 4000 }
          );
        }
      }

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType, flatten }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to generate PDF: ${error.message}`);
      }
      
      // Edge function returns binary PDF data - supabase SDK handles it as Blob already
      // Check if data is already a Blob, otherwise create one
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' });

      toast.dismiss(loadingToast);

      if (!flatten) {
        // For preview and editable download
        const url = window.URL.createObjectURL(blob);
        console.log('✅ PDF blob created:', { url, size: blob.size, type: blob.type });
        
        // Check if mobile - force download instead of preview (Safari iframe doesn't render PDFs well)
        const device = detectDevice();
        if (device.isMobile) {
          // Force download on mobile - user opens in native PDF viewer
          const link = document.createElement('a');
          link.href = url;
          link.download = `${templateType}-${caseId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.success(`${label} downloaded! Open in your Files app to view and edit.`, { duration: 5000 });
        } else {
          // Desktop - show preview dialog
          setPreviewUrl(url);
          setCurrentTemplate({ type: templateType, label });
          setCurrentTemplateType(templateType);
          setFormData(masterData);
          setPreviewOpen(true);
          toast.success(`${label} ready! Opening preview...`, { duration: 3000 });
        }
        
        // Update status: generated
        if (documentId) {
          updateStatus({ status: 'generated' });
        }
      } else {
        // For final locked download - direct download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${templateType}-${caseId}-final.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`${label} (final locked) downloaded!`);
        
        // Update status: printed
        if (documentId) {
          updateStatus({ status: 'printed' });
        }
      }
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error(`Failed to generate ${label}: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyAndGenerate = async (templateType: string, label: string) => {
    try {
      setIsGenerating(true);
      const loadingToast = toast.loading(`Analyzing data for ${label}...`);

      // Fetch current form data
      const { data: masterData, error: fetchError } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Failed to fetch form data:', fetchError);
        toast.error('Failed to fetch form data');
        throw new Error('Failed to fetch form data');
      }

      if (!masterData || Object.keys(masterData).length <= 2) {
        toast.warning('No form data found. Save the form first, then verify PDFs.', { duration: 6000 });
        return;
      }

      // Generate pre-verification proposal
      const proposal = await generatePDFProposal(caseId, templateType, masterData);
      
      toast.dismiss(loadingToast);
      toast.info('Opening verification review...');

      // Store proposal in localStorage
      localStorage.setItem('pending_proposal', JSON.stringify(proposal));
      localStorage.setItem('proposal_timestamp', new Date().toISOString());
      
      // Encode proposal for URL
      const encodedProposal = btoa(JSON.stringify(proposal));
      
      // Open verification page in new tab (or same tab)
      const verifyUrl = `/admin/verify-changes?proposal=${encodedProposal}`;
      window.open(verifyUrl, '_blank');
      
      toast.success('Verification opened! Review and approve to generate PDF.', { duration: 5000 });
      
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.dismiss();
      toast.error(`Failed to verify: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostVerifyPDF = async (blob: Blob, templateType: string, label: string) => {
    try {
      // Get the original proposal if available
      const storedProposal = localStorage.getItem('pending_proposal');
      const originalProposal = storedProposal ? JSON.parse(storedProposal) : undefined;

      // Generate post-verification inspection report
      const inspectionReport = await generateInspectionReport(
        blob,
        templateType,
        originalProposal,
        caseId
      );

      // Store report in localStorage
      localStorage.setItem('pending_proposal', JSON.stringify(inspectionReport));
      localStorage.setItem('proposal_timestamp', new Date().toISOString());
      
      // Encode report for URL
      const encodedReport = btoa(JSON.stringify(inspectionReport));
      
      // Open post-verification page
      const verifyUrl = `/admin/verify-changes?proposal=${encodedReport}`;
      window.open(verifyUrl, '_blank');
      
      toast.success('Post-generation verification opened! Review PDF quality.', { duration: 5000 });
      
      // Save verification results to database
      if (documentId) {
        await supabase
          .from('documents')
          .update({
            post_verification_result: inspectionReport as any,
            post_verification_score: inspectionReport.execution?.success ? 10 : 5,
            verification_status: inspectionReport.execution?.success ? 'verified' : 'failed',
          })
          .eq('id', documentId);
      }
      
    } catch (error: any) {
      console.error('Post-verification error:', error);
      toast.error(`Post-verification failed: ${error.message}`);
    }
  };

  const handleRegeneratePDF = async (updatedData: any) => {
    // Update master table first
    await supabase
      .from("master_table")
      .update(updatedData)
      .eq("case_id", caseId);

    // Regenerate PDF (editable)
    await handleGeneratePDF(currentTemplate.type, currentTemplate.label, false);
  };

  const handlePlatformDownload = (blob: Blob, filename: string, isEditable: boolean) => {
    const device = detectDevice();
    
    if (device.isIOS) {
      // iOS: window.open in new tab with user guidance
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.info("PDF opened in new tab. Tap the Share icon → Save to Files to download", {
        duration: 5000
      });
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } else {
      // Desktop + Android: standard download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      if (isEditable) {
        toast.success("Editable PDF downloaded - fill in Adobe Acrobat");
      } else {
        toast.success("Final PDF downloaded (locked fields)");
      }
    }
  };

  const handleDownloadEditable = async () => {
    try {
      setIsGenerating(true);
      const loadingToast = toast.loading(`Generating editable ${currentTemplate.label}...`);

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: currentTemplate.type, flatten: false }
      });

      if (error) throw new Error(`Failed to generate PDF: ${error.message}`);

      const blob = new Blob([data], { type: 'application/pdf' });
      toast.dismiss(loadingToast);
      
      handlePlatformDownload(blob, `${currentTemplate.type}-${caseId}-editable.pdf`, true);
      setPreviewOpen(false);
      cleanupPreviewUrl();
      
      // Update status: edited
      if (documentId) {
        updateStatus({ status: 'edited' });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Failed to download: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadFinal = async () => {
    if (!currentTemplateType) {
      toast.error('Template type not found. Please regenerate the PDF.');
      return;
    }
    
    // Fetch current form data for AI validation
    const { data: masterData } = await supabase
      .from("master_table")
      .select("*")
      .eq("case_id", caseId)
      .maybeSingle();

    if (!masterData) {
      toast.error("No form data found");
      return;
    }

    // Store data for PrePrintChecklist
    setFormData(masterData);
    
    // Close preview, open AI-powered pre-print checklist
    setPreviewOpen(false);
    setPrePrintChecklistOpen(true);
  };

  const handleProceedToPrint = async () => {
    try {
      setIsGenerating(true);
      const loadingToast = toast.loading(`Generating final ${currentTemplate.label}...`);

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: currentTemplate.type, flatten: true }
      });

      if (error) throw new Error(`Failed to generate PDF: ${error.message}`);

      const blob = new Blob([data], { type: 'application/pdf' });
      toast.dismiss(loadingToast);
      
      handlePlatformDownload(blob, `${currentTemplate.type}-${caseId}-final.pdf`, false);
      setPreviewOpen(false);
      cleanupPreviewUrl();
      
      // Update status: printed
      if (documentId) {
        updateStatus({ status: 'printed' });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Failed to download: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="default" 
          disabled={isGenerating}
          className="text-lg md:text-xl lg:text-2xl font-bold px-8 md:px-12 lg:px-16 h-14 md:h-16 lg:h-20 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px] md:min-w-[280px] lg:min-w-[360px] whitespace-nowrap mb-8"
        >
          <Download className="h-5 md:h-6 lg:h-7 w-5 md:w-6 lg:w-7 mr-2 md:mr-3 opacity-50" />
          <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Generate PDFs
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-background/95 backdrop-blur-sm border-primary/20 z-50">
        <div className="px-2 py-2">
          <PDFVerificationToggle
            enabled={verificationEnabled}
            onToggle={toggleVerification}
          />
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {verificationEnabled ? 'With AI Verification' : 'Direct Generation'}
        </DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => verificationEnabled 
          ? handleVerifyAndGenerate('family-tree', 'Family Tree')
          : handleGeneratePDF('family-tree', 'Family Tree', false)}>
          {verificationEnabled ? <Shield className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {verificationEnabled ? 'Verify & Preview' : 'Preview'} Family Tree
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => verificationEnabled
          ? handleVerifyAndGenerate('citizenship', 'Citizenship Application')
          : handleGeneratePDF('citizenship', 'Citizenship Application', false)}>
          {verificationEnabled ? <Shield className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {verificationEnabled ? 'Verify & Preview' : 'Preview'} Citizenship Application
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => verificationEnabled
          ? handleVerifyAndGenerate('poa-adult', 'POA - Adult')
          : handleGeneratePDF('poa-adult', 'POA - Adult', false)}>
          {verificationEnabled ? <Shield className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {verificationEnabled ? 'Verify & Preview' : 'Preview'} POA - Adult
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => verificationEnabled
          ? handleVerifyAndGenerate('poa-minor', 'POA - Minor')
          : handleGeneratePDF('poa-minor', 'POA - Minor', false)}>
          {verificationEnabled ? <Shield className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {verificationEnabled ? 'Verify & Preview' : 'Preview'} POA - Minor
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => verificationEnabled
          ? handleVerifyAndGenerate('poa-spouses', 'POA - Spouses')
          : handleGeneratePDF('poa-spouses', 'POA - Spouses', false)}>
          {verificationEnabled ? <Shield className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {verificationEnabled ? 'Verify & Preview' : 'Preview'} POA - Spouses
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => verificationEnabled
          ? handleVerifyAndGenerate('umiejscowienie', 'Civil Registry Entry (Umiejscowienie)')
          : handleGeneratePDF('umiejscowienie', 'Civil Registry Entry (Umiejscowienie)', false)}>
          {verificationEnabled ? <Shield className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {verificationEnabled ? 'Verify & Preview' : 'Preview'} Civil Registry Entry
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => verificationEnabled
          ? handleVerifyAndGenerate('uzupelnienie', 'Birth Certificate Supplementation')
          : handleGeneratePDF('uzupelnienie', 'Birth Certificate Supplementation', false)}>
          {verificationEnabled ? <Shield className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {verificationEnabled ? 'Verify & Preview' : 'Preview'} Birth Certificate Supplementation
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      <PDFPreviewDialog
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          cleanupPreviewUrl();
        }}
        pdfUrl={previewUrl}
        formData={formData}
        onRegeneratePDF={handleRegeneratePDF}
        onDownloadEditable={handleDownloadEditable}
        onDownloadFinal={handleDownloadFinal}
        documentTitle={currentTemplate.label}
      />

      <PrePrintChecklist
        open={prePrintChecklistOpen}
        onClose={() => setPrePrintChecklistOpen(false)}
        onProceed={handleProceedToPrint}
        formData={formData}
        templateType={currentTemplateType}
      />
    </DropdownMenu>
  );
}
