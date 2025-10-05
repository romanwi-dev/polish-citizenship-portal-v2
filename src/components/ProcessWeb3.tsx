import { Zap, Database, Sparkles, Rocket } from "lucide-react";

const steps = [
  {
    icon: Zap,
    number: "01",
    title: "Instant AI Scan",
    description: "Upload documents and let our AI instantly analyze your eligibility",
    gradient: "from-primary to-accent",
  },
  {
    icon: Database,
    number: "02",
    title: "Blockchain Verify",
    description: "Documents secured and verified on immutable blockchain ledger",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Smart Processing",
    description: "AI-optimized application prepared with zero errors guaranteed",
    gradient: "from-accent to-secondary",
  },
  {
    icon: Rocket,
    number: "04",
    title: "Fast-Track Submit",
    description: "Direct submission to Polish authorities via secure diplomatic API",
    gradient: "from-primary to-secondary",
  },
];

const ProcessWeb3 = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-sm font-medium bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Seamless Workflow
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">Your Journey in</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Four Simple Steps
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="relative group"
              >
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}

                <div className="glass-card p-8 rounded-3xl hover-glow relative overflow-hidden h-full">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>

                    {/* Number */}
                    <div className={`text-6xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent mb-4 opacity-30`}>
                      {step.number}
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-4 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Corner Glow */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${step.gradient} opacity-20 blur-3xl rounded-full group-hover:opacity-30 transition-opacity`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="glass-card p-12 rounded-3xl max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  True Realistic Time of Processing
                </span>
              </h3>
              <div className="text-6xl font-bold text-foreground mb-2">18 - 36 months</div>
              <p className="text-muted-foreground text-lg">vs. false promises of 'fast and easy' process!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessWeb3;