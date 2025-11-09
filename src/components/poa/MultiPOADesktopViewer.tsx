import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  Printer, 
  Lock, 
  Unlock, 
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { POAType } from '@/types/poa';

interface POADocument {
  id: string;
  poaType: POAType;
  generatedAt: string;
  status: 'draft' | 'signed' | 'locked';
  pdfUrl?: string;
  lockedUrl?: string;
  isLocked: boolean;
}

interface MultiPOADesktopViewerProps {
  caseId: string;
  documents: POADocument[];
  onRefresh?: () => void;
}

export function MultiPOADesktopViewer({ 
  caseId, 
  documents,
  onRefresh 
}: MultiPOADesktopViewerProps) {
  const [activeTab, setActiveTab] = useState(documents[0]?.poaType || 'adult');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const activeDocument = documents.find(doc => doc.poaType === activeTab);

  // Security: Validate and sanitize URLs before use
  const getSecureUrl = (doc: POADocument): string | null => {
    const url = doc.isLocked ? doc.lockedUrl : doc.pdfUrl;
    if (!url) return null;
    
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return null;
      return url;
    } catch {
      return null;
    }
  };

  const handleLockToggle = async (doc: POADocument) => {
    if (!doc.pdfUrl) {
      toast.error('No PDF available to lock');
      return;
    }

    setLoadingStates(prev => ({ ...prev, [doc.id]: true }));

    try {
      // Security: Rate limiting enforced by edge function
      const { data, error } = await supabase.functions.invoke('lock-pdf', {
        body: {
          poaId: doc.id,
          caseId,
          isLocked: !doc.isLocked,
        }
      });

      if (error) {
        // Security: Handle rate limit errors
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else {
          toast.error('Failed to lock PDF: ' + error.message);
        }
        return;
      }

      toast.success(doc.isLocked ? 'PDF unlocked' : 'PDF locked for printing');
      onRefresh?.();
    } catch (error: any) {
      console.error('Lock toggle error:', error);
      toast.error('An error occurred while processing your request');
    } finally {
      setLoadingStates(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  const handlePrint = async (doc: POADocument) => {
    const url = getSecureUrl(doc);
    if (!url) {
      toast.error('No PDF available for printing');
      return;
    }

    if (!doc.isLocked) {
      toast.info('Locking PDF for printing...');
      await handleLockToggle(doc);
      return;
    }

    // Open in new window for printing
    window.open(url, '_blank');
    toast.success('Opening PDF in new window for printing');
  };

  const handleDownload = async (doc: POADocument) => {
    const url = getSecureUrl(doc);
    if (!url) {
      toast.error('No PDF available for download');
      return;
    }

    setLoadingStates(prev => ({ ...prev, [`download-${doc.id}`]: true }));

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Security: Validate file type
      if (blob.type !== 'application/pdf') {
        toast.error('Invalid file type received');
        return;
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `POA_${doc.poaType}_${caseId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`download-${doc.id}`]: false }));
    }
  };

  const getStatusBadge = (doc: POADocument) => {
    if (doc.isLocked) {
      return <Badge variant="secondary" className="gap-1"><Lock className="h-3 w-3" /> Locked</Badge>;
    }
    if (doc.status === 'signed') {
      return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Signed</Badge>;
    }
    if (doc.status === 'draft') {
      return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Draft</Badge>;
    }
    return null;
  };

  if (documents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No POA Documents</h3>
        <p className="text-sm text-muted-foreground">
          Generate POA documents to view them here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Grid Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Sidebar - Document List */}
        <Card className="col-span-1 p-4">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            POA Documents ({documents.length})
          </h3>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as POAType)}>
            <TabsList className="grid w-full mb-4" style={{ gridTemplateColumns: `repeat(${documents.length}, 1fr)` }}>
              {documents.map((doc) => (
                <TabsTrigger key={doc.id} value={doc.poaType} className="text-xs">
                  {doc.poaType.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[500px]">
              {documents.map((doc) => (
                <TabsContent key={doc.id} value={doc.poaType} className="mt-0">
                  <div className="space-y-4">
                    {/* Document Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status</span>
                        {getStatusBadge(doc)}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-mono">{doc.poaType}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Generated</span>
                        <span className="text-xs">
                          {new Date(doc.generatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => handleLockToggle(doc)}
                        disabled={loadingStates[doc.id]}
                      >
                        {doc.isLocked ? (
                          <><Unlock className="h-4 w-4" /> Unlock PDF</>
                        ) : (
                          <><Lock className="h-4 w-4" /> Lock for Print</>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => handlePrint(doc)}
                        disabled={loadingStates[doc.id]}
                      >
                        <Printer className="h-4 w-4" />
                        Print
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => handleDownload(doc)}
                        disabled={loadingStates[`download-${doc.id}`]}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    {/* Security Notice */}
                    {doc.isLocked && (
                      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3 inline mr-1" />
                        This PDF is locked and cannot be edited
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </Card>

        {/* Right Content - PDF Preview */}
        <Card className="col-span-2 p-0 overflow-hidden">
          {activeDocument ? (
            <>
              {/* Preview Header */}
              <div className="bg-muted/30 px-6 py-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {activeDocument.poaType.toUpperCase()} Power of Attorney
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Desktop Preview & Print
                  </p>
                </div>
                {getStatusBadge(activeDocument)}
              </div>

              {/* PDF Viewer */}
              <div className="relative h-[600px]">
                {getSecureUrl(activeDocument) ? (
                  <iframe
                    src={getSecureUrl(activeDocument)!}
                    className="w-full h-full border-0"
                    title={`${activeDocument.poaType} POA Preview`}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/10">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">No Preview Available</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate a PDF to see the preview
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions Footer */}
              <div className="bg-muted/30 px-6 py-3 border-t flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Desktop optimized for A4 printing
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLockToggle(activeDocument)}
                    disabled={loadingStates[activeDocument.id]}
                  >
                    {activeDocument.isLocked ? (
                      <><Unlock className="h-4 w-4 mr-2" /> Unlock</>
                    ) : (
                      <><Lock className="h-4 w-4 mr-2" /> Lock</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handlePrint(activeDocument)}
                    disabled={loadingStates[activeDocument.id]}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Select a POA Document</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a document from the list to preview
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Security Info */}
      <Card className="p-4 bg-muted/20">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-1">Secure Multi-POA System</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• All PDFs are encrypted in transit and at rest</p>
              <p>• Locked PDFs cannot be edited or modified</p>
              <p>• Rate limiting: Max 5 generations/hour, 10 locks/hour</p>
              <p>• Signed URLs expire after 45 minutes for security</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
