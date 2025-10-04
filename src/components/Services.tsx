import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, CheckCircle, Globe } from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "Document Review",
    description: "Comprehensive analysis of your family documents to determine eligibility for Polish citizenship.",
  },
  {
    icon: Users,
    title: "Genealogy Research",
    description: "Professional research to locate missing documents and establish your ancestral connection.",
  },
  {
    icon: CheckCircle,
    title: "Application Assistance",
    description: "Complete support through the citizenship application process, from start to finish.",
  },
  {
    icon: Globe,
    title: "Legal Representation",
    description: "Expert legal representation with Polish authorities and consulates worldwide.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive legal support for your Polish citizenship journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;