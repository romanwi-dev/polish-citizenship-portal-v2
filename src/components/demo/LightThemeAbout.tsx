import { Shield, FileCheck, Globe, Award } from "lucide-react";

const LightThemeAbout = () => {
  const features = [
    {
      icon: Shield,
      title: "Expert Legal Guidance",
      description: "Navigate complex citizenship laws with confidence through our team of specialized immigration attorneys."
    },
    {
      icon: FileCheck,
      title: "Document Processing",
      description: "Comprehensive assistance with gathering, translating, and authenticating all required documentation."
    },
    {
      icon: Globe,
      title: "End-to-End Support",
      description: "From initial consultation to passport acquisition, we guide you through every step of the journey."
    },
    {
      icon: Award,
      title: "Proven Track Record",
      description: "Over 15 years of experience with a 98% success rate in Polish citizenship applications."
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Why Choose Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional expertise combined with personalized attention to make your citizenship journey seamless
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-card border-2 border-border rounded-2xl p-8 shadow-[var(--shadow-card-light)] hover:shadow-[var(--shadow-elevated-light)] hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex flex-col gap-6">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Card */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/20 rounded-2xl p-12 text-center shadow-[var(--shadow-elevated-light)]">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied clients who have successfully obtained their Polish citizenship
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="px-8 py-3 bg-card border-2 border-border rounded-xl">
                <p className="text-sm text-muted-foreground">Average Processing Time</p>
                <p className="text-2xl font-bold text-foreground">12-18 months</p>
              </div>
              <div className="px-8 py-3 bg-card border-2 border-border rounded-xl">
                <p className="text-sm text-muted-foreground">Client Satisfaction</p>
                <p className="text-2xl font-bold text-foreground">4.9/5.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeAbout;
