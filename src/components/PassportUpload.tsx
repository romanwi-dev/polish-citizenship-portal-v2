import { useState } from "react";
import { Upload, Scan, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PassportUploadProps {
  caseId: string;
  onDataExtracted: (data: any) => void;
}

export const PassportUpload = ({ caseId, onDataExtracted }: PassportUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a passport image");
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        // Call OCR edge function
        const { data, error } = await supabase.functions.invoke("ocr-passport", {
          body: { imageBase64: base64, caseId },
        });

        if (error) throw error;

        if (data?.success) {
          toast.success("Passport data extracted successfully!");
          onDataExtracted(data.data);
          setFile(null);
        } else {
          throw new Error("OCR extraction failed");
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process passport");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="w-5 h-5" />
          Passport Scanner
        </CardTitle>
        <CardDescription>
          Upload passport photo for automatic data extraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {file && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              {file.name}
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Scanning Passport...
            </>
          ) : (
            <>
              <Scan className="w-4 h-4 mr-2" />
              Scan & Extract Data
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Extracts: Name, DOB, Sex, Document #, Issue/Expiry dates</p>
          <p>• Automatically fills intake form fields</p>
          <p>• Supports all major passport formats</p>
        </div>
      </CardContent>
    </Card>
  );
};
