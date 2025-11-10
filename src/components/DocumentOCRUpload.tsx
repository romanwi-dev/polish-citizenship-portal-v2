import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface DocumentOCRUploadProps {
  caseId: string;
  documentId?: string;
  onDataExtracted?: (data: any) => void;
}

export const DocumentOCRUpload = ({
  caseId,
  documentId,
  onDataExtracted,
}: DocumentOCRUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [expectedType, setExpectedType] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!file && !documentId) {
      toast.error("Please select a file");
      return;
    }

    setProcessing(true);
    try {
      let docId = documentId;

      // Create document entry if needed
      if (!docId && file) {
        const { data: newDoc, error: docError } = await supabase
          .from("documents")
          .insert({
            case_id: caseId,
            name: file.name,
            type: expectedType || "other",
            category: "legal",
            person_type: "AP",
            dropbox_path: `/temp/${file.name}`,
            ocr_status: "pending",
          })
          .select()
          .single();

        if (docError) throw docError;
        docId = newDoc.id;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

      const { data, error } = await supabase.functions.invoke("ocr-universal", {
        body: {
          imageBase64: base64,
          documentId: docId,
          expectedType,
        },
      });

        if (error) throw error;

        if (data?.success) {
          toast.success("Document processed successfully!");
          setResult(data.data);
          if (onDataExtracted) {
            onDataExtracted(data.data);
          }
          if (data.needsReview) {
            toast.warning("Low confidence - review recommended");
          }
        } else {
          throw new Error("OCR processing failed");
        }
      };

      if (file) {
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to process document");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document OCR
          </CardTitle>
          <CardDescription>
            Extract data from birth certificates, marriage certificates, naturalization papers, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!documentId && (
            <div className="space-y-2">
              <Label>Document Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={processing}
              />
              {file && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {file.name}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Document Type (Optional)</Label>
            <Select value={expectedType} onValueChange={setExpectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-detect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Auto-detect</SelectItem>
                <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                <SelectItem value="marriage_certificate">Marriage Certificate</SelectItem>
                <SelectItem value="naturalization">Naturalization Papers</SelectItem>
                <SelectItem value="death_certificate">Death Certificate</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="military_record">Military Record</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleProcess}
            disabled={(!file && !documentId) || processing}
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Scan & Extract Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Extracted Data</span>
              <Badge className={result.confidence >= 0.85 ? "bg-green-500" : "bg-yellow-500"}>
                {(result.confidence * 100).toFixed(0)}% Confidence
              </Badge>
            </CardTitle>
            <CardDescription>
              Document Type: {result.document_type.replace(/_/g, ' ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(result.extracted_data).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{key.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-muted-foreground">{String(value)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
