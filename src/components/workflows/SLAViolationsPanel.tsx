import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActiveSLAViolations } from "@/hooks/useSLAViolations";
import { AlertTriangle, Clock, ExternalLink, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export const SLAViolationsPanel = () => {
  const { data: violations, isLoading } = useActiveSLAViolations();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const activeViolations = violations?.filter(v => !v.resolved) || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <div>
          <h2 className="text-2xl font-bold">SLA Violations</h2>
          <p className="text-sm text-muted-foreground">
            {activeViolations.length} active violation{activeViolations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-2">
        {activeViolations.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No active SLA violations</p>
              <p className="text-sm text-muted-foreground">
                All workflows are within SLA targets
              </p>
            </CardContent>
          </Card>
        )}

        {activeViolations.map((violation: any) => (
          <Card 
            key={violation.id}
            className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-600 text-white">
                      {violation.violation_type.replace(/_/g, ' ')}
                    </Badge>
                    {violation.delay_hours && (
                      <Badge variant="outline" className="border-red-500 text-red-600">
                        {violation.delay_hours}h overdue
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-base">
                    {violation.workflow_instances?.cases?.client_name || 'Unknown Case'}
                  </CardTitle>
                  
                  <CardDescription className="mt-1">
                    <div className="space-y-1">
                      <div>
                        Stage: <span className="font-medium">{violation.stage || violation.workflow_instances?.current_stage}</span>
                      </div>
                      <div>
                        Workflow: <span className="font-medium">{violation.workflow_instances?.workflow_type}</span>
                      </div>
                      {violation.expected_completion && (
                        <div>
                          Expected: {formatDistanceToNow(new Date(violation.expected_completion), { addSuffix: true })}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Detected {formatDistanceToNow(new Date(violation.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </CardDescription>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/cases/${violation.workflow_instances?.case_id}`)}
                  className="gap-2 shrink-0"
                >
                  View Case
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
