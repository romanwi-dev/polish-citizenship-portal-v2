import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Languages, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DocumentTranslationStatusProps {
  document: any;
  compact?: boolean;
}

export function DocumentTranslationStatus({ document, compact = false }: DocumentTranslationStatusProps) {
  const queryClient = useQueryClient();

  const toggleTranslationRequired = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('documents')
        .update({ 
          translation_required: !document.translation_required,
          needs_translation: !document.translation_required 
        })
        .eq('id', document.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(document.translation_required ? 'Translation not required' : 'Marked for translation');
    },
    onError: () => {
      toast.error('Failed to update translation status');
    },
  });

  const markTranslated = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('documents')
        .update({ 
          is_translated: true,
          needs_translation: false 
        })
        .eq('id', document.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document marked as translated');
    },
    onError: () => {
      toast.error('Failed to update translation status');
    },
  });

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {document.translation_required && !document.is_translated && (
          <Badge variant="destructive" className="gap-1">
            <Languages className="h-3 w-3" />
            Translation Required
          </Badge>
        )}
        {document.is_translated && (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Translated
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {document.translation_required && !document.is_translated ? (
        <>
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Needs Translation
          </Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => markTranslated.mutate()}
            disabled={markTranslated.isPending}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Mark Translated
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => toggleTranslationRequired.mutate()}
            disabled={toggleTranslationRequired.isPending}
          >
            Not Required
          </Button>
        </>
      ) : document.is_translated ? (
        <>
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Translated
          </Badge>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => toggleTranslationRequired.mutate()}
            disabled={toggleTranslationRequired.isPending}
          >
            <Languages className="h-3 w-3 mr-1" />
            Mark Untranslated
          </Button>
        </>
      ) : (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => toggleTranslationRequired.mutate()}
          disabled={toggleTranslationRequired.isPending}
        >
          <Languages className="h-3 w-3 mr-1" />
          Requires Translation
        </Button>
      )}
    </div>
  );
}
