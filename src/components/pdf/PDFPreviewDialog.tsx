import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { getDefaultCopies } from "@/lib/pdf-print-config";

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  templateType: string;
  onGenerate: () => void;
  availablePOATypes?: string[]; // NEW: Multi-POA preview support
  pdfUrls?: Record<string, string>; // NEW: URLs for each POA type
}

interface FieldPreview {
  name: string;
  value: string | null;
  isFilled: boolean;
  mappingSource?: string;
}

interface PreviewData {
  stats: {
    total: number;
    filled: number;
    unfilled: number;
    fillRate: number;
  };
  fields: {
    filled: FieldPreview[];
    unfilled: FieldPreview[];
  };
}

export function PDFPreviewDialog({
  open,
  onOpenChange,
  caseId,
  templateType,
  onGenerate,
  availablePOATypes,
  pdfUrls,
}: PDFPreviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [activePOAType, setActivePOAType] = useState<string>(availablePOATypes?.[0] || templateType);
  const [isMobile, setIsMobile] = useState(false);
  const defaultCopies = getDefaultCopies(templateType);

  // Detect mobile device
  useState(() => {
    const ua = navigator.userAgent;
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(ua));
  });

  const loadPreview = async () => {
    console.log('[PDFPreviewDialog] loadPreview called:', { caseId, templateType });
    setLoading(true);
    try {
      console.log('[PDFPreviewDialog] Invoking pdf-preview...');
      const { data, error } = await supabase.functions.invoke('pdf-preview', {
        body: { caseId, templateType }
      });

      console.log('[PDFPreviewDialog] Response:', { data, error });
      
      if (error) throw error;
      setPreview(data);
      console.log('[PDFPreviewDialog] Preview loaded successfully');
    } catch (error) {
      console.error('[PDFPreviewDialog] Preview error:', error);
      toast.error('Failed to load preview: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log('[PDFPreviewDialog] handleOpenChange:', { newOpen, hasPreview: !!preview });
    if (newOpen && !preview) {
      loadPreview();
    }
    onOpenChange(newOpen);
  };

  const handleGenerate = () => {
    onOpenChange(false);
    onGenerate();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Preview: {templateType}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && preview && (
          <div className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-2xl font-bold">{preview.stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Fields</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-2xl font-bold text-green-600">{preview.stats.filled}</div>
                <div className="text-sm text-muted-foreground">Filled</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-2xl font-bold text-red-600">{preview.stats.unfilled}</div>
                <div className="text-sm text-muted-foreground">Unfilled</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-2xl font-bold">{preview.stats.fillRate}%</div>
                <div className="text-sm text-muted-foreground">Fill Rate</div>
              </div>
            </div>

            {/* Field Lists */}
            <Tabs defaultValue="unfilled" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="unfilled">
                  Unfilled Fields ({preview.stats.unfilled})
                </TabsTrigger>
                <TabsTrigger value="filled">
                  Filled Fields ({preview.stats.filled})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unfilled">
                <ScrollArea className="h-[300px] rounded-md border">
                  <div className="p-4 space-y-2">
                    {preview.fields.unfilled.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        All fields are filled! 🎉
                      </div>
                    ) : (
                      preview.fields.unfilled.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm truncate">{field.name}</div>
                            {field.mappingSource && (
                              <div className="text-xs text-muted-foreground">
                                Maps to: {field.mappingSource}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="filled">
                <ScrollArea className="h-[300px] rounded-md border">
                  <div className="p-4 space-y-2">
                    {preview.fields.filled.map((field, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm truncate">{field.name}</div>
                          <div className="text-sm text-foreground truncate">{field.value}</div>
                          {field.mappingSource && (
                            <div className="text-xs text-muted-foreground">
                              From: {field.mappingSource}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Multi-POA Tabs - Show if multiple POA types available */}
            {availablePOATypes && availablePOATypes.length > 1 && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-2">Preview POA Types:</div>
                <Tabs value={activePOAType} onValueChange={setActivePOAType}>
                  <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availablePOATypes.length}, 1fr)` }}>
                    {availablePOATypes.map((type) => (
                      <TabsTrigger key={type} value={type}>
                        {type.toUpperCase()}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {availablePOATypes.map((type) => (
                    <TabsContent key={type} value={type} className="mt-4">
                      {pdfUrls?.[type] && (
                        <div className="border rounded-lg overflow-hidden">
                          <iframe 
                            src={pdfUrls[type]} 
                            className="w-full h-[400px]"
                            title={`${type.toUpperCase()} POA Preview`}
                          />
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}

            {/* Mobile Editing Instructions */}
            {isMobile && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  📱 Editing on Mobile
                </h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>Download "Editable PDF" below</li>
                  <li>Open in <strong>Adobe Acrobat Reader</strong> (free app)</li>
                  <li>Fill form fields in the app</li>
                  <li>Save and upload back to your case</li>
                </ol>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={() => window.open('https://get.adobe.com/reader/', '_blank')}
                >
                  Download Adobe Reader (Free)
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                {preview.stats.fillRate < 50 && (
                  <Badge variant="destructive">Low Fill Rate</Badge>
                )}
                {preview.stats.fillRate >= 50 && preview.stats.fillRate < 80 && (
                  <Badge variant="secondary">Moderate Fill Rate</Badge>
                )}
                {preview.stats.fillRate >= 80 && (
                  <Badge variant="default">Good Fill Rate</Badge>
                )}
                {defaultCopies > 1 && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Printer className="h-4 w-4" />
                    <span>Default: {defaultCopies} copies</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate}>
                  Generate PDF Anyway
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
