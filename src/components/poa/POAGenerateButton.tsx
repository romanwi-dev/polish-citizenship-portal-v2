import { useState } from "react";
import { FileText, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PDFPreviewDialog } from "@/components/PDFPreviewDialog";

interface POAGenerateButtonProps {
  caseId: string;
  passportConfidence?: number;
  birthCertConfidence?: number;
  onGenerated?: (pdfUrl: string, poaId: string) => void;
}

export const POAGenerateButton = ({
  caseId,
  passportConfidence,
  birthCertConfidence,
  onGenerated,
}: POAGenerateButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    passportScanned: boolean;
    dataComplete: number;
    warnings: string[];
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string>("");
  const [generatedPoaId, setGeneratedPoaId] = useState<string>("");
  const [poaType, setPoaType] = useState<string>("");

  const validateData = async () => {
    try {
      // Fetch master table data
      const { data: masterData, error } = await supabase
        .from('master_table')
        .select('*')
        .eq('case_id', caseId)
        .single();

      if (error) throw error;

      const warnings: string[] = [];
      let filledFields = 0;
      let totalFields = 0;

      // Check required fields for POA
      const requiredFields = [
        'applicant_first_name',
        'applicant_last_name',
        'applicant_passport_number',
      ];

      requiredFields.forEach(field => {
        totalFields++;
        if (masterData?.[field]) {
          filledFields++;
        } else {
          warnings.push(`Missing: ${field.replace(/_/g, ' ')}`);
        }
      });

      // Check confidence scores
      if (passportConfidence && passportConfidence < 0.80) {
        warnings.push('Low passport scan confidence - please review data');
      }

      const completionRate = (filledFields / totalFields) * 100;

      setValidationStatus({
        passportScanned: !!passportConfidence,
        dataComplete: completionRate,
        warnings,
      });

      return completionRate >= 70; // Minimum 70% complete
    } catch (error) {
      console.error('Validation error:', error);
      toast.error("Failed to validate data");
      return false;
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Validate first
      const isValid = await validateData();
      if (!isValid) {
        toast.error("Please complete required fields before generating POA");
        return;
      }

      // Fetch master data to determine POA type
      const { data: masterData, error: masterError } = await supabase
        .from('master_table')
        .select('applicant_marital_status, child_1_first_name, child_2_first_name, spouse_first_name')
        .eq('case_id', caseId)
        .single();

      if (masterError) {
        console.error('Failed to fetch master data:', masterError);
        toast.error("Failed to determine POA type");
        return;
      }

      // Determine POA type based on data
      let poaType = 'adult';
      const hasChildren = !!(masterData?.child_1_first_name || masterData?.child_2_first_name);
      const isMarried = masterData?.applicant_marital_status === 'married' && !!masterData?.spouse_first_name;

      if (hasChildren) {
        poaType = 'minor';
      } else if (isMarried) {
        poaType = 'married';
      }

      console.log('[POAGenerateButton] Generating POA:', { caseId, poaType, hasChildren, isMarried });

      // Generate POA with correct parameters
      const { data, error } = await supabase.functions.invoke('generate-poa', {
        body: { caseId, poaType },
      });

      if (error) {
        console.error('[POAGenerateButton] Generation error:', error);
        throw error;
      }

      if (data?.success && data?.pdfUrl && data?.poaId) {
        toast.success("POA generated successfully!");
        setGeneratedPdfUrl(data.pdfUrl);
        setGeneratedPoaId(data.poaId);
        setPoaType(poaType);
        setShowPreview(true);
      } else {
        console.error('[POAGenerateButton] Invalid response:', data);
        throw new Error('POA generation failed - missing PDF URL or POA ID');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || "Failed to generate POA");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadEditable = () => {
    if (generatedPdfUrl) {
      const link = document.createElement('a');
      link.href = generatedPdfUrl;
      link.download = `POA-${poaType}-Editable.pdf`;
      link.click();
      toast.success("Download started");
    }
  };

  const handleDownloadFinal = async () => {
    if (!generatedPoaId || !caseId || !generatedPdfUrl) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('lock-pdf', {
        body: {
          documentId: generatedPoaId,
          caseId: caseId,
          pdfUrl: generatedPdfUrl
        }
      });

      if (error) throw error;
      
      if (data?.success && data?.lockedUrl) {
        const link = document.createElement('a');
        link.href = data.lockedUrl;
        link.download = `POA-${poaType}-Final.pdf`;
        link.click();
        toast.success("Final PDF downloaded");
      }
    } catch (error) {
      console.error('Lock PDF error:', error);
      toast.error("Failed to download final PDF");
    }
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    if (onGenerated) {
      onGenerated(generatedPdfUrl, generatedPoaId);
    }
  };

  return (
    <>
      <Card className="glass-card hover-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate POA
          </CardTitle>
          <CardDescription>
            Review data and generate your Power of Attorney document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationStatus && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-bold">{validationStatus.dataComplete.toFixed(0)}%</span>
              </div>
              <Progress value={validationStatus.dataComplete} />
              
              <div className="space-y-2">
                {validationStatus.passportScanned && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Passport scanned ({passportConfidence ? `${(passportConfidence * 100).toFixed(0)}%` : 'N/A'} confidence)
                  </div>
                )}
                
                {validationStatus.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-yellow-600">
                    <AlertTriangle className="w-4 h-4" />
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating POA...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Generate PDF (3 Copies)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <PDFPreviewDialog
        open={showPreview}
        onClose={handlePreviewClose}
        pdfUrl={generatedPdfUrl}
        onDownloadEditable={handleDownloadEditable}
        onDownloadFinal={handleDownloadFinal}
        documentTitle={`Power of Attorney - ${poaType}`}
        documentId={generatedPoaId}
        caseId={caseId}
      />
    </>
  );
};