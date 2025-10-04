import { Shield, Award, Clock, Users2 } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "100% Success Rate",
    description: "Track record of successful citizenship confirmations for eligible clients",
  },
  {
    icon: Award,
    title: "Licensed Experts",
    description: "Polish legal professionals with specialized citizenship law expertise",
  },
  {
    icon: Clock,
    title: "Fast Processing",
    description: "Streamlined approach to minimize waiting time for your application",
  },
  {
    icon: Users2,
    title: "Personalized Service",
    description: "Dedicated support throughout your entire citizenship journey",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose Us
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trusted expertise in Polish citizenship by descent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 border border-border">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-6 text-foreground">
              EU Citizenship Benefits
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">27</div>
                <p className="text-muted-foreground">EU Countries Access</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">∞</div>
                <p className="text-muted-foreground">Live & Work Freely</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">Family Coverage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;