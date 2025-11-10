import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PassportUploadProps {
  caseId?: string;
  onDataExtracted?: (data: any) => void;
}

export function PassportUpload({ caseId, onDataExtracted }: PassportUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success("Passport image selected");
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error("Please select a passport image first");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Scanning passport...");
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // ✅ PHASE EX FIX #3: Call real OCR edge function
        const { supabase } = await import("@/integrations/supabase/client");
        
        // Create temporary document record if no documentId provided
        let docId = caseId;
        if (caseId) {
          const { data: tempDoc } = await supabase
            .from('documents')
            .insert({
              case_id: caseId,
              name: 'temp-passport-scan',
              file_extension: 'jpg',
              ocr_status: 'pending'
            } as any)
            .select('id')
            .single();
          
          docId = tempDoc?.id;
        }
        
      const { data, error } = await supabase.functions.invoke('ocr-universal', {
        body: { 
          imageBase64: base64,
          documentId: docId || 'temp',
          caseId,
          expectedType: 'passport'
        }
      });

        if (error) {
          throw new Error(error.message || 'OCR failed');
        }

        // Extract passport fields from OCR data
        const extracted = data?.extracted_data || {};
        const mappedData: any = {};

        // Map OCR fields to form fields
        if (extracted.full_name || extracted.name) {
          const fullName = extracted.full_name || extracted.name;
          const parts = fullName.split(' ');
          mappedData.applicant_first_name = parts.slice(0, -1).join(' ') || '';
          mappedData.applicant_last_name = parts[parts.length - 1] || '';
        }
        if (extracted.given_name) mappedData.applicant_first_name = extracted.given_name;
        if (extracted.surname || extracted.last_name) mappedData.applicant_last_name = extracted.surname || extracted.last_name;
        if (extracted.passport_number || extracted.document_number) mappedData.passport_number = extracted.passport_number || extracted.document_number;
        if (extracted.date_of_birth || extracted.dob) mappedData.applicant_dob = extracted.date_of_birth || extracted.dob;
        if (extracted.sex || extracted.gender) mappedData.applicant_sex = (extracted.sex || extracted.gender).toUpperCase();
        
        toast.dismiss(toastId);
        toast.success("Passport data extracted!");
        onDataExtracted?.(mappedData);
        setIsProcessing(false);
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read image file');
      };
    } catch (error: any) {
      console.error("OCR error:", error);
      toast.dismiss(toastId);
      toast.error("Failed to scan passport: " + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Camera className="h-6 w-6 text-primary" />
          <div>
            <Label className="text-lg font-semibold">Passport Scanner (OCR)</Label>
            <p className="text-sm text-muted-foreground">Upload passport to auto-fill fields</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="passport-upload"
            />
            <label htmlFor="passport-upload" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('passport-upload')?.click()}
                disabled={isProcessing}
              >
                <Upload className="h-4 w-4 mr-2" />
                {selectedFile ? selectedFile.name : "Select Photo"}
              </Button>
            </label>
            
            <Button
              onClick={handleScan}
              disabled={!selectedFile || isProcessing}
              className="px-6"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Scan
                </>
              )}
            </Button>
          </div>

          {selectedFile && (
            <p className="text-xs text-muted-foreground text-center">
              Ready to scan: {selectedFile.name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
