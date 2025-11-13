import { Check, Train, Plane, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { MainCTA } from "./ui/main-cta";
import { useState } from "react";

const FlippablePricingCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  price, 
  installment, 
  timeline, 
  features, 
  buttonText, 
  gradient, 
  iconColor, 
  checkColor, 
  badge,
  onClick 
}: { 
  icon: any; 
  title: string; 
  subtitle: string; 
  price: string; 
  installment: string; 
  timeline: string; 
  features: string[]; 
  buttonText: string; 
  gradient: string; 
  iconColor: string; 
  checkColor: string; 
  badge?: { text: string; colors: string };
  onClick: () => void;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="h-[700px] cursor-pointer"
      style={{ 
        perspective: '1000px'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front */}
        <div 
          className={`absolute inset-0 glass-card p-8 rounded-3xl hover-glow flex flex-col ${badge ? 'border-2 border-primary/50' : ''}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {badge && (
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full ${badge.colors} text-white text-sm font-semibold whitespace-nowrap min-w-[120px] text-center`}>
              {badge.text}
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-full ${gradient} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{title}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className={`text-3xl font-bold bg-clip-text text-transparent mb-2 ${gradient.replace('bg-gradient-to-br', 'bg-gradient-to-r')}`}>
              {price}
            </div>
            <div className="text-sm text-muted-foreground">{installment}</div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-1">Timeline</div>
            <div className="text-lg font-semibold">{timeline}</div>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className={`w-5 h-5 ${checkColor} mt-0.5 flex-shrink-0`} />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-4">
            <Button 
              className="w-full bg-red-900/50 hover:bg-red-900/60 text-white border-2 border-red-800/30 hover:border-red-700/50 shadow-[0_0_20px_rgba(127,29,29,0.4)] hover:shadow-[0_0_30px_rgba(127,29,29,0.6)] transition-all duration-300 hover:scale-105" 
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {buttonText}
            </Button>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 glass-card p-8 rounded-3xl flex items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className={`absolute inset-0 ${gradient} opacity-20 rounded-3xl`} />
          <div className="relative z-10 text-center">
            <p className="text-muted-foreground italic">
              Click to flip back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PricingSection = () => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="relative py-24 overflow-hidden overflow-x-hidden">
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Transparent Real Pricing</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-14">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Investment in Your Heritage
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16">
              Professional Polish citizenship by descent application services. The process involves complex legal requirements and requires expert guidance.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <FlippablePricingCard
              icon={Train}
              title="Standard"
              subtitle="Like traveling by train"
              price="€3,500"
              installment="583 EUR per installment • 6 installments"
              timeline="36-48 months average"
              features={[
                "Lower installment values",
                "Basic legal guidance",
                "Standard document processing",
                "Email support",
                "Regular case updates"
              ]}
              buttonText="Get Started"
              gradient="bg-gradient-to-br from-primary/20 to-secondary/20"
              iconColor="text-primary"
              checkColor="text-primary"
              onClick={scrollToContact}
            />

            <FlippablePricingCard
              icon={Plane}
              title="Expedited"
              subtitle="Like business class flight"
              price="€5,500 - €12,500"
              installment="611-1,389 EUR per installment • 9 installments"
              timeline="18-36 months"
              features={[
                "50% higher installment value",
                "Priority case handling",
                "Expedited document processing",
                "Phone & email support",
                "Weekly progress updates",
                "Dedicated case manager"
              ]}
              buttonText="Get Started"
              gradient="bg-gradient-to-br from-secondary/20 to-accent/20"
              iconColor="text-secondary"
              checkColor="text-secondary"
              badge={{ text: "Most Popular", colors: "bg-gradient-to-r from-primary to-secondary" }}
              onClick={scrollToContact}
            />

            <FlippablePricingCard
              icon={Zap}
              title="VIP"
              subtitle="Like flying private jet"
              price="€15,000+"
              installment="Flat fee per person"
              timeline="14-18 months"
              features={[
                "Fastest processing possible",
                "White glove service",
                "Direct government liaison",
                "24/7 support access",
                "Daily updates if needed",
                "Personal legal team",
                "All schemes included"
              ]}
              buttonText="Join Waitlist"
              gradient="bg-gradient-to-br from-accent/20 to-primary/20"
              iconColor="text-accent"
              checkColor="text-accent"
              badge={{ text: "Waitlist...", colors: "bg-gradient-to-r from-accent/80 to-primary/80" }}
              onClick={scrollToContact}
            />
          </div>
        </div>
        
        <MainCTA
          wrapperClassName="flex justify-center mt-40 mb-20"
          onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
          ariaLabel="Take the Polish Citizenship Test to check your eligibility"
        >
          Take Polish Citizenship Test
        </MainCTA>
      </div>
    </section>
  );
};

export default PricingSection;