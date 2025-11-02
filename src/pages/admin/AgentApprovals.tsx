import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAgentApprovals, useApproveAgentTool, useRejectAgentTool } from "@/hooks/useAgentApprovals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Code } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AgentApprovals() {
  const { data: approvals, isLoading } = useAgentApprovals('pending');
  const approveMutation = useApproveAgentTool();
  const rejectMutation = useRejectAgentTool();
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const handleApprove = (approvalId: string) => {
    approveMutation.mutate({
      approvalId,
      reviewNotes: reviewNotes[approvalId],
    });
  };

  const handleReject = (approvalId: string) => {
    rejectMutation.mutate({
      approvalId,
      reviewNotes: reviewNotes[approvalId],
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Agent Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve high-risk AI agent tool executions
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading approvals...
            </CardContent>
          </Card>
        ) : approvals?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No pending approvals at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {approvals?.map((approval) => (
              <Card key={approval.id} className="border-l-4" style={{
                borderLeftColor: approval.risk_level === 'critical' || approval.risk_level === 'high' 
                  ? 'hsl(var(--destructive))' 
                  : 'hsl(var(--primary))'
              }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        {approval.tool_name}
                      </CardTitle>
                      <CardDescription>
                        {approval.ai_explanation}
                      </CardDescription>
                    </div>
                    <Badge variant={getRiskColor(approval.risk_level)}>
                      {approval.risk_level} risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tool Arguments */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Tool Arguments:</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(approval.tool_arguments, null, 2)}
                    </pre>
                  </div>

                  {/* Review Notes */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Review Notes (optional):</h4>
                    <Textarea
                      placeholder="Add notes about your decision..."
                      value={reviewNotes[approval.id] || ''}
                      onChange={(e) => setReviewNotes({ ...reviewNotes, [approval.id]: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Timestamp & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Requested {formatDistanceToNow(new Date(approval.requested_at), { addSuffix: true })}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(approval.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(approval.id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
