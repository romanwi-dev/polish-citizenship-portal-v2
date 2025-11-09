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
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // TODO: Call OCR edge function
        // For now, simulate extraction
        toast.loading("Scanning passport...");
        
        setTimeout(() => {
          const mockData = {
            applicant_first_name: "John",
            applicant_last_name: "Doe",
            passport_number: "AB123456",
            applicant_dob: "01.01.1990",
            applicant_sex: "M"
          };
          
          toast.dismiss();
          toast.success("Passport data extracted!");
          onDataExtracted?.(mockData);
          setIsProcessing(false);
        }, 2000);
      };
    } catch (error: any) {
      console.error("OCR error:", error);
      toast.error("Failed to scan passport");
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
