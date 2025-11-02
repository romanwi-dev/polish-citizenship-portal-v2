import { AdminLayout } from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationCenter } from "@/components/workflows/NotificationCenter";
import { SLAViolationsPanel } from "@/components/workflows/SLAViolationsPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCheckSLAViolations, useCheckSLAWarnings } from "@/hooks/useWorkflowNotifications";
import { Bell, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const WorkflowNotifications = () => {
  const { mutate: checkViolations, isPending: checkingViolations } = useCheckSLAViolations();
  const { mutate: checkWarnings, isPending: checkingWarnings } = useCheckSLAWarnings();

  const handleCheckAll = () => {
    toast.info('Checking SLA violations and warnings...');
    checkViolations();
    setTimeout(() => checkWarnings(), 1000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workflow Notifications</h1>
            <p className="text-muted-foreground mt-2">
              Monitor SLA violations, deadlines, and workflow updates
            </p>
          </div>

          <Button
            onClick={handleCheckAll}
            disabled={checkingViolations || checkingWarnings}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(checkingViolations || checkingWarnings) ? 'animate-spin' : ''}`} />
            Check SLAs Now
          </Button>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="violations" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              SLA Violations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="violations" className="mt-6">
            <SLAViolationsPanel />
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>About Workflow Notifications</CardTitle>
            <CardDescription>
              Automated notification system for workflow management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>SLA Warnings:</strong> Sent 48 hours before deadline
            </div>
            <div>
              <strong>SLA Violations:</strong> Detected when deadline passes
            </div>
            <div>
              <strong>Stage Transitions:</strong> Notified when workflow moves to new stage
            </div>
            <div>
              <strong>Assignments:</strong> Alerted when workflow assigned to you
            </div>
            <div>
              <strong>Completions:</strong> Confirmed when workflow finishes
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default WorkflowNotifications;
