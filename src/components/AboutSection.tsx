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
            <br />
            <span className="text-3xl md:text-4xl bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              for Polish Citizenship and Polish European Passport
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Since 2003, we have been advising people of Polish ancestry in confirming Polish citizenship by descent, obtaining a European Polish passport, and navigating all related matters. For almost 20 years, we have been working to help people of Polish descent from various countries in receiving Polish citizenship and a Polish European passport. Our excellent legal assistance is provided by independent experts in the field of Polish citizenship, lawyers of various specializations, experienced representatives, and documents researchers, as well as the use of advice and consultations provided by the staff of the relevant Polish government offices.
          </p>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Embark on your journey to obtaining Polish citizenship and enjoy the benefits of a European Polish passport. Trust us to provide you with the guidance, expertise, and support you need to navigate the complexities of the application process. Start your application today and make your Polish heritage a permanent part of your identity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="glass-card p-8 rounded-2xl hover-glow text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Over 20 Million People of Polish Descent</h3>
            <p className="text-muted-foreground">
              There are more than 20 million people of Polish descent that live outside of Poland today, which itself has a population of about 38.5 million. This means that more than 1/3 of Poles and people of Polish descent actually live outside of the country. For many generations of European unrest, people have been emigrating outside of Poland, especially in the 20th century.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover-glow text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
              <Globe className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Poland - EU Member Since 2004</h3>
            <p className="text-muted-foreground">
              Since 1989, however, the quality of life has changed for the better in Poland. Poland has been an EU member since 2004 and is one of its biggest countries. We support the idea of a united Europe, and being a European citizen is a widely held dream. Many people of Polish origin can now legally confirm their Polish citizenship by descent and obtain the Polish European passport as a gateway to the EU.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover-glow text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">The Benefits of Polish European Citizenship</h3>
            <p className="text-muted-foreground">
              The education system in Europe is outstanding and offers the best elementary schools, top high schools, and some of the world's best universities. The latest medical technology and the best pharmaceutical developments ensure that your health is in good hands in Europe. With a Polish European passport you can freely move, travel, live, and work in any of the 28 member states of the EU. Businesses enjoy the benefits of duty-free imports and exports across country borders within the member states of the European Union.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;