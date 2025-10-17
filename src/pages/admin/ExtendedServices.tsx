import { AdminLayout } from "@/components/AdminLayout";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, FileText, Globe, Heart, Briefcase } from "lucide-react";

const EXTENDED_SERVICES = [
  {
    id: 'family-legal',
    title: 'Extended Family Legal Services',
    description: 'Comprehensive legal assistance for family members seeking Polish citizenship',
    icon: Users,
    status: 'active',
    color: 'bg-blue-500/20 text-blue-400'
  },
  {
    id: 'document-procurement',
    title: 'Document Procurement Assistance',
    description: 'Specialized help in obtaining difficult-to-access historical documents',
    icon: FileText,
    status: 'active',
    color: 'bg-green-500/20 text-green-400'
  },
  {
    id: 'international-coordination',
    title: 'International Coordination',
    description: 'Coordination with foreign authorities and embassies for document verification',
    icon: Globe,
    status: 'active',
    color: 'bg-purple-500/20 text-purple-400'
  },
  {
    id: 'heritage-research',
    title: 'Heritage Research',
    description: 'In-depth genealogical research and family history documentation',
    icon: Heart,
    status: 'active',
    color: 'bg-pink-500/20 text-pink-400'
  },
  {
    id: 'relocation-support',
    title: 'Relocation Support',
    description: 'Assistance with moving to Poland, finding housing, and settling in',
    icon: Briefcase,
    status: 'coming-soon',
    color: 'bg-amber-500/20 text-amber-400'
  }
];

export default function ExtendedServices() {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Extended Services
            </h1>
            <p className="text-muted-foreground mt-2">
              Additional premium services for comprehensive citizenship support
            </p>
          </div>
        </div>

        <WorkflowNavigation />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {EXTENDED_SERVICES.map((service) => {
            const Icon = service.icon;
            
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className={`p-3 rounded-lg ${service.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                      {service.status === 'active' ? 'Active' : 'Coming Soon'}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{service.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Case-by-case pricing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Personalized approach</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Expert consultation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About Extended Services</CardTitle>
            <CardDescription>
              Comprehensive support beyond standard citizenship processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our Extended Services program provides additional support for complex cases and families
              who need comprehensive assistance beyond the standard citizenship application process.
            </p>
            <p className="text-sm text-muted-foreground">
              These services are tailored to each client's unique situation and are available as
              add-ons to any citizenship application package.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
