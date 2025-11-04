import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CheckCircle2, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export const SyncHistoryLog = () => {
  const { data: syncLogs, isLoading } = useQuery({
    queryKey: ['dropbox-sync-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hac_logs')
        .select('*')
        .eq('action_type', 'dropbox_resync')
        .order('performed_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate some stats from history
  const totalSyncs = syncLogs?.length || 0;
  const successfulSyncs = syncLogs?.filter(log => 
    log.action_details && !log.action_details.toLowerCase().includes('error')
  ).length || 0;

  const getStatusIcon = (log: any) => {
    if (log.action_details && log.action_details.toLowerCase().includes('error')) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const parseLogDetails = (log: any) => {
    try {
      // Try to extract numbers from action_details
      const desc = log.action_details || '';
      const casesMatch = desc.match(/(\d+)\s+cases?/i);
      const docsMatch = desc.match(/(\d+)\s+documents?/i);
      const unmatchedMatch = desc.match(/(\d+)\s+unmatched/i);

      return {
        cases: casesMatch ? parseInt(casesMatch[1]) : '-',
        docs: docsMatch ? parseInt(docsMatch[1]) : '-',
        unmatched: unmatchedMatch ? parseInt(unmatchedMatch[1]) : '-',
      };
    } catch {
      return { cases: '-', docs: '-', unmatched: '-' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Syncs</p>
              <p className="text-2xl font-bold">{totalSyncs}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-2xl font-bold text-green-500">{successfulSyncs}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">
                {totalSyncs > 0 ? Math.round((successfulSyncs / totalSyncs) * 100) : 0}%
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Sync History Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sync History</h3>
          
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Cases Updated</TableHead>
                  <TableHead>Docs Updated</TableHead>
                  <TableHead>Unmatched</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Loading sync history...
                    </TableCell>
                  </TableRow>
                ) : syncLogs && syncLogs.length > 0 ? (
                  syncLogs.map((log) => {
                    const details = parseLogDetails(log);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>{getStatusIcon(log)}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(log.performed_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{details.cases}</TableCell>
                        <TableCell className="font-mono text-sm">{details.docs}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {typeof details.unmatched === 'number' && details.unmatched > 0 ? (
                            <span className="text-yellow-500">{details.unmatched}</span>
                          ) : (
                            details.unmatched
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                          {log.action_details}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No sync history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
};
