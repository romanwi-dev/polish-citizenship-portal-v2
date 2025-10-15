import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface HistoricalDocumentProcessorProps {
  caseId: string;
  documentId?: string;
  onProcessingComplete?: (data: any) => void;
}

export const HistoricalDocumentProcessor = ({
  caseId,
  documentId,
  onProcessingComplete,
}: HistoricalDocumentProcessorProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [documentType, setDocumentType] = useState<string>("unknown");
  const [language, setLanguage] = useState<string>("russian");
  const [era, setEra] = useState<string>("1800s");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!file && !documentId) {
      toast.error("Please select a file to process");
      return;
    }

    setProcessing(true);
    try {
      let docId = documentId;

      // If no documentId provided, create document entry first
      if (!docId && file) {
        const { data: newDoc, error: docError } = await supabase
          .from("documents")
          .insert({
            case_id: caseId,
            name: file.name,
            type: "historical",
            category: "archival",
            person_type: "AP",
            dropbox_path: `/temp/${file.name}`,
            ocr_status: "pending",
          })
          .select()
          .single();

        if (docError) throw docError;
        docId = newDoc.id;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        // Call OCR edge function
        const { data, error } = await supabase.functions.invoke("ocr-historical", {
          body: {
            imageBase64: base64,
            documentId: docId,
            documentType,
            language,
            era,
          },
        });

        if (error) throw error;

        if (data?.success) {
          toast.success("Historical document processed successfully!");
          setResult(data.data);
          if (onProcessingComplete) {
            onProcessingComplete(data.data);
          }
          if (data.needsReview) {
            toast.warning("Low confidence - manual review recommended");
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
      toast.error("Failed to process historical document");
    } finally {
      setProcessing(false);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge className="bg-green-500">Excellent ({(confidence * 100).toFixed(0)}%)</Badge>;
    if (confidence >= 0.75) return <Badge className="bg-yellow-500">Good ({(confidence * 100).toFixed(0)}%)</Badge>;
    return <Badge className="bg-red-500">Needs Review ({(confidence * 100).toFixed(0)}%)</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Historical Document Processor
          </CardTitle>
          <CardDescription>
            Process old handwritten Russian/Cyrillic archival documents
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">Unknown</SelectItem>
                  <SelectItem value="birth">Birth Record</SelectItem>
                  <SelectItem value="marriage">Marriage Record</SelectItem>
                  <SelectItem value="death">Death Record</SelectItem>
                  <SelectItem value="census">Census</SelectItem>
                  <SelectItem value="military">Military Record</SelectItem>
                  <SelectItem value="church">Church Record</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="russian">Russian</SelectItem>
                  <SelectItem value="polish">Polish</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="yiddish">Yiddish</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Era</Label>
              <Select value={era} onValueChange={setEra}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1700s">1700s</SelectItem>
                  <SelectItem value="1800s">1800s</SelectItem>
                  <SelectItem value="1900s">Early 1900s</SelectItem>
                  <SelectItem value="1910s">1910-1918</SelectItem>
                  <SelectItem value="1920s">1920s+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleProcess}
            disabled={(!file && !documentId) || processing}
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Process Historical Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>OCR Results</span>
              {getConfidenceBadge(result.confidence.overall)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Original Text (Cyrillic)</Label>
              <Textarea
                value={result.original_text}
                readOnly
                className="font-mono min-h-[100px]"
              />
            </div>

            {result.modern_russian && (
              <div className="space-y-2">
                <Label>Modern Russian</Label>
                <Textarea
                  value={result.modern_russian}
                  readOnly
                  className="min-h-[80px]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Polish Translation</Label>
              <Textarea
                value={result.polish}
                readOnly
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>English Translation</Label>
              <Textarea
                value={result.english}
                readOnly
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Extracted Names</Label>
                <div className="text-sm space-y-1">
                  {result.names.map((name: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Extracted Places</Label>
                <div className="text-sm space-y-1">
                  {result.places.map((place: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {place}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Extracted Dates</Label>
              <div className="text-sm space-y-1">
                {result.dates.map((date: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {date.text}
                    {date.type === "julian" && (
                      <Badge variant="outline" className="text-xs">Julian Calendar</Badge>
                    )}
                    {date.modern && <span className="text-muted-foreground">→ {date.modern}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Document Type: <strong>{result.document_type}</strong>
              </div>
              {result.confidence.overall < 0.75 && (
                <div className="flex items-center gap-2 text-orange-500">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Requires HAC Review</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
