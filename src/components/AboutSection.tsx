import { Shield, Users, Globe } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Legal Expertise Since 2003</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              The Most Comprehensive Online Legal Service
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Since 2003, we have been advising people of Polish ancestry in confirming Polish citizenship by descent, obtaining a European Polish passport, and navigating all related matters. For almost 20 years, we have been working to help people of Polish descent from various countries in receiving Polish citizenship and a Polish European passport.
          </p>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our excellent legal assistance is provided by independent experts in the field of Polish citizenship, lawyers of various specializations, experienced representatives, and documents researchers, as well as the use of advice and consultations provided by the staff of the relevant Polish government offices.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="glass-card p-8 rounded-2xl hover-glow text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Over 20 Million</h3>
            <p className="text-muted-foreground">
              There are more than 20 million people of Polish descent that live outside of Poland today. Many can legally confirm their Polish citizenship by descent.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover-glow text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
              <Globe className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">EU Member Since 2004</h3>
            <p className="text-muted-foreground">
              Poland has been an EU member since 2004 and is one of its biggest countries. A Polish European passport is your gateway to the EU.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover-glow text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">EU Benefits</h3>
            <p className="text-muted-foreground">
              Freely move, travel, live, and work in any of the 28 member states. Access outstanding education, healthcare, and business opportunities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;