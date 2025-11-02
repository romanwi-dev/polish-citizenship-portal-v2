import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  useWorkflowNotifications, 
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead 
} from "@/hooks/useWorkflowNotifications";
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Check,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NotificationCenterProps {
  userId?: string;
}

export const NotificationCenter = ({ userId }: NotificationCenterProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);
  
  useEffect(() => {
    if (!userId) {
      supabase.auth.getUser().then(({ data }) => {
        setCurrentUserId(data.user?.id);
      });
    }
  }, [userId]);

  const { data: notifications, isLoading } = useWorkflowNotifications(currentUserId);
  const { data: unreadCount } = useUnreadNotificationsCount(currentUserId);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'sla_warning': 'SLA Warning',
      'sla_violated': 'SLA Violation',
      'stage_transition': 'Stage Update',
      'assignment': 'New Assignment',
      'completion': 'Completed'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              {unreadCount || 0} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {unreadCount && unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => currentUserId && markAllAsRead(currentUserId)}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground">
                You're all caught up!
              </p>
            </CardContent>
          </Card>
        )}

        {notifications?.map((notification) => (
          <Card 
            key={notification.id}
            className={`${!notification.read_at ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getSeverityIcon(notification.severity)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                      {!notification.read_at && (
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      )}
                    </div>
                    
                    <CardDescription className="text-sm">
                      {notification.message}
                    </CardDescription>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className={`${getSeverityBadgeColor(notification.severity)} text-xs`}>
                        {getTypeLabel(notification.notification_type)}
                      </Badge>
                      
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {!notification.read_at && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="shrink-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
