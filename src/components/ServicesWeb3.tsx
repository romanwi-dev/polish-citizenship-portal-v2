import { FileText, Users, CheckCircle, Globe, Cpu, Shield } from "lucide-react";

const services = [
  {
    icon: Cpu,
    title: "AI Eligibility Check",
    description: "Advanced AI analyzes your ancestry in seconds, providing instant eligibility assessment.",
    color: "from-primary to-accent",
  },
  {
    icon: Shield,
    title: "Blockchain Verification",
    description: "Secure, immutable document verification on the blockchain for maximum trust.",
    color: "from-secondary to-primary",
  },
  {
    icon: Users,
    title: "Smart Genealogy",
    description: "AI-powered research across global databases to trace your Polish heritage.",
    color: "from-accent to-secondary",
  },
  {
    icon: FileText,
    title: "Digital Application",
    description: "Fully digital, paperless application process with real-time status tracking.",
    color: "from-primary to-secondary",
  },
  {
    icon: CheckCircle,
    title: "Auto-Compliance",
    description: "Automated compliance checks ensure your application meets all requirements.",
    color: "from-secondary to-accent",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Connected to consulates worldwide via our secure diplomatic network.",
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
          <div className="inline-block px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Next-Gen Services
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Powered by Innovation
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cutting-edge technology meets legal expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index} 
                className="glass-card p-8 rounded-3xl hover-glow group relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
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