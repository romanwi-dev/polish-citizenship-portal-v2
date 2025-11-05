/**
 * Document Activity Timeline
 * PHASE B - TASK 7: Activity timeline for document operations
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Lock, 
  Unlock, 
  Download, 
  Eye, 
  Upload, 
  Edit,
  Clock,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityEvent {
  id: string;
  document_id: string;
  event_type: string;
  event_description: string;
  user_id: string;
  metadata: any;
  created_at: string;
}

interface DocumentActivityTimelineProps {
  documentId: string;
}

const EVENT_ICONS: Record<string, any> = {
  'upload': Upload,
  'download': Download,
  'preview': Eye,
  'lock_acquired': Lock,
  'lock_released': Unlock,
  'ocr_complete': FileText,
  'edited': Edit,
};

const EVENT_COLORS: Record<string, string> = {
  'upload': 'text-blue-500',
  'download': 'text-green-500',
  'preview': 'text-purple-500',
  'lock_acquired': 'text-red-500',
  'lock_released': 'text-green-500',
  'ocr_complete': 'text-yellow-500',
  'edited': 'text-orange-500',
};

export function DocumentActivityTimeline({ documentId }: DocumentActivityTimelineProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['document-activity', documentId],
    queryFn: async () => {
      // Mock data for now - will be replaced when activity log table is created
      const mockEvents: ActivityEvent[] = [
        {
          id: '1',
          document_id: documentId,
          event_type: 'upload',
          event_description: 'Document uploaded to Dropbox',
          user_id: 'admin',
          metadata: { size: '2.4MB' },
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          document_id: documentId,
          event_type: 'preview',
          event_description: 'Document previewed',
          user_id: 'admin',
          metadata: {},
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
      return mockEvents;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity Timeline
          </CardTitle>
          <CardDescription>Loading activity...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Activity Timeline
        </CardTitle>
        <CardDescription>
          {events?.length || 0} events recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {events && events.length > 0 ? (
              events.map((event, index) => {
                const Icon = EVENT_ICONS[event.event_type] || FileText;
                const color = EVENT_COLORS[event.event_type] || 'text-gray-500';

                return (
                  <div key={event.id} className="relative pl-8 pb-4">
                    {/* Timeline line */}
                    {index < events.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-border" />
                    )}

                    {/* Icon */}
                    <div className={`absolute left-0 top-1 rounded-full p-1.5 bg-background border ${color}`}>
                      <Icon className="h-3 w-3" />
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {event.event_description}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      {event.metadata && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {event.user_id && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{event.user_id.slice(0, 8)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                No activity recorded yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
