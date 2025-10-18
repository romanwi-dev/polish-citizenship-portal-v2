import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Send, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateUSCRequestDialog } from './CreateUSCRequestDialog';
import { USCRequestCard } from './USCRequestCard';

interface USCWorkflowPanelProps {
  caseId: string;
}

export function USCWorkflowPanel({ caseId }: USCWorkflowPanelProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: uscRequests, isLoading } = useQuery({
    queryKey: ['usc-requests', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usc_requests')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const statusCounts = uscRequests?.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            USC Workflows
            <Badge variant="outline" className="ml-2">
              {uscRequests?.length || 0} requests
            </Badge>
          </CardTitle>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
        {uscRequests && uscRequests.length > 0 && (
          <div className="flex gap-2 mt-4">
            {statusCounts.draft > 0 && (
              <Badge variant="secondary">
                {statusCounts.draft} draft
              </Badge>
            )}
            {statusCounts.sent > 0 && (
              <Badge variant="default">
                <Send className="h-3 w-3 mr-1" />
                {statusCounts.sent} sent
              </Badge>
            )}
            {statusCounts.completed > 0 && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {statusCounts.completed} completed
              </Badge>
            )}
            {statusCounts.rejected > 0 && (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                {statusCounts.rejected} rejected
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : !uscRequests || uscRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No USC requests yet. Create your first request to track umiejscowienie or uzupełnienie workflows.
          </div>
        ) : (
          <div className="space-y-3">
            {uscRequests.map((request) => (
              <USCRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </CardContent>

      <CreateUSCRequestDialog
        caseId={caseId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </Card>
  );
}
