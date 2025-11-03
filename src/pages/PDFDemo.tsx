import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PDF_TEMPLATES = [
  { value: "poa-adult.pdf", label: "POA - Adult" },
  { value: "poa-minor.pdf", label: "POA - Minor" },
  { value: "poa-spouses.pdf", label: "POA - Spouses" },
  { value: "citizenship.pdf", label: "Citizenship Application" },
  { value: "family-tree.pdf", label: "Family Tree" },
  { value: "umiejscowienie.pdf", label: "Civil Registry Entry (Umiejscowienie)" },
  { value: "uzupelnienie.pdf", label: "Civil Registry Supplement (Uzupełnienie)" },
];

export default function PDFDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("poa-adult.pdf");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const loadPDF = async (templateName: string) => {
    try {
      setLoading(true);
      setPdfUrl(""); // Clear previous PDF

      // Get PDF from storage
      const { data, error } = await supabase.storage
        .from("pdf-templates")
        .download(templateName);

      if (error) {
        console.error("Storage error:", error);
        toast.error(`Failed to load template: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error("No data returned from storage");
        return;
      }

      // Create blob URL
      const blob = new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      console.log("✅ PDF loaded:", {
        template: templateName,
        size: blob.size,
        url: url.substring(0, 50) + "..."
      });

      setPdfUrl(url);
      toast.success(`Template loaded: ${templateName}`);
    } catch (error: any) {
      console.error("Load error:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPDF(selectedTemplate);

    // Cleanup
    return () => {
      if (pdfUrl && pdfUrl.startsWith("blob:")) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [selectedTemplate]);

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = selectedTemplate;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template downloaded");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">PDF Template Demo</h1>
            <p className="text-muted-foreground">
              View Polish citizenship PDF templates in full
            </p>
          </div>

          <div className="flex gap-3 items-center w-full md:w-auto">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PDF_TEMPLATES.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleDownload}
              disabled={!pdfUrl || loading}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden bg-muted/10 shadow-lg">
          {loading && (
            <div className="flex items-center justify-center h-[800px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-[800px] md:h-[900px] border-0"
              title="PDF Template Preview"
            />
          )}

          {!loading && !pdfUrl && (
            <div className="flex items-center justify-center h-[800px] text-muted-foreground">
              No PDF loaded
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> These are the original PDF templates stored in Lovable Cloud.
            They contain Polish text and form fields ready to be filled programmatically.
          </p>
        </div>
      </div>
    </div>
  );
}
