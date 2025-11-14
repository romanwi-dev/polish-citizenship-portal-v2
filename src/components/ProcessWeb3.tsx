import { FileSearch, Scale, Database, Globe, FileCheck, FileText, Send, Clock, CheckCircle, Award, CreditCard, Users } from "lucide-react";

const steps = [
  {
    icon: FileSearch,
    number: "01",
    title: "Initial Consultation",
    description: "Comprehensive assessment of your family heritage and Polish ancestry eligibility",
    duration: "Day 1",
    phase: "Assessment & Research",
    gradient: "from-primary to-accent",
  },
  {
    icon: Scale,
    number: "02",
    title: "Legal Case Analysis",
    description: "Expert legal review of your lineage under Polish citizenship law with success probability",
    duration: "Week 1",
    phase: "Assessment & Research",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Database,
    number: "03",
    title: "Polish Archives Research",
    description: "Systematic search through Civil Registry offices and municipal archives in Poland",
    duration: "Weeks 1-4",
    phase: "Assessment & Research",
    gradient: "from-accent to-secondary",
  },
  {
    icon: Globe,
    number: "04",
    title: "International Archives Search",
    description: "Research across Ukrainian, Lithuanian and international archives for historical documents",
    duration: "Weeks 2-6",
    phase: "Documentation & Preparation",
    gradient: "from-primary to-secondary",
  },
  {
    icon: FileCheck,
    number: "05",
    title: "Document Authentication",
    description: "Professional apostille certification and certified Polish translation services",
    duration: "Weeks 4-8",
    phase: "Documentation & Preparation",
    gradient: "from-secondary to-accent",
  },
  {
    icon: FileText,
    number: "06",
    title: "Application Preparation",
    description: "Meticulous preparation and comprehensive legal review of your citizenship application",
    duration: "Weeks 6-10",
    phase: "Documentation & Preparation",
    gradient: "from-accent to-primary",
  },
  {
    icon: Send,
    number: "07",
    title: "Government Submission",
    description: "Official submission to the Masovian Voivoda's Office in Warsaw with tracking setup",
    duration: "Week 10",
    phase: "Government Processing",
    gradient: "from-primary to-accent",
  },
  {
    icon: Clock,
    number: "08",
    title: "Government Review Process",
    description: "Polish authorities review your case while we monitor progress and handle requests",
    duration: "Months 3-18",
    phase: "Government Processing",
    gradient: "from-secondary to-primary",
  },
  {
    icon: CheckCircle,
    number: "09",
    title: "Citizenship Confirmation",
    description: "Receive official citizenship confirmation recognizing you as a Polish and EU citizen",
    duration: "Month 18",
    phase: "Citizenship Confirmation",
    gradient: "from-accent to-secondary",
  },
  {
    icon: Award,
    number: "10",
    title: "Polish Civil Documents",
    description: "Obtain official Polish birth certificate and civil acts for passport application",
    duration: "Weeks 1-2",
    phase: "Document & Passport Phase",
    gradient: "from-primary to-secondary",
  },
  {
    icon: CreditCard,
    number: "11",
    title: "EU Passport Application",
    description: "Complete Polish passport application with consulate appointment and biometric processing",
    duration: "Weeks 2-6",
    phase: "Document & Passport Phase",
    gradient: "from-secondary to-accent",
  },
  {
    icon: Users,
    number: "12",
    title: "Family Extension Services",
    description: "Assistance extending citizenship to spouse and children with ongoing EU rights support",
    duration: "Ongoing",
    phase: "Document & Passport Phase",
    gradient: "from-accent to-primary",
  },
];

const ProcessWeb3 = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border border-[#7C1328]/30">
            <Scale className="w-4 h-4 text-[#D94565]" />
            <span className="text-sm font-medium bg-gradient-to-r from-[#7C1328] to-[#D94565] bg-clip-text text-transparent">Complete Legal Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Your Journey to Polish Citizenship
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive 12-step process. Many steps are processed <span className="text-primary font-semibold">SIMULTANEOUSLY</span> to save time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="relative group"
              >
                <div className="glass-card p-6 rounded-lg hover-glow relative overflow-hidden h-full">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    {/* Icon & Number */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className={`text-4xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent opacity-40`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-2 text-foreground uppercase tracking-wide">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-semibold">{step.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Phase</span>
                        <span className="font-semibold text-primary">{step.phase}</span>
                      </div>
                    </div>
                  </div>

                  {/* Corner Glow */}
                  <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${step.gradient} opacity-20 blur-3xl rounded-full group-hover:opacity-30 transition-opacity`} />
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
                  True Realistic Processing Time
                </span>
              </h3>
              <div className="text-6xl font-bold text-foreground mb-2">1.5 - 4 years</div>
              <p className="text-muted-foreground text-lg">Professional guidance through complex legal requirements</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessWeb3;