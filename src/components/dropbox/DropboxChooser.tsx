import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface DropboxChooserProps {
  caseId: string;
  dropboxPath: string;
  onFilesLinked?: () => void;
  disabled?: boolean;
}

interface DropboxFile {
  name: string;
  link: string;
  bytes: number;
  icon: string;
}

declare global {
  interface Window {
    Dropbox?: {
      choose: (options: {
        success: (files: DropboxFile[]) => void;
        cancel?: () => void;
        linkType: 'preview' | 'direct';
        multiselect: boolean;
        extensions?: string[];
        folderselect: boolean;
      }) => void;
    };
  }
}

export function DropboxChooser({ caseId, dropboxPath, onFilesLinked, disabled }: DropboxChooserProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Load pending count on mount
  useState(() => {
    const loadPendingCount = async () => {
      const { data, error } = await supabase.rpc('get_pending_document_count', {
        p_case_id: caseId
      });
      if (!error && data !== null) {
        setPendingCount(data);
      }
    };
    loadPendingCount();
  });

  const clearPendingDocuments = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('clear-document-queue', {
        body: { caseId }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Queue Cleared',
          description: `Removed ${data.deleted_count} pending document(s)`,
        });
        setPendingCount(0);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error clearing queue:', error);
      toast({
        title: 'Clear Failed',
        description: error instanceof Error ? error.message : 'Failed to clear queue',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleChooseFiles = () => {
    if (!window.Dropbox) {
      toast({
        title: 'Dropbox Not Available',
        description: 'Dropbox Chooser is loading. Please try again in a moment.',
        variant: 'destructive'
      });
      return;
    }

    window.Dropbox.choose({
      success: async (files) => {
        setIsProcessing(true);

        try {
          // Clear pending documents first if any exist
          if (pendingCount > 0) {
            const cleared = await clearPendingDocuments();
            if (!cleared) {
              setIsProcessing(false);
              return;
            }
          }

          // Link the selected Dropbox files
          const { data, error } = await supabase.functions.invoke('link-dropbox-documents', {
            body: {
              caseId,
              files,
              dropboxBasePath: dropboxPath
            }
          });

          if (error) throw error;

          if (data?.success) {
            toast({
              title: 'Files Linked Successfully',
              description: `${data.linked_count} file(s) queued for OCR processing`,
            });

            // Trigger OCR scan
            await supabase.functions.invoke('scan-uploaded-documents', {
              body: { caseId }
            });

            onFilesLinked?.();
          } else {
            throw new Error(data?.error || 'Failed to link files');
          }

        } catch (error) {
          console.error('Error linking files:', error);
          toast({
            title: 'Link Failed',
            description: error instanceof Error ? error.message : 'Failed to link files',
            variant: 'destructive'
          });
        } finally {
          setIsProcessing(false);
        }
      },
      cancel: () => {
        console.log('Dropbox chooser cancelled');
      },
      linkType: 'direct',
      multiselect: true,
      extensions: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.tiff', '.doc', '.docx'],
      folderselect: false
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleChooseFiles}
        variant="default"
        size="sm"
        className="w-full gap-2"
        disabled={disabled || isProcessing || !caseId}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <FolderOpen className="h-4 w-4" />
            Choose from Dropbox
          </>
        )}
      </Button>

      {pendingCount > 0 && (
        <Badge variant="secondary" className="w-full justify-center text-xs">
          {pendingCount} pending document(s) will be cleared
        </Badge>
      )}
    </div>
  );
}
