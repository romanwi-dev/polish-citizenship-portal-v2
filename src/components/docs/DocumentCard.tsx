import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, Download, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { DocumentTranslationStatus } from './DocumentTranslationStatus';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface DocumentCardProps {
  document: any;
}

const PERSON_LABELS: Record<string, string> = {
  AP: 'Applicant',
  SPOUSE: 'Spouse',
  F: 'Father',
  M: 'Mother',
  PGF: 'Paternal Grandfather',
  PGM: 'Paternal Grandmother',
  MGF: 'Maternal Grandfather',
  MGM: 'Maternal Grandmother',
};

export function DocumentCard({ document }: DocumentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!document.dropbox_path) {
      toast({
        title: 'Download Error',
        description: 'No file path available for this document',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dropbox-download', {
        body: { file_path: document.dropbox_path }
      });

      if (error) {
        throw error;
      }

      // Create blob and trigger download
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download Started',
        description: 'Your file is being downloaded',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download file',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <FileText className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{document.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {document.person_type && (
                  <Badge variant="outline" className="gap-1">
                    <User className="h-3 w-3" />
                    {PERSON_LABELS[document.person_type] || document.person_type}
                  </Badge>
                )}
                {document.document_type && (
                  <Badge variant="secondary">{document.document_type}</Badge>
                )}
                {document.file_extension && (
                  <span className="text-xs text-muted-foreground uppercase">
                    {document.file_extension}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`} />
          </Button>
        </div>

        <DocumentTranslationStatus document={document} />

        {document.verified_at && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            Verified {format(new Date(document.verified_at), 'MMM dd, yyyy')}
          </div>
        )}

        {document.created_at && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Uploaded {format(new Date(document.created_at), 'MMM dd, yyyy')}
          </div>
        )}

        {document.ocr_text && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              OCR Data Available
            </summary>
            <p className="mt-2 p-2 bg-muted rounded text-xs line-clamp-3">
              {document.ocr_text}
            </p>
          </details>
        )}
      </div>
    </Card>
  );
}
