import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Building2, Users, BarChart3 } from "lucide-react";

const PolishCivilActs = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Polish Civil Acts</h1>
          <p className="text-muted-foreground">
            PART 10 - Manage Polish civil registry documents (birth and marriage certificates)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <FileCheck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Preparing</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Building2 className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Awaiting</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="workflow" className="w-full">
          <TabsList>
            <TabsTrigger value="workflow">Workflow Cards</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="directory">USC Directory</TabsTrigger>
            <TabsTrigger value="agent">Civil Acts Agent</TabsTrigger>
            <TabsTrigger value="payment">Payment Tracker</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-4">
            <Card className="p-6">
              <p className="text-muted-foreground">Workflow board coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card className="p-6">
              <p className="text-muted-foreground">8-stage timeline visualization coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="directory" className="space-y-4">
            <Card className="p-6">
              <p className="text-muted-foreground">Polish Civil Registry offices database coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="agent" className="space-y-4">
            <Card className="p-6">
              <p className="text-muted-foreground">Civil Acts Agent supervision dashboard coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card className="p-6">
              <p className="text-muted-foreground">Payment tracking coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default PolishCivilActs;
