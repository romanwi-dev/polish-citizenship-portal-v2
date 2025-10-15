import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSearch, Archive, Users, FileText, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ArchivesSearch = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Archives Search Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            PART 7 - Polish Documents: Track searches in Polish and international archives
          </p>
        </div>

        {/* Stats Overview - Flippable Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Polish Archives</p>
                <h3 className="text-2xl font-bold mt-1">12</h3>
                <p className="text-xs text-muted-foreground mt-1">Active searches</p>
              </div>
              <Archive className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">International</p>
                <h3 className="text-2xl font-bold mt-1">8</h3>
                <p className="text-xs text-muted-foreground mt-1">Ongoing searches</p>
              </div>
              <FileSearch className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documents Found</p>
                <h3 className="text-2xl font-bold mt-1">47</h3>
                <p className="text-xs text-muted-foreground mt-1">Total recovered</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <h3 className="text-2xl font-bold mt-1">73%</h3>
                <p className="text-xs text-muted-foreground mt-1">Documents located</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="workflow" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workflow">Workflow Board</TabsTrigger>
            <TabsTrigger value="timeline">Search Timeline</TabsTrigger>
            <TabsTrigger value="partners">Partner Management</TabsTrigger>
            <TabsTrigger value="archives">Archive Directory</TabsTrigger>
            <TabsTrigger value="templates">Document Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Planning Stage */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Search Planning</h3>
                  <Badge variant="secondary">5</Badge>
                </div>
                <div className="space-y-3">
                  <Card className="p-3 bg-muted/50">
                    <p className="font-medium text-sm">Case: POL-2024-001</p>
                    <p className="text-xs text-muted-foreground mt-1">Warsaw Archives - Birth Records</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">PGF</Badge>
                      <Badge variant="outline" className="text-xs">High Priority</Badge>
                    </div>
                  </Card>
                </div>
              </Card>

              {/* In Progress Stage */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Awaiting Response</h3>
                  <Badge variant="secondary">7</Badge>
                </div>
                <div className="space-y-3">
                  <Card className="p-3 bg-muted/50">
                    <p className="font-medium text-sm">Case: POL-2024-003</p>
                    <p className="text-xs text-muted-foreground mt-1">Lviv State Archives</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">MGF</Badge>
                      <Badge className="text-xs bg-amber-500">Letter Sent</Badge>
                    </div>
                  </Card>
                </div>
              </Card>

              {/* Completed Stage */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Documents Received</h3>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="space-y-3">
                  <Card className="p-3 bg-muted/50">
                    <p className="font-medium text-sm">Case: POL-2024-002</p>
                    <p className="text-xs text-muted-foreground mt-1">Kraków Birth Records Found</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">F</Badge>
                      <Badge className="text-xs bg-green-500">Found</Badge>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">8-Stage Archive Search Process</h3>
              <div className="space-y-4">
                {[
                  { stage: 'Search Planning', desc: 'Define scope, identify archives', status: 'completed' },
                  { stage: 'Letter Generation', desc: 'Use archive request generator', status: 'completed' },
                  { stage: 'Letter Dispatch', desc: 'Send to Polish archives', status: 'active' },
                  { stage: 'Awaiting Response', desc: '4-12 week waiting period', status: 'pending' },
                  { stage: 'Partner Research', desc: 'Local genealogist on-site work', status: 'pending' },
                  { stage: 'Documents Received', desc: 'Scan/digitize findings', status: 'pending' },
                  { stage: 'HAC Verification', desc: 'Expert review of authenticity', status: 'pending' },
                  { stage: 'Filing', desc: 'Add to case documents', status: 'pending' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-green-500 text-white' :
                      item.status === 'active' ? 'bg-primary text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.stage}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Genealogy Partners</h3>
              <div className="space-y-3">
                {[
                  { name: 'Polish Genealogy Services', location: 'Warsaw, Poland', cases: 8 },
                  { name: 'Ukraine Archives Research', location: 'Lviv, Ukraine', cases: 5 },
                  { name: 'Lithuania Document Specialists', location: 'Vilnius, Lithuania', cases: 3 }
                ].map((partner, index) => (
                  <Card key={index} className="p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-sm text-muted-foreground">{partner.location}</p>
                      </div>
                      <Badge>{partner.cases} active searches</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="archives" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Archive Directory</h3>
              <p className="text-sm text-muted-foreground">
                Database of Polish and international archives with contact information
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Archive Request Letter Generator</h3>
              <p className="text-sm text-muted-foreground">
                Generate official archive request letters in Polish/Ukrainian/Lithuanian
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ArchivesSearch;
