import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface TranslationStatusViewProps {
  caseId: string;
}

export const TranslationStatusView = ({ caseId }: TranslationStatusViewProps) => {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['client-translation-requests', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_requests')
        .select(`
          *,
          documents!translation_requests_document_id_fkey (
            id,
            name,
            person_type,
            type
          ),
          sworn_translators (
            full_name
          )
        `)
        .eq('case_id', caseId)
        .eq('client_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Completed',
          color: 'bg-green-500/20 text-green-700',
          description: 'Translation certified and ready'
        };
      case 'in_progress':
        return {
          icon: Clock,
          label: 'In Progress',
          color: 'bg-blue-500/20 text-blue-700',
          description: 'Being translated by sworn translator'
        };
      case 'assigned':
        return {
          icon: Clock,
          label: 'Assigned',
          color: 'bg-yellow-500/20 text-yellow-700',
          description: 'Assigned to sworn translator'
        };
      default:
        return {
          icon: Clock,
          label: 'Pending',
          color: 'bg-muted text-muted-foreground',
          description: 'Awaiting translator assignment'
        };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-spin w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm sm:text-base">No translation requests at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">Translation Status</h2>
      <p className="text-sm sm:text-base text-muted-foreground">
        Track the progress of your document translations
      </p>

      <div className="grid gap-3 sm:gap-4">
        {requests.map((request) => {
          const statusInfo = getStatusInfo(request.status);
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="truncate">{request.documents?.name || 'Document'}</span>
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={`${statusInfo.color} text-xs`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {request.source_language} → {request.target_language}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {statusInfo.description}
                </p>

                {request.assigned_translator_id && request.sworn_translators && (
                  <div className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">Translator: </span>
                    <span className="font-medium truncate">{request.sworn_translators.full_name}</span>
                  </div>
                )}

                {request.deadline && (
                  <div className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">Expected completion: </span>
                    <span className="font-medium">{format(new Date(request.deadline), 'PP')}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3 pt-2">
                  {/* Timeline */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      request.status !== 'pending' ? 'bg-green-500/20' : 'bg-muted'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 h-1 bg-muted">
                      <div 
                        className={`h-full bg-primary transition-all ${
                          request.status === 'assigned' ? 'w-1/3' :
                          request.status === 'in_progress' ? 'w-2/3' :
                          request.status === 'completed' ? 'w-full' :
                          'w-0'
                        }`}
                      />
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      request.status === 'completed' ? 'bg-green-500/20' : 'bg-muted'
                    }`}>
                      <Download className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {request.status === 'completed' && request.certified_translation_document_id && (
                  <Button className="w-full h-10 sm:h-11 text-xs sm:text-sm">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Download Certified Translation
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
