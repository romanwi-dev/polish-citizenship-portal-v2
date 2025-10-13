import { FileText, Users, CheckCircle, Globe, Cpu, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: Cpu,
    title: "AI Deep Case Analysis",
    description: "Predict success probability and timeline with high accuracy based on 20+ years of case history and 180+ data points.",
    color: "from-primary to-accent",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "256-bit SSL encryption and certified legal professionals ensure your data and documents are secure.",
    color: "from-secondary to-primary",
  },
  {
    icon: Users,
    title: "Expert Legal Guidance",
    description: "Independent experts, specialized lawyers, and experienced representatives guide you through every step.",
    color: "from-accent to-secondary",
  },
  {
    icon: FileText,
    title: "Complete Document Processing",
    description: "Systematic research through Polish, Ukrainian, and Lithuanian archives with professional authentication.",
    color: "from-primary to-secondary",
  },
  {
    icon: CheckCircle,
    title: "100% Success Rate",
    description: "Proven track record with 25,000+ successfully processed cases since 2003.",
    color: "from-secondary to-accent",
  },
  {
    icon: Globe,
    title: "24/7 Case Monitoring",
    description: "Always here to help with continuous case monitoring and support throughout the entire process.",
    color: "from-accent to-primary",
  },
];

const FlippableServiceCard = ({ service, index }: { service: typeof services[0]; index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = service.icon;

  return (
    <div 
      className="h-[280px] perspective-1000"
      style={{ 
        animationDelay: `${index * 100}ms`
      }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-700 transform-style-3d",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow group overflow-hidden backface-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {service.title}
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed font-medium">
              {service.description}
            </p>
          </div>

          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${service.color} opacity-20 blur-2xl rounded-full`} />
        </div>

        {/* Back of card - Placeholder for admin editing */}
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg overflow-hidden flex items-center justify-center backface-hidden rotate-y-180"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-20`} />
          
          <div className="relative z-10 text-center">
            <p className="text-muted-foreground italic">
              [Admin: Add custom content here]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicesWeb3 = () => {
  return (
    <section id="services" className="py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Next-Gen Services</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-14 tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Powered by Innovation
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
            Professional legal expertise combined with cutting-edge AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <FlippableServiceCard key={index} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesWeb3;