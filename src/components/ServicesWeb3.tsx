import { FileText, Users, CheckCircle, Globe, Cpu, Shield, Zap } from "lucide-react";

const services = [
  {
    icon: Cpu,
    title: "Expert Case Analysis",
    description: "Comprehensive evaluation of your eligibility based on years of legal experience and case knowledge.",
    color: "from-primary to-accent",
  },
  {
    icon: Shield,
    title: "Secure & Professional",
    description: "SSL encryption and certified legal professionals ensure your data and documents are handled securely.",
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
    title: "High Success Rate",
    description: "Proven track record with professional legal expertise since 2003. Results based on case-by-case evaluation.",
    color: "from-secondary to-accent",
  },
  {
    icon: Globe,
    title: "24/7 Case Monitoring",
    description: "Always here to help with continuous case monitoring and support throughout the entire process.",
    color: "from-accent to-primary",
  },
];

const ServicesWeb3 = () => {
  return (
    <section id="services" className="py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Professional Services</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-14">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Expert Legal Services
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
            Professional legal expertise for Polish citizenship by descent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index} 
                className="glass-card p-8 rounded-lg hover-glow group relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Corner Accent */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${service.color} opacity-20 blur-2xl rounded-full`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesWeb3;