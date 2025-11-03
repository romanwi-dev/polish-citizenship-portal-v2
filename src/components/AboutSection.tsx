import { Shield, Users, Globe } from "lucide-react";
import { Button } from "./ui/button";

const AboutSection = () => {
  return (
    <section className="relative py-32 overflow-hidden overflow-x-hidden">
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Legal Expertise Since 2003</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-14 tracking-tight animate-scale-in">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              The Most Comprehensive Online Legal Service for Polish Citizenship and Polish European Passport
            </span>
          </h2>
          
          <div className="mb-16">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 text-left px-4 md:px-0">
              Since 2003, we have been advising people of Polish ancestry in confirming Polish citizenship by descent, obtaining a European Polish passport, and navigating all related matters. For almost 20 years, we have been working to help people of Polish descent from various countries in receiving Polish citizenship and a Polish European passport. Our excellent legal assistance is provided by independent experts in the field of Polish citizenship, lawyers of various specializations, experienced representatives, and documents researchers, as well as the use of advice and consultations provided by the staff of the relevant Polish government offices.
            </p>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-left px-4 md:px-0">
              Embark on your journey to obtaining Polish citizenship and enjoy the benefits of a European Polish passport. Trust us to provide you with the guidance, expertise, and support you need to navigate the complexities of the application process. Start your application today and make your Polish heritage a permanent part of your identity.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="glass-card p-8 rounded-lg hover-glow text-center transition-transform duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">Over 20 Million People of Polish Descent</h3>
            <p className="text-muted-foreground">
              There are more than 20 million people of Polish descent that live outside of Poland today, which itself has a population of about 38.5 million. This means that more than 1/3 of Poles and people of Polish descent actually live outside of the country. For many generations of European unrest, people have been emigrating outside of Poland, especially in the 20th century.
            </p>
          </div>

          <div className="glass-card p-8 rounded-lg hover-glow text-center transition-transform duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
              <Globe className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">Poland - EU Member Since 2004</h3>
            <p className="text-muted-foreground">
              Since 1989, however, the quality of life has changed for the better in Poland. Poland has been an EU member since 2004 and is one of its biggest countries. We support the idea of a united Europe, and being a European citizen is a widely held dream. Many people of Polish origin can now legally confirm their Polish citizenship by descent and obtain the Polish European passport as a gateway to the EU.
            </p>
          </div>

          <div className="glass-card p-8 rounded-lg hover-glow text-center transition-transform duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">The Benefits of Polish European Citizenship</h3>
            <p className="text-muted-foreground">
              The education system in Europe is outstanding and offers the best elementary schools, top high schools, and some of the world's best universities. The latest medical technology and the best pharmaceutical developments ensure that your health is in good hands in Europe. With a Polish European passport you can freely move, travel, live, and work in any of the 28 member states of the EU.
            </p>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="flex justify-center mt-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Button 
            size="lg" 
            className="text-lg md:text-2xl font-bold px-8 py-4 md:px-20 md:py-6 h-auto min-h-[48px] rounded-lg bg-red-900/60 hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-800/40 hover:border-red-700/60 transition-all duration-300 hover:scale-105" 
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            aria-label="Take the Polish Citizenship Test to check your eligibility"
          >
            <span className="relative z-10 font-bold drop-shadow-lg">
              Take Polish Citizenship Test
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-800/30 to-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
