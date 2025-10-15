import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle2, Clock, TrendingUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DocumentsCollection = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Documents Collection Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            PART 6 - Local Documents: Birth/Marriage Certificates, Passports, Naturalization, Military Records
          </p>
        </div>

        {/* Stats Overview - Flippable Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <h3 className="text-2xl font-bold mt-1">23</h3>
                <p className="text-xs text-muted-foreground mt-1">Documents needed</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <h3 className="text-2xl font-bold mt-1">15</h3>
                <p className="text-xs text-muted-foreground mt-1">Being obtained</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <h3 className="text-2xl font-bold mt-1">42</h3>
                <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified & Filed</p>
                <h3 className="text-2xl font-bold mt-1">78</h3>
                <p className="text-xs text-muted-foreground mt-1">Complete</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="workflow" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workflow">Collection Workflow</TabsTrigger>
            <TabsTrigger value="timeline">Collection Timeline</TabsTrigger>
            <TabsTrigger value="authorities">Authority Directory</TabsTrigger>
            <TabsTrigger value="partners">Partner Network</TabsTrigger>
            <TabsTrigger value="checklist">Requirements Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Pending Stage */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Requirements Defined</h3>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="space-y-3">
                  <Card className="p-3 bg-muted/50">
                    <p className="font-medium text-sm">Case: POL-2024-005</p>
                    <p className="text-xs text-muted-foreground mt-1">Father's Birth Certificate</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">Cook County, IL</Badge>
                      <Badge variant="outline" className="text-xs">USA</Badge>
                    </div>
                  </Card>
                </div>
              </Card>

              {/* In Progress Stage */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Client Obtaining</h3>
                  <Badge variant="secondary">6</Badge>
                </div>
                <div className="space-y-3">
                  <Card className="p-3 bg-muted/50">
                    <p className="font-medium text-sm">Case: POL-2024-007</p>
                    <p className="text-xs text-muted-foreground mt-1">Naturalization Certificate</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">USCIS</Badge>
                      <Badge className="text-xs bg-amber-500">Requested</Badge>
                    </div>
                  </Card>
                </div>
              </Card>

              {/* Completed Stage */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Received & Verified</h3>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="space-y-3">
                  <Card className="p-3 bg-muted/50">
                    <p className="font-medium text-sm">Case: POL-2024-006</p>
                    <p className="text-xs text-muted-foreground mt-1">Marriage Certificate</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">Ontario, Canada</Badge>
                      <Badge className="text-xs bg-green-500">Filed</Badge>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">8-Stage Collection Process</h3>
              <div className="space-y-4">
                {[
                  { stage: 'Requirements Defined', desc: 'List of needed documents created', status: 'completed' },
                  { stage: 'Client Notified', desc: 'Client instructed on how to obtain', status: 'completed' },
                  { stage: 'Client Obtaining', desc: 'Client working to get documents', status: 'active' },
                  { stage: 'Partner Assistance', desc: 'Local partner helping with difficult requests', status: 'pending' },
                  { stage: 'Documents Received', desc: 'Documents received from client/partner', status: 'pending' },
                  { stage: 'Verification', desc: 'Checking authenticity, apostilles, certifications', status: 'pending' },
                  { stage: 'Translation Queue', desc: 'Non-English docs sent for translation', status: 'pending' },
                  { stage: 'Filed', desc: 'Documents filed in case folder', status: 'pending' }
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

          <TabsContent value="authorities" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Local Authority Directory</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Vital records offices, passport agencies, USCIS, military archives worldwide
              </p>
              
              <div className="space-y-3">
                {[
                  { 
                    name: 'Cook County Clerk - Vital Records',
                    location: 'Chicago, Illinois, USA',
                    type: 'vital_records',
                    website: 'cookcountyclerkil.gov',
                    processing: '4-6 weeks',
                    fees: '$15 certified copy'
                  },
                  {
                    name: 'USCIS - National Records Center',
                    location: 'Lee\'s Summit, Missouri, USA',
                    type: 'uscis',
                    website: 'uscis.gov',
                    processing: '8-12 weeks',
                    fees: '$65 FOIA request'
                  },
                  {
                    name: 'Ontario Service Canada',
                    location: 'Toronto, Ontario, Canada',
                    type: 'vital_records',
                    website: 'serviceontario.ca',
                    processing: '2-3 weeks',
                    fees: '$35 CAD'
                  }
                ].map((authority, index) => (
                  <Card key={index} className="p-4 bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{authority.name}</p>
                        <p className="text-sm text-muted-foreground">{authority.location}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{authority.type}</Badge>
                          <Badge variant="outline" className="text-xs">{authority.processing}</Badge>
                          <Badge variant="outline" className="text-xs">{authority.fees}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Document Retrieval Partners</h3>
              <div className="space-y-3">
                {[
                  { name: 'USA Document Services', location: 'Multiple States', cases: 12 },
                  { name: 'Canadian Vital Records Specialist', location: 'Toronto, Canada', cases: 6 },
                  { name: 'UK Document Retrieval', location: 'London, UK', cases: 4 }
                ].map((partner, index) => (
                  <Card key={index} className="p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-sm text-muted-foreground">{partner.location}</p>
                      </div>
                      <Badge>{partner.cases} active requests</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Document Requirements Checklist</h3>
              <p className="text-sm text-muted-foreground">
                Auto-generated based on family tree - tracks what documents are needed for each family member
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DocumentsCollection;
