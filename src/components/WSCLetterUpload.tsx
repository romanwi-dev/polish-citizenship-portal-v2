import { useState } from "react";
import { Upload, FileText, Calendar, Hash, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WSCLetterUploadProps {
  caseId: string;
  onUploadComplete: () => void;
}

export const WSCLetterUpload = ({ caseId, onUploadComplete }: WSCLetterUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [letterDate, setLetterDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [deadline, setDeadline] = useState("");
  const [hacNotes, setHacNotes] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64 for OCR (if needed)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        // Create WSC letter record
        const { data: wscData, error: wscError } = await supabase
          .from("wsc_letters")
          .insert({
            case_id: caseId,
            letter_date: letterDate || null,
            reference_number: referenceNumber || null,
            deadline: deadline || null,
            hac_notes: hacNotes || null,
            hac_reviewed: false,
            file_url: base64, // In production, upload to storage
          })
          .select()
          .single();

        if (wscError) throw wscError;

        // Update case KPI
        const { error: caseError } = await supabase
          .from("cases")
          .update({ wsc_received: true })
          .eq("id", caseId);

        if (caseError) throw caseError;

        toast.success("WSC letter uploaded successfully");
        onUploadComplete();
        
        // Reset form
        setFile(null);
        setLetterDate("");
        setReferenceNumber("");
        setDeadline("");
        setHacNotes("");
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload WSC letter");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Upload WSC Letter
        </CardTitle>
        <CardDescription>
          Upload the letter received from the Masovian Voivoda's office
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wsc-file">Letter File (PDF/Image)</Label>
          <Input
            id="wsc-file"
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="letter-date">
              <Calendar className="w-4 h-4 inline mr-1" />
              Letter Date
            </Label>
            <Input
              id="letter-date"
              type="date"
              value={letterDate}
              onChange={(e) => setLetterDate(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Response Deadline
            </Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={uploading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">
            <Hash className="w-4 h-4 inline mr-1" />
            Reference Number
          </Label>
          <Input
            id="reference"
            placeholder="e.g., WM-I.740.12.2024.ABC"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hac-notes">HAC Notes (Optional)</Label>
          <Textarea
            id="hac-notes"
            placeholder="Add any important notes about this letter..."
            value={hacNotes}
            onChange={(e) => setHacNotes(e.target.value)}
            disabled={uploading}
            rows={3}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload WSC Letter
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
